const { enterGame } = require('./setup.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('../scripts/serve.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const sizes = [[1366,768,false],[1024,600,false],[390,844,false],[320,640,true],[844,390,false],[768,1024,false]];
async function main() {
  const server = createServer().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  let browser;
  const artifacts = path.join(os.tmpdir(), 'ludo-sprint7');
  fs.mkdirSync(artifacts, { recursive: true });
  try {
    const url = 'http://127.0.0.1:' + server.address().port;
    for (const asset of ['/', '/index.html', '/css/styles.css', '/js/app.js', '/js/game/rules.mjs', '/PandaSoftLogo.png']) {
      const response = await fetch(url + asset);
      assert.equal(response.status, 200, asset);
      if (asset.endsWith('.mjs')) assert(response.headers.get('content-type').includes('javascript'));
      await response.arrayBuffer();
    }
    for (const asset of ['/.git/config', '/docs/roadmap.md', '/js/%2e%2e%5cpackage.json', '/missing', '/%ZZ']) {
      const response = await fetch(url + asset); assert(response.status >= 400, asset); await response.text();
    }
    browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
    for (const [width,height,reduced] of sizes) {
      const context = await browser.newContext({viewport:{width,height}, reducedMotion:reduced?'reduce':'no-preference', hasTouch:width<900, isMobile:width<900});
      // The game also works when the optional Google Fonts are unavailable.
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.clock.install(); await page.goto(url); await page.clock.runFor(2800);
      const layout = async () => {
        const box = await page.locator('.app-shell').evaluate(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight}));
        assert(box.sw <= box.w, JSON.stringify({width,height,...box}));
        if(width>900) assert(box.sh <= box.h, JSON.stringify({width,height,...box}));
      };
      await layout(); await page.screenshot({animations:'disabled',path:path.join(artifacts,'home-'+width+'.png')});
      await page.locator('#start-button').focus(); await page.keyboard.press('Enter'); await enterGame(page);
      await layout();
      await page.evaluate(()=>{Math.random=()=>.99});
      // Repeated events must not start two rolls or two token movements.
      await page.locator('#dice-control').dispatchEvent('click'); await page.locator('#dice-control').dispatchEvent('click');
      await page.keyboard.press('Escape'); assert(await page.locator('#dice-modal').evaluate(e=>e.open));
      await page.clock.runFor(920);
      assert.equal(await page.locator('#rolling-die').getAttribute('data-value'),'6');
      await page.screenshot({animations:'disabled',path:path.join(artifacts,'six-'+width+'.png')});
      assert(await page.locator('#dice-modal').evaluate(e=>e.scrollWidth<=e.clientWidth));
      assert(await page.locator('#dice-modal-action').evaluate(e=>{
        const button=e.getBoundingClientRect(), modal=e.closest('dialog').getBoundingClientRect();
        return button.top>=modal.top && button.bottom<=modal.bottom;
      }), 'Dice action must be visible without scrolling');
      await page.locator('#dice-modal-action').click();
      await page.locator('#back-button').click();
      assert.equal(await page.locator('#start-button span').first().textContent(),'Continuar partida');
      await enterGame(page);
      assert(await page.locator('.token-choice[data-token-id="blue-1"]').evaluate(e=>e===document.activeElement));
      await page.locator('.token-choice[data-token-id="blue-1"]').dispatchEvent('click');
      await page.locator('.token-choice[data-token-id="blue-2"]').dispatchEvent('click');
      await page.clock.runFor(1200);
      assert.equal(await page.locator('.token-choice[data-token-id="blue-1"]').getAttribute('data-progress'),'0');
      assert.equal(await page.locator('.token-choice[data-token-id="blue-2"]').getAttribute('data-progress'),'-1');
      await layout(); await page.screenshot({animations:'disabled',path:path.join(artifacts,'board-'+width+'.png')});
      await page.reload(); await page.clock.runFor(2800); await enterGame(page);
      assert.equal(await page.locator('.token-choice[data-progress="-1"]').count(),16);
      assert.equal(await page.locator('#board-screen').getAttribute('data-phase'),'waiting-roll');
      assert.deepEqual(errors,[]);
      console.log('PASS Sprint 7 smoke '+width+'x'+height+' reduced='+reduced);
      await context.close();
    }
    const context = await browser.newContext();
    const page = await context.newPage(); await page.clock.install();
    await context.route('**/PandaSoftLogo.png', async route => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.abort().catch(()=>{});
    });
    await page.goto(url, {waitUntil:'domcontentloaded'}); await page.clock.runFor(5100);
    assert.equal(await page.locator('#intro-screen').count(),0);
    assert.equal(await page.locator('.app-shell').evaluate(e=>e.inert),false);
    await context.close(); console.log('PASS delayed intro asset fallback');
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
  if (process.env.LUDO_SMOKE_ONLY === '1') return;
  const child = spawn(process.execPath, [path.join(__dirname,'sprint6.browser.cjs')], {
    stdio:'inherit', env:{...process.env,LUDO_VIEWPORTS:JSON.stringify(sizes),LUDO_ARTIFACTS:'ludo-sprint7'}
  });
  await new Promise((resolve,reject)=>{
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error('Full-game regression failed: '+code)));
  });
}
main().catch(error=>{console.error(error);process.exitCode=1;});

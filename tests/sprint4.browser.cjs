const { enterGame } = require('./setup.cjs');
// Run with PLAYWRIGHT_MODULE pointing to an installed playwright package.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(os.tmpdir(), 'ludo-sprint4');
async function main() {
  fs.mkdirSync(artifacts, { recursive: true });
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + (req.url === '/' ? '/index.html' : req.url));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    try {
      res.setHeader('Content-Type', /\.m?js$/.test(file) ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : 'text/html');
      res.end(fs.readFileSync(file));
    } catch { res.writeHead(404); res.end(); }
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
  try {
    for (const [width,height,reduced] of [[1366,768,false],[1024,600,false],[390,844,false],[320,640,true]]) {
      const context = await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:reduced?'reduce':'no-preference'});
      const page = await context.newPage();
      const errors=[]; page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:' + server.address().port);
      await page.waitForSelector('#intro-screen',{state:'detached'});
      await page.evaluate(() => document.fonts.ready);
      await enterGame(page);
      const phase = value => page.waitForFunction(v => document.querySelector('#board-screen').dataset.phase===v, value);
      const card = id => page.locator('.token-choice[data-token-id="'+id+'"]');
      const progress = id => card(id).getAttribute('data-progress').then(Number);
      const choose = async id => {
        if(width<900)await card(id).tap();
        else {await card(id).focus();await page.keyboard.press('Enter');}
        await phase('waiting-roll');
      };
      const roll = async value => {
        await page.evaluate(v => {Math.random=() => (v-0.5)/6;}, value);
        await page.locator('#dice-control').click();
        await phase('rolling');
        await page.keyboard.press('Escape');
        assert(await page.locator('#dice-modal').evaluate(el=>el.open));
        assert(await page.locator('#dice-control').isDisabled());
        await phase('roll-result');
        assert.equal(await page.locator('.dice-side:visible').getAttribute('data-face'),String(value));
      };
      const select = async () => {await page.locator('#dice-modal-action').click();await phase('choosing-token');};
      const layout = async () => {
        const d=await page.locator('.app-shell').evaluate(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight}));
        assert(d.sw<=d.w, JSON.stringify(d));
        if(width>900)assert(d.sh<=d.h, JSON.stringify(d));
        assert(await card('blue-1').evaluate(e=>e.getBoundingClientRect().width>=44));
      };
      await layout();
      // No legal home exits on 1-5; automatic turn and wraparound.
      for(const value of [1,2,3,4]) {await roll(value);await phase('waiting-roll');}
      assert.equal(await page.locator('#turn-label').textContent(),'Turno de Eri');
      await roll(6);await select();
      assert.equal(await page.locator('.token-choice:enabled').count(),4);
      await card('yellow-1').dispatchEvent('click');assert.equal(await progress('yellow-1'),-1);
      // Resume an unresolved choice after visiting the home screen.
      await page.locator('#back-button').click();await enterGame(page);await phase('choosing-token');
      await choose('blue-1');assert.equal(await progress('blue-1'),0);
      assert.equal(await page.locator('#turn-label').textContent(),'Turno de Eri');
      await roll(6);
      assert((await page.locator('#dice-message').textContent()).includes('ocupada'));
      await select();
      assert.equal(await page.locator('.token-choice:enabled').count(),1);
      assert(await card('blue-2').isDisabled());
      await card('blue-2').dispatchEvent('click');assert.equal(await progress('blue-2'),-1);
      await page.evaluate(()=>{
        window.steps=[];
        const el=document.querySelector('.token-choice[data-token-id="blue-1"]');
        new MutationObserver(records=>{for(const record of records){const value=Number(el.dataset.progress);if(record.attributeName==='data-progress'&&window.steps.at(-1)!==value)window.steps.push(value);}}).observe(el,{attributes:true});
      });
      await card('blue-1').dispatchEvent('click');
      await card('blue-2').dispatchEvent('click');
      await phase('waiting-roll');assert.equal(await progress('blue-1'),6);assert.equal(await progress('blue-2'),-1);
      if(!reduced)assert.deepEqual(await page.evaluate(()=>window.steps),[1,2,3,4,5,6]);
      // Vacating the start enables release; landing on an own active piece is blocked too.
      await roll(6);await select();await choose('blue-2');assert.equal(await progress('blue-2'),0);
      await roll(6);await select();
      assert.equal(await page.locator('.token-choice:enabled').count(),1);
      assert(await card('blue-2').isDisabled());
      await card('blue-2').dispatchEvent('click');assert.equal(await progress('blue-2'),0);
      await choose('blue-1');assert.equal(await progress('blue-1'),12);
      await roll(3);await select();
      assert.equal(await page.locator('.token-choice:enabled').count(),2);
      // Move using the board as well as the large equivalent card control.
      await page.locator('.board-piece[data-token-id="blue-1"]').click();await phase('waiting-roll');
      assert.equal(await progress('blue-1'),15);
      assert.equal(await page.locator('#turn-label').textContent(),'Turno de Diego');
      await layout();
      await page.screenshot({path:path.join(artifacts,'board-'+width+'.png')});
      assert.deepEqual(errors,[]);
      console.log('PASS '+width+'x'+height+' reduced='+reduced);
      await context.close();
    }
  } finally { await browser.close(); server.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});

const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { createServer } = require('../scripts/serve.cjs');
const { enterGame } = require('./setup.cjs');
const assert = require('node:assert/strict');
(async()=>{
  const server=createServer().listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  let browser;
  try {
    browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL || 'msedge',headless:true});
    for(const width of [1280,320]) {
      const p=await browser.newPage({viewport:{width,height:800},reducedMotion:'reduce'});
      const errors=[];p.on('pageerror',e=>errors.push(e.message));
      await p.clock.install();await p.goto('http://127.0.0.1:'+server.address().port);await p.clock.runFor(5100);
      await enterGame(p);
      const token=id=>p.locator('.token-choice[data-token-id="'+id+'"]');
      const roll=async(value,id,opening=false)=>{
        await p.evaluate(v=>Math.random=()=>(v-.5)/6,value);
        await p.locator('#dice-control').click();await p.clock.runFor(920);
        assert.equal((await p.locator('#dice-message').textContent()).includes('Primera salida gratis'),opening);
        await p.locator('#dice-modal-action').click();
        if(!id) return;
        assert(await token(id).isEnabled());
        if(!opening && value!==6) assert.equal(await p.locator('.player-'+id.split('-')[0]+' .token-choice[data-progress="-1"]:enabled').count(),0);
        await token(id).click();
      };
      const colors=['blue','yellow','red','green'];
      const corners=[[6,6],[6,8],[8,8],[8,6]];
      for(let i=0;i<4;i++) {
        const id=colors[i]+'-1';await roll(5,id,true);
        assert.equal(await token(id).getAttribute('data-progress'),'5');
        const position=await p.locator('.board-piece[data-token-id="'+id+'"]').evaluate(e=>[parseFloat(e.style.top),parseFloat(e.style.left)]);
        corners[i].forEach((coordinate,axis)=>assert(Math.abs(position[axis]-(coordinate+.5)/15*100)<.001));
      }
      for(const color of colors) await roll(1,color+'-1');
      // Play all four blue pieces to the exact center using the public controls.
      for(let n=1;n<=4;n++) {
        const id='blue-'+n;
        if(n>1) await roll(6,id);
        for(let k=0;k<(n===1?9:10);k++) await roll(6,id);
        assert.equal(await token(id).getAttribute('data-progress'),'60');
        await roll(1,id);assert.equal(await token(id).getAttribute('data-progress'),'61');
        if(n<4) for(const color of colors.slice(1)) await roll(1,await token(color+'-1').getAttribute('data-progress')==='-1'?null:color+'-1');
      }
      assert(await p.locator('#victory-modal').isVisible());
      await p.locator('#restart-button').click();
      await roll(2,'blue-1',true);
      assert.equal(await token('blue-1').getAttribute('data-progress'),'2');
      assert.deepEqual(errors,[]);await p.close();
      console.log('PASS opening, four corners, exact victory and reset at '+width+'px');
    }
  } finally { await browser?.close();server.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});

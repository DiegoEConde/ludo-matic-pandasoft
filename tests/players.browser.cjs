const { enterGame } = require('./setup.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {createServer}=require('../scripts/serve.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
async function main(){
 const server=createServer().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 let browser;
 try {
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const artifacts=path.join(os.tmpdir(),'ludo-players');fs.mkdirSync(artifacts,{recursive:true});
  for(const [count,width,height] of [[2,1024,600],[2,320,640],[3,1024,600],[3,844,390]]){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<900,isMobile:width<900});
   await context.route('https://fonts.googleapis.com/**',route=>route.abort());
   const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.clock.install();await p.goto('http://127.0.0.1:'+server.address().port);await p.clock.runFor(5100);
   const select=n=>p.locator('label').filter({has:p.locator('input[value="'+n+'"]')}).click();
   await select(count);
   const layout=async()=>{const d=await p.locator('.app-shell').evaluate(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight}));assert(d.sw<=d.w,JSON.stringify(d));if(width>900)assert(d.sh<=d.h,JSON.stringify(d));};
   await layout();await p.screenshot({path:path.join(artifacts,'setup-'+count+'-'+width+'.png'),animations:'disabled'});
   await enterGame(p);await layout();
   assert.equal(await p.locator('.player-card:visible').count(),count);
   assert.equal(await p.locator('.token-choice').count(),count*4);
   const names=count===2?['Eri','Melina']:['Eri','Diego','Melina'];
   const roll=async(value,id)=>{
    await p.evaluate(v=>Math.random=()=>(v-.5)/6,value);
    await p.locator('#dice-control').click();await p.clock.runFor(920);await p.locator('#dice-modal-action').click();
    if(id){await p.locator('.token-choice[data-token-id="'+id+'"]').click();await p.clock.runFor(1200);}
   };
   for(let i=0;i<count;i++){
    assert.equal(await p.locator('#turn-label').textContent(),'Turno de '+names[i]);await roll(1);
   }
   assert.equal(await p.locator('#turn-label').textContent(),'Turno de Eri');
   // Finish a real game using only the UI; non-participants never get a turn.
   for(let number=1;number<=4;number++){
    const id='blue-'+number;await roll(6,id);
    for(let step=0;step<9;step++)await roll(6,id);
    await roll(3,id);
    if(number<4)for(let other=1;other<count;other++)await roll(1);
   }
   assert.equal(await p.locator('#board-screen').getAttribute('data-phase'),'won');
   assert.equal(await p.locator('#victory-results li').count(),count);
   await p.locator('#restart-button').click();
   assert.equal(await p.locator('.token-choice[data-progress="-1"]').count(),count*4);
   await roll(6,'blue-1');
   await p.locator('#back-button').click();
   await select(count===2?3:2);
   assert.equal(await p.locator('#start-button span').first().textContent(),'Empezar nueva partida');
   await p.locator('#cancel-names-button').click();
   assert.equal(await p.locator('#start-button span').first().textContent(),'Continuar partida');
   await enterGame(p);
   assert.equal(await p.locator('.token-choice[data-token-id="blue-1"]').getAttribute('data-progress'),'0');
   await p.locator('#back-button').click();await select(4);await enterGame(p);
   assert.equal(await p.locator('.token-choice[data-progress="-1"]').count(),16);
   assert.equal(await p.locator('.player-card:visible').count(),4);
   assert.equal(await p.locator('#turn-label').textContent(),'Turno de Eri');
   assert.deepEqual(errors,[]);console.log('PASS '+count+' players '+width+'x'+height);await context.close();
  }
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

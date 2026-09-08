const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {createServer}=require('../scripts/serve.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
async function main(){
 const server=createServer().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let browser;
 try{
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const artifacts=path.join(os.tmpdir(),'ludo-names');fs.mkdirSync(artifacts,{recursive:true});
  for(const [width,height] of [[1024,600],[320,640]]){
   const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce',hasTouch:width<900,isMobile:width<900});
   const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
   await p.clock.install();await p.goto('http://127.0.0.1:'+server.address().port);await p.clock.runFor(5100);
   await p.locator('label').filter({has:p.locator('input[value="2"]')}).click();
   assert.equal(await p.locator('.name-field:visible').count(),2);
   const blue=p.locator('#name-blue'), red=p.locator('#name-red');
   assert(await p.locator('#names-modal').evaluate(e=>e.open));
   assert.equal(await blue.inputValue(),'');assert.equal(await red.inputValue(),'');
   assert.equal(await p.locator('label[for="name-blue"]').textContent(),'Jugador 1');
   await p.getByRole('button',{name:'Ver nombres para jugador 1'}).click();
   assert.deepEqual(await p.locator('#name-options [role="option"]').allTextContents(),['Eri','Melina','Diego','Gustavo']);
   for(const name of ['Ana','Analia','Pedro','Luz','Juan']){await blue.fill(name);await blue.press('Enter');}
   await p.reload();await p.clock.runFor(5100);
   await p.locator('label').filter({has:p.locator('input[value="2"]')}).click();
   await p.getByRole('button',{name:'Ver nombres para jugador 1'}).click();
   const list=p.locator('#name-options');assert.equal(await list.locator('[role="option"]').count(),9);
   assert(await list.evaluate(e=>e.scrollHeight>e.clientHeight && e.clientHeight<=264));
   await blue.press('ArrowUp');
   assert(await list.evaluate(e=>e.scrollTop>0));
   await blue.press('Enter');assert.equal(await blue.inputValue(),'Juan');
   await blue.fill('an');
   assert.deepEqual((await list.locator('[role="option"]').allTextContents()).slice(0,3),['Ana','Analia','Juan']);
   await blue.press('ArrowDown');await blue.press('Enter');assert.equal(await blue.inputValue(),'Ana');
   await red.fill('mel');await red.press('ArrowDown');await red.press('Enter');assert.equal(await red.inputValue(),'Melina');
   await blue.fill('');await blue.press('Tab');await p.locator('#confirm-names-button').click();assert(await p.locator('#home-screen').isVisible());
   await blue.fill('Ana');await blue.press('Enter');
   await p.getByRole('button',{name:'Ver nombres para jugador 1'}).click();
   await p.screenshot({path:path.join(artifacts,'names-'+width+'.png'),animations:'disabled'});
   await blue.press('Escape');await p.locator('#confirm-names-button').click();
   assert.equal(await p.locator('.player-blue h3').textContent(),'Ana');assert.equal(await p.locator('.player-red h3').textContent(),'Melina');
   assert.equal(await p.locator('#turn-label').textContent(),'Turno de Ana');
   assert((await p.locator('.token-choice[data-token-id="blue-1"]').getAttribute('aria-label')).startsWith('Ana,'));
   const roll=async(value,id)=>{
    await p.evaluate(v=>Math.random=()=>(v-.5)/6,value);await p.locator('#dice-control').click();await p.clock.runFor(920);await p.locator('#dice-modal-action').click();
    if(id){await p.locator('.token-choice[data-token-id="'+id+'"]').click();await p.clock.runFor(1200);}
   };
   // Complete a real game to verify winner, summary and rematch use chosen names.
   for(let n=1;n<=4;n++){
    const id='blue-'+n;await roll(6,id);for(let i=0;i<9;i++)await roll(6,id);await roll(3,id);
    if(n<4){assert.equal(await p.locator('#turn-label').textContent(),'Turno de Melina');await roll(1);}
   }
   assert((await p.locator('#victory-title').textContent()).includes('Ana'));
   assert.deepEqual(await p.locator('#victory-results li > span').allTextContents(),['Ana','Melina']);
   await p.locator('#restart-button').click();assert.equal(await p.locator('.player-blue h3').textContent(),'Ana');
   await roll(6,'blue-1');await p.locator('#back-button').click();
   await p.locator('#edit-names-button').click();
   await blue.fill('Luz');await blue.press('Enter');await p.locator('#confirm-names-button').click();
   assert.equal(await p.locator('.player-blue h3').textContent(),'Luz');
   assert.equal(await p.locator('.token-choice[data-token-id="blue-1"]').getAttribute('data-progress'),'0');
   assert.deepEqual(errors,[]);await c.close();console.log('PASS names '+width+'x'+height);
  }
  const c=await browser.newContext();await c.addInitScript(()=>{Storage.prototype.setItem=function(){throw new Error('blocked');};});
  const p=await c.newPage();await p.goto('http://127.0.0.1:'+server.address().port);await p.waitForSelector('#intro-screen',{state:'detached'});
  await p.locator('#start-button').click();
  await p.locator('#name-red').fill('Melina');await p.locator('#name-yellow').fill('Diego');await p.locator('#name-green').fill('Gustavo');
  await p.locator('#name-blue').fill('Amiga');await p.locator('#name-blue').press('Enter');assert((await p.locator('#name-status').textContent()).includes('no permite guardarlos'));
  await p.locator('#confirm-names-button').click();assert.equal(await p.locator('.player-blue h3').textContent(),'Amiga');await c.close();console.log('PASS blocked storage fallback');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

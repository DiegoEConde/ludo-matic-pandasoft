const { enterGame } = require('./setup.cjs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs'), http=require('node:http'), path=require('node:path'), os=require('node:os');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
async function main(){
  const server=http.createServer((req,res)=>{
    const f=path.resolve(root,'.'+(req.url==='/'?'/index.html':req.url));
    if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    try{res.setHeader('Content-Type',/\.m?js$/.test(f)?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(f));}catch{res.writeHead(404);res.end();}
  }).listen(0,'127.0.0.1');
  await new Promise(r=>server.once('listening',r));
  const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
  const artifacts=path.join(os.tmpdir(),'ludo-sprint5');fs.mkdirSync(artifacts,{recursive:true});
  try{for(const [width,height,reduced] of [[1366,768,false],[1024,600,false],[390,844,false],[320,640,true]]){
    const c=await browser.newContext({viewport:{width,height},isMobile:width<900,hasTouch:width<900,reducedMotion:reduced?'reduce':'no-preference'});
    const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.clock.install();await p.goto('http://127.0.0.1:'+server.address().port);await p.clock.runFor(2800);
    await p.evaluate(()=>document.fonts.ready);await enterGame(p);
    const phase=()=>p.locator('#board-screen').getAttribute('data-phase');
    const card=id=>p.locator('.token-choice[data-token-id="'+id+'"]');
    const pos=id=>card(id).getAttribute('data-progress').then(Number);
    const roll=async(value,id)=>{
      assert.equal(await phase(),'waiting-roll');
      await p.evaluate(v=>{Math.random=()=>(v-.5)/6},value);
      await p.locator('#dice-control').click();await p.clock.runFor(920);
      assert.equal(await phase(),'roll-result');
      await p.locator('#dice-modal-action').click();
      if(id){
        assert.equal(await phase(),'choosing-token');assert(await card(id).isEnabled());
        if(width<900)await card(id).tap();else{await card(id).focus();await p.keyboard.press('Enter');}
        await p.clock.runFor(1200);
      }
    };
    const colors=['blue','yellow','red','green'];
    // A real sequence creates a capture at each successive starting square.
    await roll(6,'blue-1');
    for(let i=0;i<4;i++){
      const color=colors[i],next=colors[(i+1)%4];
      await roll(6,color+'-1');await roll(6,color+'-1');await roll(1,color+'-1');
      assert.equal(await pos(color+'-1'),13);
      await roll(6,next+'-1');
      assert.equal(await pos(color+'-1'),-1);assert.equal(await pos(next+'-1'),0);
      assert((await p.locator('#game-status').textContent()).includes('captur'));
      assert.equal(await p.locator('.board-piece:not([hidden])').count(),1);
    }
    // Finish all four blue tokens through legal moves, without injecting game state.
    for(let number=1;number<=4;number++){
      const id='blue-'+number;
      if(await pos(id)===-1)await roll(6,id);
      while(await pos(id)<54)await roll(6,id);
      assert.equal(await pos(id),54);
      // Overshoot: the advanced token must remain disabled, even if home exits are possible.
      await p.evaluate(()=>{Math.random=()=>.9});await p.locator('#dice-control').click();await p.clock.runFor(920);
      await p.locator('#dice-modal-action').click();
      if(number===4){assert.equal(await phase(),'waiting-roll');}else{
        assert(await card(id).isDisabled());
        // Use this six to release a future token, then move that token away from the start.
        await card('blue-'+(number+1)).click();await p.clock.runFor(1200);
        await roll(6,'blue-'+(number+1));
      }
      await roll(3,id);
      assert.equal(await pos(id),57);
      assert.equal(await p.locator('.player-blue .finish-count').textContent(),number+'/4 al centro');
      if(number<4){
        assert(!(await p.locator('#victory-modal').evaluate(e=>e.open)));
        await roll(1);await roll(1);await roll(1);
        // Next token was released above and is already six steps along the track.
        // The next iteration handles that actual position below.
      }
    }
    assert.equal(await phase(),'won');assert(await p.locator('#victory-modal').evaluate(e=>e.open));
    assert((await p.locator('#victory-title').textContent()).includes('Eri'));
    assert(await p.locator('#dice-control').isDisabled());assert.equal(await p.locator('.token-choice:enabled').count(),0);
    assert(await p.locator('#restart-button').evaluate(e=>document.activeElement===e));
    await p.screenshot({path:path.join(artifacts,'victory-'+width+'.png')});
    assert(await p.locator('#victory-modal').evaluate(e=>e.scrollWidth<=e.clientWidth));
    await p.keyboard.press('Escape');assert(await p.locator('#home-screen').isVisible());
    await enterGame(p);assert(await p.locator('#victory-modal').evaluate(e=>e.open));
    await p.locator('#restart-button').click();assert.equal(await phase(),'waiting-roll');
    assert.equal(await p.locator('.token-choice[data-progress="-1"]').count(),16);
    assert.equal(await p.locator('#turn-label').textContent(),'Turno de Eri');
    await p.clock.runFor(3000);assert.equal(await phase(),'waiting-roll');
    const d=await p.locator('.app-shell').evaluate(e=>({w:e.clientWidth,sw:e.scrollWidth,h:e.clientHeight,sh:e.scrollHeight}));
    assert(d.sw<=d.w,JSON.stringify(d));if(width>900)assert(d.sh<=d.h,JSON.stringify(d));
    await roll(6,'blue-1');assert.equal(await pos('blue-1'),0);
    assert.deepEqual(errors,[]);console.log('PASS Sprint 5 '+width+'x'+height+' reduced='+reduced);await c.close();
  }}finally{await browser.close();server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});

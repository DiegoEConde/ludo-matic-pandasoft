import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState } from '../js/game/state.mjs';
import { resolveMove, validTokenIds } from '../js/game/rules.mjs';
import { COLORS, ROUTES, positionFor, rotate, COMMON_STEPS, FINISH } from '../js/game/board.mjs';

for (const count of [2,3,4]) for (let roll=1;roll<=6;roll++) {
  test(count+' players: first exit with '+roll+' releases and advances once per player',()=>{
    const s=createGameState(count);s.phase='choosing-token';s.lastRoll=roll;
    s.players.forEach((player,index)=>{
      s.currentPlayerIndex=index;
      assert.equal(validTokenIds(s).length,4);
      const before=structuredClone(s);
      const result=resolveMove(s,player.id+'-1');
      assert.deepEqual(result.steps,Array.from({length:roll+1},(_,i)=>i));
      assert.equal(result.state.tokens.find(t=>t.id===player.id+'-1').progress,roll);
      assert.deepEqual(s,before);
      assert(result.state.players[index].hasPlayed);
      assert(result.state.players.filter((_,i)=>i!==index).every(p=>!p.hasPlayed));
      assert.equal(result.state.currentPlayerIndex,roll===6?index:(index+1)%count);
      const later={...result.state,phase:'choosing-token',currentPlayerIndex:index,lastRoll:2};
      assert.deepEqual(validTokenIds(later),[player.id+'-1']);
      // A capture must not restore the opening privilege.
      later.tokens.find(t=>t.id===player.id+'-1').progress=-1;
      assert.deepEqual(validTokenIds(later),[]);
      later.lastRoll=6;assert.equal(validTokenIds(later).length,4);
      assert.deepEqual(resolveMove(later,player.id+'-1').steps,[0]);
    });
    assert(createGameState(count).players.every(p=>!p.hasPlayed));
  });
}
test('all routes include each inner corner and count it as a full square',()=>{
  COLORS.forEach((color,quarter)=>{
    assert.deepEqual(ROUTES[color].slice(4,7),[[6,5],[6,6],[5,6]].map(c=>rotate(c,quarter)));
    for(const corner of [[6,6],[6,8],[8,8],[8,6]]) assert(ROUTES[color].some(c=>c.join()===corner.join()));
    for(let step=1;step<=FINISH;step++) {
      const a=positionFor(color,step-1),b=positionFor(color,step);
      assert.equal(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),1);
    }
    const s=createGameState();s.currentPlayerIndex=quarter;s.phase='choosing-token';s.lastRoll=1;
    s.tokens[quarter*4].progress=4;
    const result=resolveMove(s,color+'-1');
    assert.deepEqual(positionFor(color,result.state.tokens[quarter*4].progress),rotate([6,6],quarter));
  });
});
test('the last common square allows capture but the lane does not',()=>{
  const s=createGameState();s.phase='choosing-token';s.lastRoll=1;
  s.tokens[0].progress=COMMON_STEPS-2;
  const target=positionFor('blue',COMMON_STEPS-1);
  s.tokens[4].progress=ROUTES.yellow.findIndex(c=>c.join()===target.join());
  assert.deepEqual(resolveMove(s,'blue-1').capturedIds,['yellow-1']);
  s.tokens[0].progress=COMMON_STEPS-1;s.tokens[4].progress=COMMON_STEPS;
  assert.deepEqual(resolveMove(s,'blue-1').capturedIds,[]);
});

test('opening captures only at the rolled destination, not at the free start',()=>{
  const s=createGameState();s.phase='choosing-token';s.lastRoll=5;
  const locate=progress=>ROUTES.yellow.findIndex(c=>c.join()===positionFor('blue',progress).join());
  s.tokens[4].progress=locate(0);s.tokens[5].progress=locate(5);
  const result=resolveMove(s,'blue-1');
  assert.deepEqual(result.capturedIds,['yellow-2']);
  assert.equal(result.state.tokens[4].progress,s.tokens[4].progress);
  assert.equal(result.state.tokens[5].progress,-1);
});

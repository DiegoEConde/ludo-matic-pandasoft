import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState } from '../js/game/state.mjs';
import { nextPlayerIndex, validTokenIds, resolveMove } from '../js/game/rules.mjs';
import { FINISH } from '../js/game/board.mjs';
for (const count of [2,3,4]) {
  test(count + ' players: roster, legal turns, captures and victory use participants only', () => {
    const s = createGameState(count);
    const ids = count === 2 ? ['blue','red'] : ['blue','yellow','red','green'].slice(0,count);
    assert.deepEqual(s.players.map(p=>p.id),ids);
    assert.equal(s.tokens.length,count*4);
    assert(s.tokens.every(t=>ids.includes(t.playerId)));
    for(let i=0;i<count;i++) {
      s.currentPlayerIndex=i;s.lastRoll=6;s.phase='choosing-token';
      assert.deepEqual(validTokenIds(s),[1,2,3,4].map(n=>ids[i]+'-'+n));
      assert.equal(nextPlayerIndex(i,1,count),(i+1)%count);
      const release=resolveMove(s,ids[i]+'-1');
      assert.equal(release.state.currentPlayerIndex,i);
      const moved=resolveMove({...release.state,phase:'choosing-token',lastRoll:1},ids[i]+'-1');
      assert.equal(moved.state.currentPlayerIndex,(i+1)%count);
      const nearWin=createGameState(count);nearWin.currentPlayerIndex=i;nearWin.phase='choosing-token';nearWin.lastRoll=6;
      nearWin.tokens.filter(t=>t.playerId===ids[i]).forEach((t,index)=>t.progress=index===3?FINISH-6:FINISH);
      const win=resolveMove(nearWin,ids[i]+'-4');
      assert.equal(win.state.winnerId,ids[i]);assert.equal(win.state.phase,'won');
      assert.equal(win.state.currentPlayerIndex,i);assert.deepEqual(validTokenIds(win.state),[]);
    }
    const capture=createGameState(count);capture.phase='choosing-token';capture.lastRoll=6;
    capture.tokens.find(t=>t.id==='blue-1').progress=count===2?22:8;
    capture.tokens.find(t=>t.playerId===ids[1]).progress=0;
    const result=resolveMove(capture,'blue-1');
    assert.deepEqual(result.capturedIds,[ids[1]+'-1']);
    assert.equal(result.state.tokens.find(t=>t.id===ids[1]+'-1').progress,-1);
    const fresh=createGameState(count);assert(fresh.tokens.every(t=>t.progress===-1));
    s.players[0].name='Changed';assert.equal(fresh.players[0].name,'Eri');
  });
}
test('player counts outside 2-4 are rejected',()=>{
  for(const count of [0,1,5,2.5,null,'2',NaN]) assert.throws(()=>createGameState(count),RangeError);
});

test('blue and red are opposite; yellow joins third and green fourth', async()=>{
  const { positionFor, rotate } = await import('../js/game/board.mjs');
  assert.deepEqual(createGameState(2).players.map(p=>p.id),['blue','red']);
  assert.deepEqual(new Set(createGameState(3).players.map(p=>p.id)),new Set(['blue','red','yellow']));
  assert.deepEqual(new Set(createGameState(4).players.map(p=>p.id)),new Set(['blue','red','yellow','green']));
  for(let progress=0;progress<FINISH;progress++) {
    assert.deepEqual(rotate(positionFor('blue',progress),2),positionFor('red',progress));
  }
});

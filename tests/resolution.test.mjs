import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState } from '../js/game/state.mjs';
import { FINISH, positionFor, COLORS } from '../js/game/board.mjs';
import { resolveMove, validTokenIds } from '../js/game/rules.mjs';
const choosing = () => { const s=createGameState();s.players.forEach(p=>p.hasPlayed=true);return {...s, phase:'choosing-token', lastRoll:6}; };

test('capture uses shared board coordinates and returns the rival home', () => {
  const s=choosing();s.tokens[0].progress=11;s.tokens[4].progress=3;
  assert.deepEqual(positionFor('blue',17),positionFor('yellow',3));
  const original=structuredClone(s), result=resolveMove(s,'blue-1');
  assert.deepEqual(result.capturedIds,['yellow-1']);
  assert.equal(result.state.tokens[4].progress,-1);
  assert.equal(result.state.tokens[0].progress,17);
  assert.equal(result.state.currentPlayerIndex,0);
  assert.deepEqual(s,original);
});
test('each color can capture an opponent occupying its start on release', () => {
  COLORS.forEach((color,index)=>{
    const s=choosing();s.currentPlayerIndex=index;
    const rival=(index+1)%4;s.tokens[rival*4].progress=42;
    assert.deepEqual(positionFor(COLORS[rival],42),positionFor(color,0));
    const result=resolveMove(s,color+'-1');
    assert.deepEqual(result.capturedIds,[COLORS[rival]+'-1']);
    assert.equal(result.state.tokens[rival*4].progress,-1);
    assert.equal(result.state.tokens[index*4].progress,0);
  });
});
test('passing an opponent does not capture it', () => {
  const s=choosing();s.tokens[0].progress=14;s.tokens[4].progress=3;
  const result=resolveMove(s,'blue-1');
  assert.deepEqual(result.capturedIds,[]);
  assert.equal(result.state.tokens[4].progress,3);
});
test('final lanes and finished tokens are not capturable', () => {
  for(let progress=55;progress<=FINISH;progress++) {
    const s=choosing();s.tokens[0].progress=49;s.tokens[4].progress=progress;
    const result=resolveMove(s,'blue-1');
    assert.deepEqual(result.capturedIds,[]);
    assert.equal(result.state.tokens[4].progress,progress);
  }
});
test('an exact arrival completes the token without affecting completed rivals', () => {
  const s=choosing();s.lastRoll=2;s.tokens[0].progress=FINISH-2;s.tokens[4].progress=FINISH;
  const result=resolveMove(s,'blue-1');
  assert.equal(result.finished,true);assert.equal(result.state.tokens[0].progress,FINISH);
  assert.equal(result.state.tokens[4].progress,FINISH);assert.deepEqual(result.capturedIds,[]);
  assert.equal(result.state.winnerId,null);assert.equal(result.state.currentPlayerIndex,1);
});
test('overshoots and own occupied destinations never produce a result', () => {
  const s=choosing();s.tokens[0].progress=FINISH-1;
  assert.equal(resolveMove(s,'blue-1'),null);
  s.tokens[0].progress=0;s.tokens[1].progress=6;
  assert.equal(resolveMove(s,'blue-1'),null);assert.equal(resolveMove(s,'blue-3'),null);
});
test('four exact arrivals produce a terminal winner for each color, even on six', () => {
  COLORS.forEach((color,index)=>{
    const s=choosing();s.currentPlayerIndex=index;
    for(let i=0;i<4;i++)s.tokens[index*4+i].progress=i===3?FINISH-6:FINISH;
    const result=resolveMove(s,color+'-4');
    assert.equal(result.state.winnerId,color);assert.equal(result.state.phase,'won');
    assert.equal(result.state.currentPlayerIndex,index);assert.deepEqual(validTokenIds(result.state),[]);
    assert.equal(resolveMove(result.state,color+'-4'),null);
  });
});
test('one, two or three finished pieces do not win', () => {
  for(let finished=0;finished<3;finished++){
    const s=choosing();s.lastRoll=1;
    for(let i=0;i<finished;i++)s.tokens[i].progress=FINISH;
    s.tokens[finished].progress=FINISH-1;
    const result=resolveMove(s,'blue-'+(finished+1));
    assert.equal(result.state.winnerId,null);assert.equal(result.state.phase,'waiting-roll');
  }
});
test('invalid phase, rival selection and unknown token cannot mutate a game', () => {
  for(const phase of ['waiting-roll','rolling','roll-result','moving','won']) {
    const s=choosing();s.phase=phase;assert.equal(resolveMove(s,'blue-1'),null);
  }
  const s=choosing(), original=structuredClone(s);
  assert.equal(resolveMove(s,'yellow-1'),null);assert.equal(resolveMove(s,'missing'),null);assert.deepEqual(s,original);
});
test('a fresh game clears the winner, finished pieces, captures and last roll', () => {
  const s=choosing();s.tokens.forEach(t=>t.progress=FINISH);s.winnerId='blue';s.phase='won';
  const fresh=createGameState();assert.equal(fresh.winnerId,null);assert.equal(fresh.lastRoll,null);
  assert.equal(fresh.phase,'waiting-roll');assert.equal(fresh.currentPlayerIndex,0);
  assert(fresh.tokens.every(t=>t.progress===-1));
});

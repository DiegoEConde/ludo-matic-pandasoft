import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACK, ROUTES, COLORS, FINISH, positionFor, rotate } from '../js/game/board.mjs';
import { createGameState } from '../js/game/state.mjs';
import { moveSteps, validTokenIds, nextPlayerIndex } from '../js/game/rules.mjs';

const ongoingGame = () => { const s = createGameState(); s.players.forEach(p => p.hasPlayed = true); return s; };

test('each game owns sixteen independent tokens at home', () => {
  const a = createGameState(), b = createGameState();
  assert.equal(a.tokens.length, 16);
  assert.equal(new Set(a.tokens.map(t => t.id)).size, 16);
  a.tokens[0].progress = 3;
  assert.equal(b.tokens[0].progress, -1);
});
test('the common track has 56 unique squares and four clockwise starts', () => {
  assert.equal(TRACK.length, 56);
  assert.equal(new Set(TRACK.map(cell => cell.join(','))).size, 56);
  assert.deepEqual(COLORS.map(color => positionFor(color, 0)), [[6,1],[1,8],[8,13],[13,6]]);
  TRACK.forEach(([r,c], i) => {
    const [nr,nc] = TRACK[(i + 1) % TRACK.length];
    assert((Math.abs(nr-r) + Math.abs(nc-c)) === 1);
  });
});
test('each route enters its own lane before the center', () => {
  COLORS.forEach((color, quarter) => {
    assert.equal(ROUTES[color].length, 62);
    assert.deepEqual(ROUTES[color][54], rotate([7,0], quarter));
    assert.deepEqual(ROUTES[color].slice(55,61), Array.from({length:6}, (_,i) => rotate([7,i+1],quarter)));
    assert.deepEqual(ROUTES[color][FINISH], [7,7]);
  });
});
test('only a six releases a home token, onto the start square', () => {
  const token = createGameState().tokens[0];
  for(let roll=1;roll<6;roll++) assert.deepEqual(moveSteps(token, roll), []);
  assert.deepEqual(moveSteps(token, 6), [0]);
});
test('every legal active move advances exactly N consecutive squares', () => {
  for(let progress=0;progress<FINISH;progress++) for(let roll=1;roll<=6;roll++) {
    const token = {progress};
    const steps = moveSteps(token, roll);
    if(progress+roll>FINISH) assert.deepEqual(steps, []);
    else {
      assert.equal(steps.length, roll);
      steps.forEach((step,i) => assert.equal(step,progress+i+1));
    }
    assert.equal(token.progress, progress);
  }
});
test('invalid dice, completed tokens and overshoots cannot move', () => {
  for(const value of [0,7,-1,1.5,NaN,undefined]) assert.deepEqual(moveSteps({progress:0},value),[]);
  assert.deepEqual(moveSteps({progress:FINISH},6),[]);
  assert.deepEqual(moveSteps({progress:FINISH-2},3),[]);
  assert.deepEqual(moveSteps({progress:FINISH-2},2),[FINISH-1,FINISH]);
});
test('selection only includes the current player and legal moves', () => {
  const s=ongoingGame();s.lastRoll=3;
  assert.deepEqual(validTokenIds(s),[]);
  s.lastRoll=6;assert.deepEqual(validTokenIds(s),['blue-1','blue-2','blue-3','blue-4']);
  s.tokens[0].progress=8;s.tokens[1].progress=FINISH-1;s.tokens[2].progress=FINISH;
  s.lastRoll=3;assert.deepEqual(validTokenIds(s),['blue-1']);
  s.currentPlayerIndex=1;assert.deepEqual(validTokenIds(s),[]);
});
test('six keeps the player and other rolls rotate clockwise including wraparound', () => {
  for(let player=0;player<4;player++) {
    assert.equal(nextPlayerIndex(player,6),player);
    for(let roll=1;roll<6;roll++)assert.equal(nextPlayerIndex(player,roll),(player+1)%4);
  }
});
test('occupied own start prevents every home exit for all four players', () => {
  for(let currentPlayerIndex=0;currentPlayerIndex<4;currentPlayerIndex++) {
    const s=ongoingGame();s.currentPlayerIndex=currentPlayerIndex;s.lastRoll=6;
    const token=s.tokens[currentPlayerIndex*4];token.progress=0;
    assert.deepEqual(validTokenIds(s),[token.id]);
    token.progress=6;
    assert.equal(validTokenIds(s).length,4);
  }
});
test('own occupied destinations are forbidden on track and final lane', () => {
  for(const destination of [6,20,55,60]) {
    const s=ongoingGame();s.lastRoll=3;
    s.tokens[0].progress=destination-3;s.tokens[1].progress=destination;
    assert(!validTokenIds(s).includes('blue-1'));
    s.tokens[1].progress=destination-1;
    assert(validTokenIds(s).includes('blue-1'));
  }
});
test('passing an own piece is allowed when the destination is free', () => {
  const s=ongoingGame();s.lastRoll=6;s.tokens[0].progress=0;s.tokens[1].progress=3;
  assert(validTokenIds(s).includes('blue-1'));
  assert.deepEqual(moveSteps(s.tokens[0],6),[1,2,3,4,5,6]);
});
test('finished pieces do not block another exact arrival', () => {
  const s=ongoingGame();s.lastRoll=1;s.tokens[0].progress=FINISH-1;s.tokens[1].progress=FINISH;
  assert.deepEqual(validTokenIds(s),['blue-1']);
});
test('the own-piece restriction does not forbid future captures of rivals', () => {
  const s=ongoingGame();s.lastRoll=3;s.tokens[0].progress=14;
  // Yellow starts 14 squares ahead of blue; both targets refer to blue step 17.
  s.tokens[4].progress=3;
  assert.deepEqual(positionFor('blue',17),positionFor('yellow',3));
  assert.deepEqual(validTokenIds(s),['blue-1']);
});

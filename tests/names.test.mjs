import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_NAMES,NAMES_KEY,readNames,saveNames,cleanName,mergeNames,nameKey} from '../js/game/names.mjs';
import {createGameState} from '../js/game/state.mjs';
test('saved names survive a new read, retain defaults and deduplicate case and accents',()=>{
 let value=null;const storage={getItem:()=>value,setItem:(key,next)=>{assert.equal(key,NAMES_KEY);value=next;}};
 assert.deepEqual(readNames(storage),DEFAULT_NAMES);
 assert(saveNames(storage,[' Ana ','ana','\u00c1NA','ErI','Pedro']).saved);
 assert.deepEqual(readNames(storage),[...DEFAULT_NAMES,'Ana','Pedro']);
 assert.equal(nameKey(' \u00c9RI '),'eri');
});
test('invalid storage and blocked persistence leave the picker usable',()=>{
 for(const value of ['bad','{}','null','[null,3,{},"Ana"]']) {
  const names=readNames({getItem:()=>value});assert(names.includes('Eri'));assert(names.every(n=>typeof n==='string'));
 }
 assert.deepEqual(readNames(undefined),DEFAULT_NAMES);
 assert.equal(saveNames(undefined,['Ana']).saved,false);
 assert(saveNames(undefined,['Ana']).names.includes('Ana'));
});
test('names are normalized and the saved list is not limited to six',()=>{
 assert.equal(cleanName('  Ana   Maria\n '),'Ana Maria');
 assert.equal(cleanName('x'.repeat(100)).length,32);
 assert.equal(mergeNames(['A','B','C','D']).length,8);
});
test('chosen names belong to game state and remain independent between games',()=>{
 const names={blue:'Ana',red:'Pedro',yellow:'Luz',green:'Juan'};
 for(const count of [2,3,4]) {
  const state=createGameState(count,names);
  state.players.forEach(p=>assert.equal(p.name,names[p.id]));
  state.players[0].name='Changed';assert.equal(createGameState(count,names).players[0].name,'Ana');
 }
});

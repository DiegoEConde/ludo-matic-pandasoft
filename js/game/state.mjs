import { cleanName } from './names.mjs';
export const PLAYERS = [
  { id: 'blue', name: 'Eri' }, { id: 'yellow', name: 'Diego' },
  { id: 'red', name: 'Melina' }, { id: 'green', name: 'Gustavo' },
];
export function createGameState(playerCount = 4, names = {}) {
  if (![2, 3, 4].includes(playerCount)) throw new RangeError('Choose 2, 3 or 4 players');
  const participants = (playerCount === 2 ? [PLAYERS[0], PLAYERS[2]] : PLAYERS.slice(0, playerCount)).map(player => ({ ...player, hasPlayed: false, name: cleanName(names[player.id]) || player.name }));
  return {
    players: participants,
    phase: 'waiting-roll', currentPlayerIndex: 0, lastRoll: null, winnerId: null,
    tokens: participants.flatMap(player => Array.from({ length: 4 }, (_, index) => ({
      id: player.id + '-' + (index + 1), playerId: player.id, number: index + 1, progress: -1,
    }))),
  };
}

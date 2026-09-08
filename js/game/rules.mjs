import { FINISH, COMMON_STEPS, positionFor } from './board.mjs';
import { PLAYERS } from './state.mjs';
export function moveSteps(token, value, freeExit = false) {
  if (!Number.isInteger(value) || value < 1 || value > 6) return [];
  if (!Number.isInteger(token.progress) || token.progress < -1 || token.progress >= FINISH) return [];
  if (token.progress === -1) {
    if (freeExit) return Array.from({ length: value + 1 }, (_, step) => step);
    return value === 6 ? [0] : [];
  }
  if (token.progress + value > FINISH) return [];
  return Array.from({ length: value }, (_, index) => token.progress + index + 1);
}
export function validTokenIds(state) {
  if (state.winnerId || state.phase === 'won') return [];
  const playerId = state.players[state.currentPlayerIndex].id;
  return state.tokens.filter(token => {
    if (token.playerId !== playerId) return false;
    const steps = moveSteps(token, state.lastRoll, state.players[state.currentPlayerIndex].hasPlayed === false);
    if (!steps.length) return false;
    const destination = steps.at(-1);
    // Completed pieces leave the track; the shared finish is not an occupied square.
    if (destination === FINISH) return true;
    return !state.tokens.some(other => other.id !== token.id
      && other.playerId === playerId && other.progress === destination);
  }).map(token => token.id);
}
export function nextPlayerIndex(current, value, playerCount = PLAYERS.length) {
  return value === 6 ? current : (current + 1) % playerCount;
}

// Plan the entire move before animating it. Input state is never mutated.
export function resolveMove(state, tokenId) {
  if (state.phase !== 'choosing-token' || !validTokenIds(state).includes(tokenId)) return null;
  const token = state.tokens.find(piece => piece.id === tokenId);
  const steps = moveSteps(token, state.lastRoll, state.players[state.currentPlayerIndex].hasPlayed === false);
  const destination = steps.at(-1);
  const capturedIds = [];
  if (destination < COMMON_STEPS) {
    const [row, column] = positionFor(token.playerId, destination);
    state.tokens.forEach(other => {
      if (other.playerId === token.playerId || other.progress < 0 || other.progress >= COMMON_STEPS) return;
      const [otherRow, otherColumn] = positionFor(other.playerId, other.progress);
      if (row === otherRow && column === otherColumn) capturedIds.push(other.id);
    });
  }
  const tokens = state.tokens.map(piece => ({ ...piece,
    progress: piece.id === tokenId ? destination : capturedIds.includes(piece.id) ? -1 : piece.progress,
  }));
  const finished = destination === FINISH;
  const winnerId = tokens.filter(piece => piece.playerId === token.playerId).every(piece => piece.progress === FINISH)
    ? token.playerId : null;
  return {
    steps, capturedIds, finished,
    state: { ...state, tokens, winnerId,
      players: state.players.map(player => player.id === token.playerId ? { ...player, hasPlayed: true } : { ...player }), phase: winnerId ? 'won' : 'waiting-roll',
      currentPlayerIndex: winnerId ? state.currentPlayerIndex : nextPlayerIndex(state.currentPlayerIndex, state.lastRoll, state.players.length),
    },
  };
}

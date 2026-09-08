import { createNamePicker } from './name-picker.js';
import { PLAYERS as players, createGameState } from './game/state.mjs';
import { FINISH, positionFor } from './game/board.mjs';
import { resolveMove, validTokenIds, nextPlayerIndex } from './game/rules.mjs';

const homeScreen = document.querySelector('#home-screen');
const boardScreen = document.querySelector('#board-screen');
const startButton = document.querySelector('#start-button');
const playerSetup = document.querySelector('#player-setup');
const namesModal = document.querySelector('#names-modal');
const confirmNamesButton = document.querySelector('#confirm-names-button');
const editNamesButton = document.querySelector('#edit-names-button');
let configuredCount = 0;
let configuredNames = {};
const setupHint = document.querySelector('#setup-hint');
const selectedCount = () => Number(playerSetup.querySelector('input:checked').value);
const backButton = document.querySelector('#back-button');
const boardGrid = document.querySelector('#board-grid');
const boardTokens = document.querySelector('#board-tokens');
const diceControl = document.querySelector('#dice-control');
const diceModal = document.querySelector('#dice-modal');
const rollingDie = document.querySelector('#rolling-die');
const diceModalTitle = document.querySelector('#dice-modal-title');
const diceMessage = document.querySelector('#dice-message');
const sixCelebration = document.querySelector('#six-celebration');
const diceModalAction = document.querySelector('#dice-modal-action');
const turnLabel = document.querySelector('#turn-label');
const modalKicker = document.querySelector('#modal-kicker');
const gameStatus = document.querySelector('#game-status');
const victoryModal = document.querySelector('#victory-modal');
const victoryTitle = document.querySelector('#victory-title');
const victoryResults = document.querySelector('#victory-results');
const restartButton = document.querySelector('#restart-button');
const victoryHomeButton = document.querySelector('#victory-home-button');
const diceSides = [...document.querySelectorAll('#rolling-die .dice-side')];
const gameState = createGameState();
const cardButtons = new Map();
const boardButtons = new Map();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let noMoveTimer;
const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
const currentPlayer = () => gameState.players[gameState.currentPlayerIndex];
const namePicker = createNamePicker(document.querySelector('#player-names'));
namePicker.setCount(selectedCount());

function getHomeClass(row, column) {
  if (row < 6 && column < 6) return 'home-blue';
  if (row < 6 && column > 8) return 'home-yellow';
  if (row > 8 && column > 8) return 'home-red';
  if (row > 8 && column < 6) return 'home-green';
  return '';
}

function getLaneClass(row, column) {
  if (row === 7 && column > 0 && column < 7) return 'lane-blue';
  if (column === 7 && row > 0 && row < 7) return 'lane-yellow';
  if (row === 7 && column > 7 && column < 14) return 'lane-red';
  if (column === 7 && row > 7 && row < 14) return 'lane-green';
  return '';
}

function getFinishClass(row, column) {
  if (row === 6 && column === 6) return 'finish-blue';
  if (row === 6 && column === 8) return 'finish-yellow';
  if (row === 8 && column === 8) return 'finish-red';
  if (row === 8 && column === 6) return 'finish-green';
  return '';
}

function renderBoard() {
  for (let row = 0; row < 15; row += 1) {
    for (let column = 0; column < 15; column += 1) {
      const cell = document.createElement('span');
      const homeClass = getHomeClass(row, column);
      const laneClass = getLaneClass(row, column);
      const finishClass = getFinishClass(row, column);
      const isCross = row >= 6 && row <= 8 || column >= 6 && column <= 8;

      cell.className = 'board-cell';
      if (homeClass) cell.classList.add(homeClass);
      if (isCross && !homeClass) cell.classList.add('path');
      if (laneClass) cell.classList.add(laneClass);
      if (finishClass) cell.classList.add(finishClass);
      boardGrid.append(cell);
    }
  }
}

renderBoard();


function createTokenButtons() {
  cardButtons.clear();
  boardButtons.clear();
  boardTokens.replaceChildren();
  players.forEach(player => {
    const reserve = document.querySelector('.player-' + player.id + ' .token-reserve');
    reserve.replaceChildren();
    reserve.setAttribute('aria-label', 'Fichas de ' + (gameState.players.find(owner => owner.id === player.id)?.name || player.name));
    gameState.tokens.filter(token => token.playerId === player.id).forEach(token => {
      for (const [container, map, className] of [[reserve, cardButtons, 'token-choice'], [boardTokens, boardButtons, 'board-piece']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.dataset.tokenId = token.id;
        button.style.setProperty('--piece-color', 'var(--' + player.id + ')');
        button.textContent = token.number;
        button.addEventListener('click', () => chooseToken(token.id));
        container.append(button);
        map.set(token.id, button);
      }
    });
  });
}

function renderState() {
  const player = currentPlayer();
  const selectable = gameState.phase === 'choosing-token' ? validTokenIds(gameState) : [];
  boardScreen.dataset.phase = gameState.phase;
  boardScreen.style.setProperty('--turn-color', 'var(--' + player.id + ')');
  turnLabel.textContent = gameState.winnerId ? player.name + ' gan\u00f3' : 'Turno de ' + player.name;
  const differentCount = selectedCount() !== gameState.players.length;
  const inProgress = gameState.lastRoll !== null;
  startButton.querySelector('span').textContent = differentCount && inProgress ? 'Empezar nueva partida' : gameState.winnerId ? 'Ver resultado' : inProgress ? 'Continuar partida' : 'Empezar a jugar';
  setupHint.textContent = differentCount && inProgress ? 'Al empezar se reinicia la partida actual.' : configuredCount ? Object.values(configuredNames).filter(Boolean).join(', ') : 'Elige la cantidad para indicar los nombres.';
  editNamesButton.hidden = !configuredCount;
  modalKicker.textContent = 'Turno de ' + player.name;
  diceModal.style.setProperty('--player-color', 'var(--' + player.id + ')');
  diceControl.disabled = gameState.phase !== 'waiting-roll';
  diceControl.setAttribute('aria-label', 'Tirar el dado: turno de ' + player.name);
  backButton.disabled = ['rolling', 'roll-result', 'moving'].includes(gameState.phase);
  players.forEach(owner => {
    const card = document.querySelector('.player-' + owner.id);
    card.hidden = !gameState.players.some(participant => participant.id === owner.id);
    if (card.hidden) return;
    const participant = gameState.players.find(player => player.id === owner.id);
    card.querySelector('h3').textContent = participant.name;
    card.setAttribute('aria-label', 'Jugador ' + participant.name);
    card.querySelector('.token-reserve').setAttribute('aria-label', 'Fichas de ' + participant.name);
    const tokens = gameState.tokens.filter(token => token.playerId === owner.id);
    card.classList.toggle('is-active', owner.id === player.id);
    card.querySelector('.player-turn').textContent = owner.id === player.id
      ? (gameState.winnerId ? 'Ganador' : gameState.phase === 'choosing-token' ? 'Elige ficha' : gameState.phase === 'moving' ? 'Moviendo' : 'Tu turno') : 'Esperando';
    const home = tokens.filter(token => token.progress === -1).length;
    const finished = tokens.filter(token => token.progress === FINISH).length;
    const counter = card.querySelector('.reserve-label');
    counter.replaceChildren(document.createTextNode(home + ' en casa / ' + (4 - home - finished) + ' en juego'));
    const arrivalCount = document.createElement('span');
    arrivalCount.className = 'finish-count';
    arrivalCount.textContent = finished + '/4 al centro';
    counter.append(arrivalCount);
  });
  const groups = new Map();
  gameState.tokens.forEach(token => {
    if (token.progress < 0 || token.progress === FINISH) return;
    const key = positionFor(token.playerId, token.progress).join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(token.id);
  });
  gameState.tokens.forEach(token => {
    const owner = gameState.players.find(player => player.id === token.playerId);
    const location = token.progress === -1 ? 'en casa' : token.progress === FINISH ? 'en el centro' : 'casilla ' + (token.progress + 1);
    const enabled = selectable.includes(token.id);
    for (const button of [cardButtons.get(token.id), boardButtons.get(token.id)]) {
      button.disabled = !enabled;
      button.classList.toggle('is-selectable', enabled);
      button.dataset.progress = token.progress;
      button.setAttribute('aria-label', owner.name + ', ficha ' + token.number + ', ' + location + (enabled ? (token.progress === -1 ? ': sacar de casa' : ': avanzar ' + gameState.lastRoll) : ''));
      button.title = button.getAttribute('aria-label');
    }
    const cardButton = cardButtons.get(token.id);
    cardButton.dataset.location = token.progress === -1 ? 'home' : token.progress === FINISH ? 'finished' : 'active';
    cardButton.textContent = token.progress === FINISH ? '\u2713' : token.number;
    const piece = boardButtons.get(token.id);
    piece.hidden = token.progress < 0 || token.progress === FINISH;
    if (!piece.hidden) {
      const [row, column] = positionFor(token.playerId, token.progress);
      const group = groups.get([row, column].join(','));
      const index = group.indexOf(token.id);
      // Fan shared squares slightly; the full-size card controls stay unambiguous.
      const offset = group.length > 1 ? (index - (group.length - 1) / 2) * Math.min(5, 15 / group.length) : 0;
      piece.style.left = ((column + 0.5) / 15 * 100) + '%';
      piece.style.top = ((row + 0.5) / 15 * 100) + '%';
      piece.style.setProperty('--stack-offset', offset + 'px');
      piece.style.zIndex = enabled ? 3 : 1;
    }
  });
}

function focusNextControl() {
  if (boardScreen.hidden) return;
  const target = gameState.phase === 'choosing-token' ? cardButtons.get(validTokenIds(gameState)[0]) : diceControl;
  target?.focus({ preventScroll: true });
  if (window.innerWidth <= 900) target?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
}

function setFeedback(kind = '') {
  gameStatus.dataset.feedback = kind;
  for (const button of cardButtons.values()) button.classList.remove('just-captured', 'just-finished');
}
function noMoveHelp() {
  const tokens = gameState.tokens.filter(token => token.playerId === currentPlayer().id && token.progress !== FINISH);
  if (tokens.every(token => token.progress === -1)) return 'Necesitas un 6 para sacar una ficha de casa.';
  return 'Con este n\u00famero no puedes mover: necesitas llegar justo al centro y dejar libre la casilla de tus otras fichas.';
}
function finishTurn(prefix = '', resolvedState = null) {
  const extra = gameState.lastRoll === 6;
  if (resolvedState) Object.assign(gameState, resolvedState);
  else {
    currentPlayer().hasPlayed = true;
    gameState.currentPlayerIndex = nextPlayerIndex(gameState.currentPlayerIndex, gameState.lastRoll, gameState.players.length);
    gameState.phase = 'waiting-roll';
  }
  renderState();
  gameStatus.textContent = prefix + (extra ? currentPlayer().name + ': tienes otro turno. Tira el dado.' : currentPlayer().name + ': tira el dado.');
  focusNextControl();
}

async function chooseToken(id) {
  if (gameState.phase !== 'choosing-token' || !validTokenIds(gameState).includes(id)) return;
  const token = gameState.tokens.find(token => token.id === id);
  const result = resolveMove(gameState, id);
  if (!result) return;
  const owner = currentPlayer();
  const steps = result.steps;
  setFeedback();
  gameState.phase = 'moving';
  gameStatus.textContent = currentPlayer().name + ': moviendo la ficha ' + token.number + '.';
  renderState();
  boardButtons.get(id).classList.add('is-moving');
  for (const progress of steps) {
    token.progress = progress;
    renderState();
    if (!reducedMotion.matches) await wait(180);
  }
  boardButtons.get(id).classList.remove('is-moving');
  const captureNames = result.capturedIds.map(capturedId => {
    const piece = gameState.tokens.find(other => other.id === capturedId);
    return 'ficha ' + piece.number + ' de ' + gameState.players.find(player => player.id === piece.playerId).name;
  });
  const feedback = result.finished ? owner.name + ': ficha ' + token.number + ' al centro. '
    : captureNames.length ? owner.name + ' captur\u00f3 la ' + captureNames.join(', ') + '. ' : '';
  if (result.state.winnerId) {
    Object.assign(gameState, result.state);
    renderState();
    gameStatus.textContent = owner.name + ' gan\u00f3: sus cuatro fichas llegaron al centro.';
    showVictory();
  } else finishTurn(feedback, result.state);
  if (result.finished || result.capturedIds.length) {
    setFeedback(result.finished ? 'finish' : 'capture');
    if (result.finished) cardButtons.get(id).classList.add('just-finished');
    result.capturedIds.forEach(capturedId => cardButtons.get(capturedId).classList.add('just-captured'));
  }
}

diceSides.forEach(side => {
  side.replaceChildren(...Array.from({ length: Number(side.dataset.face) }, () => document.createElement('i')));
});
function setDiceFace(value) {
  diceSides.forEach(side => { side.hidden = Number(side.dataset.face) !== value; });
  rollingDie.dataset.value = value;
}
[...document.querySelectorAll('.dice-face i')].forEach((dot, index) => {
  dot.hidden = ![1, 3, 4, 6, 7, 9].includes(index + 1);
  dot.className = 'dot-position-' + (index + 1);
});

async function rollDice() {
  if (gameState.phase !== 'waiting-roll') return;
  setFeedback();
  sixCelebration.hidden = true;
  diceModal.classList.remove('has-six');
  gameState.phase = 'rolling';
  gameState.lastRoll = Math.floor(Math.random() * 6) + 1;
  renderState();
  diceModalTitle.textContent = currentPlayer().name + ' tira el dado';
  diceMessage.textContent = 'El dado est\u00e1 rodando...';
  diceModalAction.disabled = true;
  diceModalAction.textContent = 'Esperar resultado';
  setDiceFace(6);
  rollingDie.classList.add('is-rolling');
  diceModal.showModal();
  if (!reducedMotion.matches) {
    [90, 200, 330, 490, 680].forEach((delay, index) => {
      window.setTimeout(() => setDiceFace([2, 4, 1, 5, 3][index]), delay);
    });
  }
  await wait(900);
  setDiceFace(gameState.lastRoll);
  rollingDie.classList.remove('is-rolling');
  gameState.phase = 'roll-result';
  const valid = validTokenIds(gameState);
  diceModalTitle.textContent = 'Sali\u00f3 un ' + gameState.lastRoll;
  const hasHome = gameState.tokens.some(token => token.playerId === currentPlayer().id && token.progress === -1);
  const blockedExit = gameState.tokens.some(token => token.playerId === currentPlayer().id && token.progress === 0);
  const freeExit = currentPlayer().hasPlayed === false && hasHome && !blockedExit;
  const help = valid.length
    ? (freeExit
      ? 'Primera salida gratis: elige una ficha para salir y avanzar ' + gameState.lastRoll + ' casillas.' + (gameState.lastRoll === 6 ? ' Luego tienes otro turno.' : '')
      : gameState.lastRoll === 6
      ? (blockedExit && hasHome
        ? 'Tu salida est\u00e1 ocupada. Mueve una ficha activa seis casillas; luego tienes otro turno.'
        : hasHome ? 'Saca una ficha o avanza seis casillas. Luego tienes otro turno.'
          : 'Avanza seis casillas. Luego tienes otro turno.')
      : 'Elige una ficha para avanzar ' + gameState.lastRoll + ' casillas sin caer sobre otra propia.')
    : noMoveHelp() + (gameState.lastRoll === 6 ? ' Tienes otro turno.' : ' Sigue el pr\u00f3ximo jugador.') + ' Puedes pulsar Continuar o esperar.';
  diceMessage.textContent = 'Sali\u00f3 un ' + gameState.lastRoll + '. ' + help;
  sixCelebration.hidden = gameState.lastRoll !== 6;
  diceModal.classList.toggle('has-six', gameState.lastRoll === 6);
  diceModalAction.textContent = valid.length ? 'Elegir ficha' : 'Continuar';
  diceModalAction.disabled = false;
  renderState();
  diceModalAction.focus({ preventScroll: true });
  if (!valid.length) noMoveTimer = window.setTimeout(resolveRoll, 8000);
}

function resolveRoll() {
  if (gameState.phase !== 'roll-result') return;
  window.clearTimeout(noMoveTimer);
  diceModal.close();
  if (!validTokenIds(gameState).length) {
    finishTurn('Sin movimientos. ' + noMoveHelp() + ' ');
    return;
  }
  gameState.phase = 'choosing-token';
  renderState();
  gameStatus.textContent = currentPlayer().name + ': elige una ficha resaltada (' + gameState.lastRoll + '). Puedes usar su n\u00famero en la tarjeta o tocarla en el tablero.';
  focusNextControl();
}

diceControl.addEventListener('click', rollDice);
diceModalAction.addEventListener('click', resolveRoll);
diceModal.addEventListener('cancel', event => {
  event.preventDefault();
  if (gameState.phase === 'roll-result') resolveRoll();
});
function showScreen(screenToShow, screenToHide) {
  screenToHide.hidden = true;
  screenToShow.hidden = false;
  document.querySelector('.app-shell').scrollTo({ top: 0, behavior: 'instant' });
}
function openNames() {
  if(namesModal.open) return;
  namePicker.setCount(selectedCount());
  namePicker.setValues(selectedCount() === configuredCount ? configuredNames : {});
  confirmNamesButton.textContent = gameState.lastRoll !== null && selectedCount() === gameState.players.length ? 'Guardar y continuar' : 'Empezar a jugar';
  namesModal.showModal();
  namePicker.focus();
}
function cancelNames() {
  namePicker.close(); namesModal.close();
  playerSetup.querySelector('input[value="' + (configuredCount || 4) + '"]').checked = true;
  namePicker.setCount(configuredCount || 4);namePicker.setValues(configuredNames);
  renderState();startButton.focus({preventScroll:true});
}
playerSetup.addEventListener('change', event => {
  if(event.target.name === 'player-count') {renderState();openNames();}
});
playerSetup.addEventListener('click', event => {
  if(event.target.name === 'player-count') {renderState();openNames();}
});
editNamesButton.addEventListener('click',openNames);
document.querySelector('#cancel-names-button').addEventListener('click',cancelNames);
namesModal.addEventListener('cancel',event=>{event.preventDefault();cancelNames();});
function enterGame() {
  if (selectedCount() !== gameState.players.length) resetGame(selectedCount(), configuredNames);
  else {
    gameState.players.forEach(player => { player.name = configuredNames[player.id]; });
    renderState();
    gameStatus.textContent = currentPlayer().name + (gameState.winnerId ? ' gan\u00f3: sus cuatro fichas llegaron al centro.' : gameState.phase === 'choosing-token' ? ': elige una ficha resaltada para avanzar ' + gameState.lastRoll + '.' : ': tira el dado.');
  }
  showScreen(boardScreen, homeScreen);
  if (gameState.winnerId) showVictory();
  else focusNextControl();
}
confirmNamesButton.addEventListener('click',()=>{
  if(!namePicker.commit())return;
  configuredNames = namePicker.values();configuredCount = selectedCount();
  namePicker.close();namesModal.close();enterGame();
});
startButton.addEventListener('click',()=>{
  if(!configuredCount || configuredCount !== selectedCount())openNames();else enterGame();
});
backButton.addEventListener('click', () => {
  if (backButton.disabled) return;
  showScreen(homeScreen, boardScreen);
  startButton.focus({ preventScroll: true });
});
function showVictory() {
  if (!gameState.winnerId) return;
  const winner = gameState.players.find(player => player.id === gameState.winnerId);
  victoryTitle.textContent = '\u00a1Gan\u00f3 ' + winner.name + '!';
  victoryModal.style.setProperty('--winner-color', 'var(--' + winner.id + ')');
  victoryResults.replaceChildren(...gameState.players.map(player => {
    const row = document.createElement('li');
    row.classList.toggle('is-winner', player.id === winner.id);
    const name = document.createElement('span');
    name.textContent = player.name;
    const count = document.createElement('strong');
    count.textContent = gameState.tokens.filter(token => token.playerId === player.id && token.progress === FINISH).length + '/4 al centro';
    row.append(name, count);
    return row;
  }));
  if (!victoryModal.open) victoryModal.showModal();
  restartButton.focus({ preventScroll: true });
}
function leaveVictory() {
  victoryModal.close();
  showScreen(homeScreen, boardScreen);
  startButton.focus({ preventScroll: true });
}
function resetGame(playerCount, names = Object.fromEntries(gameState.players.map(player => [player.id, player.name]))) {
  window.clearTimeout(noMoveTimer);
  Object.assign(gameState, createGameState(playerCount, names));
  createTokenButtons();
  setFeedback();
  setDiceFace(6);
  renderState();
  gameStatus.textContent = 'Nueva partida. ' + currentPlayer().name + ': tira el dado para empezar.';
}
restartButton.addEventListener('click', () => {
  if (gameState.phase !== 'won') return;
  victoryModal.close();
  resetGame(gameState.players.length);
  focusNextControl();
});
victoryHomeButton.addEventListener('click', leaveVictory);
victoryModal.addEventListener('cancel', event => {
  event.preventDefault();
  leaveVictory();
});
createTokenButtons();
renderState();
setDiceFace(6);

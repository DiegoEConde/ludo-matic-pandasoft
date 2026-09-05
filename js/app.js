const homeScreen = document.querySelector('#home-screen');
const boardScreen = document.querySelector('#board-screen');
const startButton = document.querySelector('#start-button');
const backButton = document.querySelector('#back-button');
const introScreen = document.querySelector('#intro-screen');
const boardGrid = document.querySelector('#board-grid');
const diceControl = document.querySelector('#dice-control');
const diceModal = document.querySelector('#dice-modal');
const rollingDie = document.querySelector('#rolling-die');
const diceModalTitle = document.querySelector('#dice-modal-title');
const diceMessage = document.querySelector('#dice-message');
const diceModalAction = document.querySelector('#dice-modal-action');
const turnLabel = document.querySelector('#turn-label');
const modalKicker = document.querySelector('#modal-kicker');
const diceSides = [...document.querySelectorAll('#rolling-die .dice-side')];
const centerDiceDots = [...document.querySelectorAll('.dice-face i')];

const diceFaces = {
  1: [4],
  2: [1, 9],
  3: [1, 4, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 4, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const players = [
  { id: 'green', name: 'Sol' },
  { id: 'red', name: 'Luna' },
  { id: 'blue', name: 'Rio' },
  { id: 'yellow', name: 'Mia' },
];

const gameState = {
  currentPlayerIndex: 0,
  isRolling: false,
  lastRoll: null,
};

window.setTimeout(() => {
  introScreen.remove();
}, 2800);

function getHomeClass(row, column) {
  if (row < 6 && column < 6) return 'home-green';
  if (row < 6 && column > 8) return 'home-red';
  if (row > 8 && column > 8) return 'home-blue';
  if (row > 8 && column < 6) return 'home-yellow';
  return '';
}

function getLaneClass(row, column) {
  if (row === 7 && column > 0 && column < 7) return 'lane-green';
  if (column === 7 && row > 0 && row < 7) return 'lane-red';
  if (row === 7 && column > 7 && column < 14) return 'lane-blue';
  if (column === 7 && row > 7 && row < 14) return 'lane-yellow';
  return '';
}

function getFinishClass(row, column) {
  if (row === 6 && column === 6) return 'finish-green';
  if (row === 6 && column === 8) return 'finish-red';
  if (row === 8 && column === 8) return 'finish-blue';
  if (row === 8 && column === 6) return 'finish-yellow';
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

function updateTurnUI() {
  const currentPlayer = players[gameState.currentPlayerIndex];
  turnLabel.textContent = `Turno de ${currentPlayer.name}`;
  modalKicker.textContent = `Turno de ${currentPlayer.name}`;

  players.forEach((player) => {
    const card = document.querySelector(`.player-${player.id}`);
    const turnText = card.querySelector('.player-turn');
    const isCurrent = player.id === currentPlayer.id;
    card.classList.toggle('is-active', isCurrent);
    turnText.textContent = isCurrent ? 'Tu turno' : 'Esperando';
  });
}

function getDiceResult() {
  return Math.floor(Math.random() * 6) + 1;
}

function setDiceFace(value) {
  rollingDie.className = 'dice-cube';
  rollingDie.classList.add(`show-${value}`);
  diceSides.forEach((side) => {
    const faceValue = Number(side.dataset.face);
    side.innerHTML = '';
    diceFaces[faceValue].forEach((dotPosition) => {
      const dot = document.createElement('i');
      dot.className = `dot-position-${dotPosition}`;
      side.append(dot);
    });
  });
  rollingDie.dataset.value = value;
}

function setCenterDiceFace() {
  const fixedDots = diceFaces[6];
  centerDiceDots.forEach((dot, index) => {
    dot.hidden = !fixedDots.includes(index + 1);
    dot.className = `dot-position-${index + 1}`;
  });
}

function rollDice() {
  if (gameState.isRolling) return;

  const currentPlayer = players[gameState.currentPlayerIndex];
  gameState.isRolling = true;
  diceControl.disabled = true;
  diceModal.showModal();
  diceModalTitle.textContent = `${currentPlayer.name} tira el dado`;
  diceMessage.textContent = 'El dado esta rodando...';
  diceModalAction.disabled = true;
  diceModalAction.textContent = 'Esperar resultado';
  setDiceFace(6);
  rollingDie.classList.remove('has-result');
  rollingDie.classList.add('is-rolling');

  window.setTimeout(() => {
    const result = getDiceResult();
    gameState.lastRoll = result;
    gameState.isRolling = false;
    setDiceFace(result);
    rollingDie.classList.remove('is-rolling');
    rollingDie.classList.add('has-result');
    diceModalTitle.textContent = `Salio un ${result}`;
    diceMessage.textContent = result === 6
      ? `${currentPlayer.name} tiene un turno extra.`
      : `Ahora sigue ${players[(gameState.currentPlayerIndex + 1) % players.length].name}.`;
    diceModalAction.disabled = false;
    diceModalAction.textContent = result === 6 ? 'Tirar otra vez' : 'Siguiente turno';
  }, 900);
}

diceControl.addEventListener('click', rollDice);

diceModalAction.addEventListener('click', () => {
  if (gameState.lastRoll !== 6) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % players.length;
    updateTurnUI();
  }

  diceControl.disabled = false;
  diceModal.close();
});

updateTurnUI();
setDiceFace(6);
setCenterDiceFace();

function showScreen(screenToShow, screenToHide) {
  screenToHide.hidden = true;
  screenToShow.hidden = false;
  screenToShow.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

startButton.addEventListener('click', () => {
  showScreen(boardScreen, homeScreen);
});

backButton.addEventListener('click', () => {
  showScreen(homeScreen, boardScreen);
  startButton.focus({ preventScroll: true });
});
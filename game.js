const BOARD_WIDTH = 300;
const BOARD_HEIGHT = 600;
const BOARD_SIZES = {
  small: { cols: 8, rows: 16 },
  classic: { cols: 10, rows: 20 },
  large: { cols: 12, rows: 24 },
};
const BASE_SPEED = { easy: 850, normal: 570, hard: 350 };
const PIECES = [
  { name: 'I', color: '#55f2e0', shape: [[1,1,1,1]] },
  { name: 'O', color: '#ffe16a', shape: [[1,1],[1,1]] },
  { name: 'T', color: '#b18cff', shape: [[0,1,0],[1,1,1]] },
  { name: 'S', color: '#73f39b', shape: [[0,1,1],[1,1,0]] },
  { name: 'Z', color: '#ff6f9d', shape: [[1,1,0],[0,1,1]] },
  { name: 'J', color: '#6d9dff', shape: [[1,0,0],[1,1,1]] },
  { name: 'L', color: '#ffae68', shape: [[0,0,1],[1,1,1]] },
];

const boardCanvas = document.querySelector('#board');
boardCanvas.width = BOARD_WIDTH;
boardCanvas.height = BOARD_HEIGHT;
const ctx = boardCanvas.getContext('2d');
const nextCanvas = document.querySelector('#next');
const nextCtx = nextCanvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlay-title');
const overlayCopy = document.querySelector('#overlay-copy');
const overlayKicker = document.querySelector('#overlay-kicker');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const scoreNode = document.querySelector('#score');
const linesNode = document.querySelector('#lines');
const levelNode = document.querySelector('#level');
const difficultyButtons = [...document.querySelectorAll('.difficulty')];
const sizeButtons = [...document.querySelectorAll('.size-option')];
const dimensionsNode = document.querySelector('#board-dimensions');

let grid;
let current;
let nextPiece;
let bag = [];
let score = 0;
let lines = 0;
let difficulty = 'easy';
let selectedSize = 'classic';
let COLS = BOARD_SIZES[selectedSize].cols;
let ROWS = BOARD_SIZES[selectedSize].rows;
let CELL = BOARD_WIDTH / COLS;
let mode = 'idle'; // idle, playing, paused, over
let dropElapsed = 0;
let lastFrame = 0;

function emptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function shuffledBag() {
  const pieces = [...PIECES];
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

function drawPiece() {
  if (!bag.length) bag = shuffledBag();
  return bag.pop();
}

function makeActive(piece) {
  const shape = piece.shape.map((row) => [...row]);
  return { name: piece.name, color: piece.color, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 };
}

function collides(piece, dx = 0, dy = 0, shape = piece.shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const bx = piece.x + x + dx;
      const by = piece.y + y + dy;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && grid[by][bx]) return true;
    }
  }
  return false;
}

function spawn() {
  current = makeActive(nextPiece ?? drawPiece());
  nextPiece = drawPiece();
  drawNext();
  if (collides(current)) endGame();
}

function rotate() {
  const rotated = current.shape[0].map((_, i) => current.shape.map((row) => row[i]).reverse());
  for (const kick of [0, -1, 1, -2, 2]) {
    if (!collides(current, kick, 0, rotated)) {
      current.x += kick;
      current.shape = rotated;
      return;
    }
  }
}

function mergePiece() {
  current.shape.forEach((row, y) => row.forEach((value, x) => {
    const by = current.y + y;
    const bx = current.x + x;
    if (value && by >= 0) grid[by][bx] = current.color;
  }));

  let cleared = 0;
  grid = grid.filter((row) => {
    if (row.every(Boolean)) { cleared++; return false; }
    return true;
  });
  while (grid.length < ROWS) grid.unshift(Array(COLS).fill(null));
  if (cleared) {
    const points = [0, 100, 300, 500, 800][cleared] ?? cleared * 250;
    score += points * (Math.floor(lines / 10) + 1);
    lines += cleared;
    updateStats();
  }
  spawn();
}

function stepDown(soft = false) {
  if (!current || mode !== 'playing') return;
  if (!collides(current, 0, 1)) {
    current.y++;
    if (soft) { score++; updateStats(); }
  } else {
    mergePiece();
  }
}

function hardDrop() {
  if (mode !== 'playing') return;
  let distance = 0;
  while (!collides(current, 0, 1)) { current.y++; distance++; }
  score += distance * 2;
  updateStats();
  mergePiece();
}

function speed() {
  return Math.max(75, BASE_SPEED[difficulty] * (0.86 ** Math.floor(lines / 10)));
}

function updateStats() {
  scoreNode.textContent = String(score).padStart(6, '0');
  linesNode.textContent = String(lines).padStart(2, '0');
  levelNode.textContent = String(Math.floor(lines / 10) + 1).padStart(2, '0');
}

function updateBoardSize() {
  ({ cols: COLS, rows: ROWS } = BOARD_SIZES[selectedSize]);
  CELL = BOARD_WIDTH / COLS;
  dimensionsNode.textContent = `${COLS} × ${ROWS}`;
  grid = emptyGrid();
  current = null;
  drawBoard();
}

function drawCell(context, x, y, color, size = CELL, alpha = 1) {
  context.globalAlpha = alpha;
  context.shadowColor = color;
  context.shadowBlur = 11;
  context.fillStyle = color;
  context.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
  context.shadowBlur = 0;
  context.fillStyle = 'rgba(255,255,255,.2)';
  context.fillRect(x * size + 4, y * size + 4, size - 8, 2);
  context.strokeStyle = 'rgba(255,255,255,.3)';
  context.strokeRect(x * size + 2.5, y * size + 2.5, size - 5, size - 5);
  context.globalAlpha = 1;
}

function drawBoard() {
  ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  ctx.fillStyle = '#090d1b';
  ctx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
  ctx.strokeStyle = 'rgba(80,96,145,.18)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL + .5, 0); ctx.lineTo(x * CELL + .5, ROWS * CELL); ctx.stroke(); }
  for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL + .5); ctx.lineTo(COLS * CELL, y * CELL + .5); ctx.stroke(); }
  grid?.forEach((row, y) => row.forEach((color, x) => color && drawCell(ctx, x, y, color)));
  if (current && mode !== 'over') {
    let ghostY = current.y;
    while (!collides({ ...current, y: ghostY }, 0, 1)) ghostY++;
    current.shape.forEach((row, y) => row.forEach((value, x) => {
      if (value && ghostY + y >= 0) drawCell(ctx, current.x + x, ghostY + y, current.color, CELL, .18);
    }));
    current.shape.forEach((row, y) => row.forEach((value, x) => {
      if (value && current.y + y >= 0) drawCell(ctx, current.x + x, current.y + y, current.color);
    }));
  }
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  if (!nextPiece) return;
  const size = 20;
  const width = nextPiece.shape[0].length * size;
  const height = nextPiece.shape.length * size;
  const ox = (nextCanvas.width - width) / 2;
  const oy = (nextCanvas.height - height) / 2;
  nextPiece.shape.forEach((row, y) => row.forEach((value, x) => {
    if (!value) return;
    nextCtx.shadowColor = nextPiece.color;
    nextCtx.shadowBlur = 12;
    nextCtx.fillStyle = nextPiece.color;
    nextCtx.fillRect(ox + x * size + 2, oy + y * size + 2, size - 4, size - 4);
    nextCtx.shadowBlur = 0;
    nextCtx.fillStyle = 'rgba(255,255,255,.22)';
    nextCtx.fillRect(ox + x * size + 4, oy + y * size + 4, size - 8, 2);
  }));
}

function showOverlay(kicker, title, copy, buttonText) {
  overlayKicker.textContent = kicker;
  overlayTitle.textContent = title;
  overlayCopy.textContent = copy;
  startButton.innerHTML = `<span>▶</span> ${buttonText}`;
  overlay.classList.remove('hidden');
}

function startGame() {
  if (mode === 'paused') { mode = 'playing'; overlay.classList.add('hidden'); pauseButton.innerHTML = '<span>Ⅱ</span> 暂停游戏'; return; }
  grid = emptyGrid(); bag = []; score = 0; lines = 0; dropElapsed = 0;
  nextPiece = drawPiece();
  updateStats();
  mode = 'playing';
  pauseButton.disabled = false;
  pauseButton.innerHTML = '<span>Ⅱ</span> 暂停游戏';
  spawn();
  overlay.classList.add('hidden');
}

function pauseGame() {
  if (mode !== 'playing') return;
  mode = 'paused';
  pauseButton.innerHTML = '<span>▶</span> 继续游戏';
  showOverlay('PAUSED', '游戏已暂停', '准备好后继续挑战。', '继续游戏');
}

function endGame() {
  mode = 'over';
  pauseButton.disabled = true;
  showOverlay('GAME OVER', '游戏结束', `最终得分 ${String(score).padStart(6, '0')} · 消除 ${lines} 行`, '再来一局');
}

function frame(time = 0) {
  const delta = Math.min(time - lastFrame, 100);
  lastFrame = time;
  if (mode === 'playing') {
    dropElapsed += delta;
    if (dropElapsed >= speed()) { dropElapsed = 0; stepDown(); }
  }
  drawBoard();
  requestAnimationFrame(frame);
}

difficultyButtons.forEach((button) => button.addEventListener('click', () => {
  difficulty = button.dataset.level;
  difficultyButtons.forEach((item) => item.classList.toggle('active', item === button));
  if (mode === 'playing' || mode === 'paused') startGame();
}));
sizeButtons.forEach((button) => button.addEventListener('click', () => {
  const nextSize = button.dataset.size;
  if (nextSize === selectedSize) return;
  selectedSize = nextSize;
  sizeButtons.forEach((item) => item.classList.toggle('active', item === button));
  updateBoardSize();
  if (mode !== 'idle') {
    mode = 'idle';
    startGame();
  }
}));
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', () => mode === 'paused' ? startGame() : pauseGame());
document.querySelector('#restart').addEventListener('click', startGame);
document.addEventListener('keydown', (event) => {
  const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'p', 'P'];
  if (gameKeys.includes(event.key)) event.preventDefault();
  if (event.key === 'p' || event.key === 'P') { mode === 'playing' ? pauseGame() : mode === 'paused' && startGame(); return; }
  if (mode !== 'playing') return;
  if (event.key === 'ArrowLeft' && !collides(current, -1, 0)) current.x--;
  if (event.key === 'ArrowRight' && !collides(current, 1, 0)) current.x++;
  if (event.key === 'ArrowUp') rotate();
  if (event.key === 'ArrowDown') stepDown(true);
  if (event.key === ' ') hardDrop();
});

grid = emptyGrid();
nextPiece = drawPiece();
drawNext();
drawBoard();
requestAnimationFrame(frame);

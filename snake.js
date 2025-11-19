const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const retryBtn = document.getElementById("retry-btn");
const colorInput = document.getElementById("snake-color");

const COLS = 20;
const ROWS = 20;
const CELL_SIZE = canvas.width / COLS;

const DIRECTIONS = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
  w: { row: -1, col: 0 },
  s: { row: 1, col: 0 },
  a: { row: 0, col: -1 },
  d: { row: 0, col: 1 },
  W: { row: -1, col: 0 },
  S: { row: 1, col: 0 },
  A: { row: 0, col: -1 },
  D: { row: 0, col: 1 },
};

const DEFAULT_SNAKE_COLOR = "#2ee59d";
let snakeColor = DEFAULT_SNAKE_COLOR;
let snakeHeadColor = shadeColor(DEFAULT_SNAKE_COLOR, -0.25);

let snake = [];
let direction = { row: 0, col: 1 };
let pendingDirection = direction;
let food = null;
let loopId = null;
let speedMs = 160;
let score = 0;
let running = false;
let gameOver = false;
let paused = false;
let started = false;
let touchStartPoint = null;
let countdownRemaining = 0;
let countdownIntervalId = null;

function resetGame() {
  const centerRow = Math.floor(ROWS / 2);
  const centerCol = Math.floor(COLS / 2);
  snake = [
    { row: centerRow, col: centerCol },
    { row: centerRow, col: centerCol - 1 },
    { row: centerRow, col: centerCol - 2 },
  ];
  direction = { row: 0, col: 1 };
  pendingDirection = direction;
  speedMs = 160;
  score = 0;
  running = false;
  gameOver = false;
  paused = false;
  started = false;
  clearTimeout(loopId);
  clearCountdown();
  placeFood();
  updateScore();
  draw();
  statusEl.textContent = "Press Start to begin.";
  updatePauseButton();
  updateStartButtonState();
  updateControlVisibility();
}

function clearCountdown() {
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
  countdownRemaining = 0;
}

function shadeColor(hex, percent) {
  const normalized = Math.max(-1, Math.min(1, percent));
  const amount = Math.round(255 * normalized);
  const num = parseInt(hex.replace("#", ""), 16);
  const clamp = (value) => Math.max(0, Math.min(255, value));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function setSnakeColor(color) {
  snakeColor = color;
  snakeHeadColor = shadeColor(color, -0.25);
  draw();
}

function updateScore() {
  scoreEl.textContent = score.toString();
}

function startGame() {
  if (running || gameOver || started || countdownRemaining > 0) {
    return;
  }
  started = true;
  paused = false;
  clearCountdown();
  countdownRemaining = 3;
  statusEl.textContent = `Starting in ${countdownRemaining}...`;
  updateStartButtonState();
  updateControlVisibility();
  updatePauseButton();
  draw();
  countdownIntervalId = setInterval(() => {
    countdownRemaining -= 1;
    if (countdownRemaining > 0) {
      statusEl.textContent = `Starting in ${countdownRemaining}...`;
      draw();
      return;
    }
    clearCountdown();
    running = true;
    paused = false;
    statusEl.textContent = "Good luck!";
    updatePauseButton();
    updateControlVisibility();
    draw();
    scheduleTick();
  }, 1000);
}

function pauseGame() {
  if (!running) {
    return;
  }
  running = false;
  paused = true;
  clearTimeout(loopId);
  statusEl.textContent = "Paused.";
  updatePauseButton();
  updateControlVisibility();
}

function resumeGame() {
  if (running || gameOver || !paused) {
    return;
  }
  running = true;
  paused = false;
  statusEl.textContent = "Game resumed.";
  updatePauseButton();
  updateControlVisibility();
  scheduleTick();
}

function retryGame() {
  clearTimeout(loopId);
  resetGame();
}

function scheduleTick() {
  clearTimeout(loopId);
  loopId = setTimeout(() => {
    step();
    if (running) {
      scheduleTick();
    }
  }, speedMs);
}

function step() {
  direction = pendingDirection;
  const head = snake[0];
  const newHead = {
    row: head.row + direction.row,
    col: head.col + direction.col,
  };

  if (!insideBoard(newHead) || hitsBody(newHead)) {
    return endGame();
  }

  snake.unshift(newHead);
  if (food && newHead.row === food.row && newHead.col === food.col) {
    score += 1;
    updateScore();
    placeFood();
    speedMs = Math.max(60, speedMs * 0.95);
  } else {
    snake.pop();
  }
  draw();
}

function draw() {
  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();
  drawScreenOverlay();
}

function drawSnake() {
  ctx.fillStyle = snakeColor;
  snake.forEach(({ row, col }, idx) => {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    if (idx === 0) {
      ctx.fillStyle = snakeHeadColor;
      ctx.fillRect(x + 4, y + 4, CELL_SIZE - 8, CELL_SIZE - 8);
      ctx.fillStyle = snakeColor;
    }
  });
}

function drawFood() {
  if (!food) return;
  ctx.fillStyle = "#ff6b6b";
  ctx.fillRect(
    food.col * CELL_SIZE + 4,
    food.row * CELL_SIZE + 4,
    CELL_SIZE - 8,
    CELL_SIZE - 8
  );
}

function drawScreenOverlay() {
  const countingDown = countdownRemaining > 0;
  if (!paused && !gameOver && !countingDown) {
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const boxWidth = canvas.width * 0.8;
  const boxHeight = canvas.height * 0.55;
  const boxX = (canvas.width - boxWidth) / 2;
  const boxY = (canvas.height - boxHeight) / 2;

  ctx.fillStyle = "#050505";
  ctx.strokeStyle = "#2ee59d";
  ctx.lineWidth = 6;
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  const title = gameOver
    ? "GAME OVER"
    : countingDown
    ? countdownRemaining.toString()
    : "PAUSED";
  const subtext = gameOver
    ? "Press Retry to start again"
    : countingDown
    ? "Get ready to slither"
    : "Press Continue to resume";
  const retroLine = countingDown ? "- Starting soon -" : "- Snake v1.0 -";

  const previousTextAlign = ctx.textAlign;
  const previousBaseline = ctx.textBaseline;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#f8f8f2";
  ctx.font = "bold 48px 'Press Start 2P', 'VT323', system-ui, sans-serif";
  ctx.fillText(title, canvas.width / 2, boxY + boxHeight * 0.35);

  ctx.fillStyle = "#8ef6d6";
  ctx.font = "bold 20px 'VT323', system-ui, sans-serif";
  ctx.fillText(subtext, canvas.width / 2, boxY + boxHeight * 0.6);

  ctx.fillStyle = "#888";
  ctx.font = "14px 'VT323', system-ui, sans-serif";
  ctx.fillText(retroLine, canvas.width / 2, boxY + boxHeight * 0.78);

  ctx.textAlign = previousTextAlign;
  ctx.textBaseline = previousBaseline;
}

function placeFood() {
  const openCells = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!snake.some((seg) => seg.row === row && seg.col === col)) {
        openCells.push({ row, col });
      }
    }
  }
  if (!openCells.length) {
    food = null;
    statusEl.textContent = "You win! Board filled.";
    running = false;
    return;
  }
  food = openCells[Math.floor(Math.random() * openCells.length)];
}

function insideBoard(point) {
  return (
    point.row >= 0 && point.row < ROWS && point.col >= 0 && point.col < COLS
  );
}

function hitsBody(point) {
  return snake.some((segment) => segment.row === point.row && segment.col === point.col);
}

function endGame() {
  running = false;
  gameOver = true;
  clearTimeout(loopId);
  statusEl.textContent = `Game over! Final score: ${score}. Click Retry to play again.`;
  paused = false;
  updatePauseButton();
  updateControlVisibility();
}

function queueDirection(key) {
  const next = DIRECTIONS[key];
  if (!next) {
    return;
  }
  const opposite = { row: -direction.row, col: -direction.col };
  if (next.row === opposite.row && next.col === opposite.col) {
    return;
  }
  pendingDirection = next;
}

document.addEventListener("keydown", (event) => {
  if (DIRECTIONS[event.key]) {
    event.preventDefault();
    queueDirection(event.key);
  } else if (event.key === " ") {
    event.preventDefault();
    running ? pauseGame() : startGame();
  }
});

function handleSwipe(start, end) {
  if (!start || !end) {
    return;
  }
  const deltaX = end.clientX - start.clientX;
  const deltaY = end.clientY - start.clientY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const threshold = 30;
  if (Math.max(absX, absY) < threshold) {
    return;
  }

  if (absX > absY) {
    queueDirection(deltaX > 0 ? "d" : "a");
  } else {
    queueDirection(deltaY > 0 ? "s" : "w");
  }
}

const touchTarget = canvas || document;

touchTarget.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length > 0) {
      touchStartPoint = event.touches[0];
    }
  },
  { passive: true }
);

touchTarget.addEventListener(
  "touchend",
  (event) => {
    if (event.changedTouches.length > 0) {
      event.preventDefault();
      handleSwipe(touchStartPoint, event.changedTouches[0]);
      touchStartPoint = null;
    }
  },
  { passive: false }
);

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", () => {
  if (running) {
    pauseGame();
  } else if (!gameOver && paused) {
    resumeGame();
  }
});
retryBtn.addEventListener("click", retryGame);

if (colorInput) {
  colorInput.value = DEFAULT_SNAKE_COLOR;
  setSnakeColor(colorInput.value);
  colorInput.addEventListener("input", (event) => {
    setSnakeColor(event.target.value || DEFAULT_SNAKE_COLOR);
  });
}

resetGame();

function updatePauseButton() {
  if (!pauseBtn) {
    return;
  }
  if (running) {
    pauseBtn.textContent = "Pause";
    return;
  }
  pauseBtn.textContent = paused && !gameOver ? "Continue" : "Pause";
}

function updateStartButtonState() {
  if (!startBtn) {
    return;
  }
  startBtn.disabled = started;
}

function updateControlVisibility() {
  if (!startBtn || !pauseBtn || !retryBtn) {
    return;
  }
  const showStart = !started && !running && !gameOver;
  const showPause = started && !gameOver;
  startBtn.style.display = showStart ? "" : "none";
  pauseBtn.style.display = showPause ? "" : "none";
  retryBtn.style.display = gameOver ? "" : "none";
}

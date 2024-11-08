const {
  Component,
  Fragment,
  cloneElement,
  createContext,
  createElement,
  createRef,
  h,
  hydrate,
  isValidElement,
  options,
  render,
  toChildArray,
} = preact;

const {
  useCallback,
  useContext,
  useDebugValue,
  useEffect,
  useErrorBoundary,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} = preactHooks;

const CHAR_WIDTH = 150;
const CHAR_HEIGHT = 190;
const SPRITE_CHAR_WIDTH = 150;
const SPRITE_CHAR_HEIGHT = 190;
const CHARS_COUNT = 8;

const TEXT_WIDTH = CHAR_WIDTH * CHARS_COUNT;
const TEXT_HEIGHT = CHAR_HEIGHT;

const COLON_INDEX = 10;

const WIGGLE_COUNT = 3;
const WIGGLE_DURATION = (0.4 / WIGGLE_COUNT) * 1000;
const SCALE_FACTOR = 0.15;

const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;

// const MAIN_COLOR = "#e44F5C"; // pastel strawberry
const MAIN_COLOR = "#dcdcdc";
const PAUSE_COLOR = "#787878";
const BACKGROUND_COLOR = "#181818";
let digitColor = MAIN_COLOR;

const digitsSheet = new Image();
digitsSheet.src = "/sowon/digits.png";

const canvas = document.getElementById("clock");
const ctx = canvas.getContext("2d");

const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

// state
const pen = { x: 0, y: 0 };
let userScale = 1;
let fitScale = 1;
let wiggleIndex = 0;
let wiggleCooldown = WIGGLE_DURATION;
const fpsdt = {
  /** In ms */
  dt: 0,

  /** In ms */
  lastTime: performance.now(),
};

/** In ms */
let displayedTime = 0;

const getEffectiveDigitWidth = () =>
  Math.floor(CHAR_WIDTH * userScale * fitScale);
const getEffectiveDigitHeight = () =>
  Math.floor(CHAR_HEIGHT * userScale * fitScale);

const resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
};

const drawDigitAt = (digitIndex, wiggleIndex) => {
  const effectiveDigitWidth = getEffectiveDigitWidth();
  const effectiveDigitHeight = getEffectiveDigitHeight();

  offscreenCtx.reset();

  offscreenCtx.drawImage(
    digitsSheet,
    digitIndex * SPRITE_CHAR_WIDTH,
    wiggleIndex * SPRITE_CHAR_HEIGHT,
    SPRITE_CHAR_WIDTH,
    SPRITE_CHAR_HEIGHT,
    pen.x,
    pen.y,
    effectiveDigitWidth,
    effectiveDigitHeight
  );

  offscreenCtx.globalCompositeOperation = 'source-in';
  offscreenCtx.fillStyle = digitColor;
  offscreenCtx.fillRect(pen.x, pen.y, effectiveDigitWidth, effectiveDigitHeight);

  ctx.drawImage(offscreenCanvas, 0, 0);

  pen.x += effectiveDigitWidth;
};

const initialPen = () => {
  const textAspectRatio = TEXT_WIDTH / TEXT_HEIGHT;
  const windowAspectRatio = canvas.width / canvas.height;

  if (textAspectRatio > windowAspectRatio) {
    fitScale = canvas.width / TEXT_WIDTH;
  } else {
    fitScale = canvas.height / TEXT_HEIGHT;
  }

  const effectiveDigitWidth = getEffectiveDigitWidth();
  const effectiveDigitHeight = getEffectiveDigitHeight();

  pen.x = canvas.width / 2 - (effectiveDigitWidth * CHARS_COUNT) / 2;
  pen.y = canvas.height / 2 - effectiveDigitHeight / 2;
};

window.addEventListener("resize", resizeCanvas);

digitsSheet.onload = () => {
  resizeCanvas();
};

const onLoop = () => {
  fpsdt.dt = performance.now() - fpsdt.lastTime;

  if (fpsdt.dt >= FRAME_INTERVAL) {
    fpsdt.lastTime = performance.now();

    ctx.reset();

    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();

    initialPen();

    const t = displayedTime;

    const hours = Math.floor(t / 1000 / 60 / 60);
    drawDigitAt(Math.floor(hours / 10) % 10, wiggleIndex % WIGGLE_COUNT);
    drawDigitAt(Math.floor(hours) % 10, (wiggleIndex + 1) % WIGGLE_COUNT);

    drawDigitAt(COLON_INDEX, wiggleIndex % WIGGLE_COUNT);

    const minutes = Math.floor(t / 1000 / 60) % 60;
    drawDigitAt(
      Math.floor(minutes / 10) % 10,
      (wiggleIndex + 2) % WIGGLE_COUNT
    );
    drawDigitAt(Math.floor(minutes) % 10, (wiggleIndex + 3) % WIGGLE_COUNT);

    drawDigitAt(COLON_INDEX, (wiggleIndex + 1) % WIGGLE_COUNT);

    const seconds = Math.floor(t / 1000) % 60;
    drawDigitAt(
      Math.floor(seconds / 10) % 10,
      (wiggleIndex + 4) % WIGGLE_COUNT
    );
    drawDigitAt(Math.floor(seconds) % 10, (wiggleIndex + 5) % WIGGLE_COUNT);

    if (wiggleCooldown <= 0) {
      wiggleIndex = (wiggleIndex + 1) % WIGGLE_COUNT;
      wiggleCooldown = WIGGLE_DURATION;
    }
    wiggleCooldown -= fpsdt.dt;

    displayedTime += fpsdt.dt;
  }

  window.requestAnimationFrame(onLoop);
};
window.requestAnimationFrame(onLoop);

import 'dotenv/config';

import OBSWebSocket from 'obs-websocket-js';
import chokidar from 'chokidar';
import path from 'path';
import { existsSync, statSync } from 'fs';

// ---- CONFIG ----
const OBS_HOST = process.env.OBS_HOST || 'ws://127.0.0.1:4455';
const OBS_PASSWORD = process.env.OBS_PASSWORD;
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR;

// 5s cooldown to avoid double-triggers
const ARENA_START_DELAY = 5000;

if (!OBS_PASSWORD || !SCREENSHOT_DIR) {
  console.error('[ArenaRecorder] ❌ Missing environment variables.');
  console.error('Please set OBS_PASSWORD and SCREENSHOT_DIR.');
  console.error('Example: OBS_PASSWORD=secret SCREENSHOT_DIR="C:/WoW/Screenshots" node index.js');
  process.exit(1);
}

const isValidDirectory = (dirPath) => existsSync(dirPath) && statSync(dirPath).isDirectory();
if (!isValidDirectory(SCREENSHOT_DIR)) {
  console.error(`[ArenaRecorder] ❌ SCREENSHOT_DIR is an invalid directory: ${SCREENSHOT_DIR}`);
  process.exit(1);
}

const obs = new OBSWebSocket();
let lastScreenshot = 0;
let bRecording = false;

// Connect to OBS
async function connectOBS() {
  try {
    console.log(`[ArenaRecorder] Trying connection to OBS with ${OBS_HOST}`);
    await obs.connect(OBS_HOST, OBS_PASSWORD);
    console.log('[ArenaRecorder] Connected to OBS.');
  } catch (err) {
    console.error('[ArenaRecorder] Failed to connect to OBS:', err);
  }
}

// Determine start/end from screenshot being added
function handleScreenshot(filePath) {
  const now = Date.now();
  if (now - lastScreenshot < ARENA_START_DELAY) {
    // debounce
    return;
  }

  lastScreenshot = now;
  const msg = bRecording ?
    `[ArenaRecorder] Detected arena end screenshot → Stopping recording (${filePath})` :
    `[ArenaRecorder] Detected arena start screenshot → Starting recording (${filePath})`;
  console.log(msg)

  const cmd = bRecording ? `StopRecord` : `StartRecord`;
  obs.call(cmd)
  bRecording = cmd === `StartRecord`;
}

// Watcher
function watchScreenshots() {
  console.log(`[ArenaRecorder] Watching folder: ${SCREENSHOT_DIR}`);
  const watcher = chokidar.watch(SCREENSHOT_DIR, { persistent: true, ignoreInitial: true });

  watcher.on('add', (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.png') {
      handleScreenshot(filePath);
    }
  });
}

// Start everything
(async () => {
  await connectOBS();
  watchScreenshots();
})();


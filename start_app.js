/**
 * DRISHTI Platform Launcher
 * Runs mock API backend + Vite frontend and opens browser.
 */

const { spawn } = require('child_process');
const path = require('path');
const isWin = process.platform === 'win32';

// 1. Start Mock API & Intelligence server on port 8001
require('./mock_api_server.js');

// 2. Start Vite Dev Server on port 5173
const frontendDir = path.join(__dirname, 'frontend');
const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

const vite = spawn(process.execPath, [viteBin, '--port', '5173', '--host'], {
  cwd: frontendDir,
  stdio: 'inherit',
});

vite.on('error', (err) => {
  console.error('Failed to start Vite:', err);
});

// 3. Open default browser
setTimeout(() => {
  const url = 'http://localhost:5173';
  console.log(`\n======================================================`);
  console.log(`🚀 DRISHTI Railway Intelligence Platform is LIVE!`);
  console.log(`👉 Open in browser: ${url}`);
  console.log(`======================================================\n`);

  if (isWin) {
    spawn('cmd.exe', ['/c', 'start', url], { stdio: 'ignore', detached: true }).unref();
  } else if (process.platform === 'darwin') {
    spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
  } else {
    spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref();
  }
}, 2000);

// Graceful cleanup
const cleanUp = () => {
  try { vite.kill(); } catch (e) { }
  process.exit();
};

process.on('SIGINT', cleanUp);
process.on('SIGTERM', cleanUp);

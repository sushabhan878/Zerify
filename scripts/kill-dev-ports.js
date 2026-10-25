/**
 * Kills any process listening on the Zerify dev ports (frontend 3000,
 * admin 3001, docs 3002, landing 3003, backend 4000).
 *
 * Run before `turbo dev` (see `npm run dev:fresh`) so a stale server from a
 * previous session can never cause EADDRINUSE crashes on startup.
 */
const { execSync } = require('child_process');

const DEV_PORTS = [3000, 3001, 3002, 3003, 4000];

const output = execSync('netstat -ano', { encoding: 'utf8' });
const pids = new Set();

for (const line of output.split('\n')) {
  const cols = line.trim().split(/\s+/);
  if (cols.length < 5 || cols[3] !== 'LISTENING') continue;
  const port = Number(cols[1].replace(/^.*:/, ''));
  const pid = Number(cols[4]);
  if (DEV_PORTS.includes(port) && pid > 0) pids.add(pid);
}

if (pids.size === 0) {
  console.log('[dev:fresh] No stale dev servers found — ports are free.');
  process.exit(0);
}

for (const pid of pids) {
  try {
    execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'pipe' });
    console.log(`[dev:fresh] Killed stale dev process (pid ${pid})`);
  } catch {
    console.log(`[dev:fresh] Could not kill pid ${pid} (already exited?)`);
  }
}

console.log('[dev:fresh] All dev ports released. Starting fresh…');

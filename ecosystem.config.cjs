/**
 * PM2 — Scar Alpha Web UI (static dist from scar_alpha_web)
 *
 * Usage:
 *   chmod +x start-webapp-pm2.sh
 *   ./start-webapp-pm2.sh
 */
const path = require('path');

const port = process.env.WEBAPP_PORT || '4175';

module.exports = {
  apps: [
    {
      name: 'scaralpha-webapp',
      cwd: __dirname,
      script: 'npx',
      args: `serve -s dist -l tcp://0.0.0.0:${port}`,
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      kill_timeout: 8000,
      kill_retry_time: 100,
      wait_ready: false,
      error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
      merge_logs: true,
      time: true,
      max_size: '20M',
      retain: 3,
      env: {
        NODE_ENV: 'production',
        WEBAPP_PORT: port,
        PATH: process.env.PATH || '',
      },
    },
  ],
};

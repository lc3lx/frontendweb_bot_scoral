#!/usr/bin/env bash
# Scar Alpha Web UI — build + run with PM2
#
# On VPS:
#   cd /home/web/webapp
#   cp .env.production.example .env.production   # optional: API URL for future use
#   chmod +x start-webapp-pm2.sh
#   ./start-webapp-pm2.sh
#
# Commands:
#   ./start-webapp-pm2.sh           # build + start/restart
#   ./start-webapp-pm2.sh restart   # restart only (no rebuild)
#   ./start-webapp-pm2.sh stop
#   ./start-webapp-pm2.sh delete
#   ./start-webapp-pm2.sh logs
#   ./start-webapp-pm2.sh status
#   ./start-webapp-pm2.sh build

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

APP_NAME="scaralpha-webapp"
LOG_DIR="$ROOT/logs"
WEBAPP_PORT="${WEBAPP_PORT:-4175}"

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "==> $*"; }
ok() { echo "OK: $*"; }
need() { command -v "$1" >/dev/null 2>&1; }

ensure_node() {
  need node || die "node missing — install Node 20 first"
  need npm || die "npm missing — install Node 20 first"
}

ensure_pm2() {
  if need pm2; then
    return 0
  fi
  info "Installing PM2 globally..."
  npm install -g pm2
  need pm2 || die "pm2 install failed"
}

load_env() {
  if [[ -f "$ROOT/.env.production" ]]; then
    info "Using $ROOT/.env.production for build"
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env.production"
    set +a
  elif [[ -f "$ROOT/.env" ]]; then
    info "Using $ROOT/.env for build"
    set -a
    # shellcheck disable=SC1091
    source "$ROOT/.env"
    set +a
  fi

  if [[ -n "${VITE_API_BASE_URL:-}" ]]; then
    ok "VITE_API_BASE_URL=${VITE_API_BASE_URL}"
  else
    echo "WARN: VITE_API_BASE_URL empty — UI-only build is OK; set in .env.production when API is wired"
  fi

  export WEBAPP_PORT
}

install_deps() {
  info "npm install..."
  npm install
  if ! npm ls serve >/dev/null 2>&1; then
    npm install --save-dev serve
  fi
}

build_webapp() {
  ensure_node
  mkdir -p "$LOG_DIR"
  install_deps
  info "Building scar-alpha-web (tsc + vite)..."
  npm run build
  [[ -d "$ROOT/dist" ]] || die "dist/ missing after build"
  ok "Build done → $ROOT/dist"
}

pm2_start_or_restart() {
  ensure_pm2
  mkdir -p "$LOG_DIR"
  export WEBAPP_PORT

  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    info "Recreating PM2 app: $APP_NAME"
    pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  fi

  info "Starting PM2 app: $APP_NAME on 0.0.0.0:${WEBAPP_PORT}"
  pm2 start "$ROOT/ecosystem.config.cjs" --update-env
  pm2 save
  ok "Webapp PM2 running"
  sleep 1
  if curl -fsS "http://127.0.0.1:${WEBAPP_PORT}/" >/dev/null 2>&1; then
    ok "Webapp OK → http://127.0.0.1:${WEBAPP_PORT}/"
  else
    echo "WARN: webapp not responding yet — check: pm2 logs $APP_NAME"
  fi
}

main() {
  local cmd="${1:-start}"
  load_env

  case "$cmd" in
    start|"")
      build_webapp
      pm2_start_or_restart
      echo ""
      echo "Webapp:   http://0.0.0.0:${WEBAPP_PORT}/"
      echo "API base: ${VITE_API_BASE_URL:-'(empty / same-origin)'}"
      echo "Logs:     pm2 logs $APP_NAME"
      ;;
    restart)
      ensure_pm2
      export WEBAPP_PORT
      if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
        pm2 restart "$APP_NAME" --update-env
      else
        build_webapp
        pm2_start_or_restart
      fi
      ;;
    stop)
      ensure_pm2
      pm2 stop "$APP_NAME" || true
      ;;
    delete|rm)
      ensure_pm2
      pm2 delete "$APP_NAME" || true
      pm2 save || true
      ;;
    logs)
      ensure_pm2
      pm2 logs "$APP_NAME"
      ;;
    status|list)
      ensure_pm2
      pm2 status
      curl -fsSI "http://127.0.0.1:${WEBAPP_PORT}/" | head -n 5 || echo "webapp: down"
      ;;
    build)
      build_webapp
      ;;
    help|-h|--help)
      sed -n '1,20p' "$0"
      ;;
    *)
      die "Unknown command: $cmd (start|restart|stop|logs|status|build)"
      ;;
  esac
}

main "${1:-start}"

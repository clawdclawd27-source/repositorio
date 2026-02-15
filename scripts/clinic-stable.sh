#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/clinica-backend"
FRONTEND_DIR="$ROOT_DIR/clinica-web"

cmd="${1:-start}"

start_backend() {
  (cd "$BACKEND_DIR" && nohup npm run serve:stable > /tmp/clinica-backend.log 2>&1 &)
}

start_frontend() {
  (cd "$FRONTEND_DIR" && nohup npm run serve:stable > /tmp/clinica-web.log 2>&1 &)
}

build_all() {
  (cd "$BACKEND_DIR" && npm run build)
  (cd "$FRONTEND_DIR" && npm run build)
}

kill_ports() {
  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 5173/tcp 2>/dev/null || true
}

status() {
  echo "== Portas =="
  ss -ltnp | grep -E ':3000|:5173' || true
  echo
  echo "== Últimos logs backend =="
  tail -n 20 /tmp/clinica-backend.log 2>/dev/null || true
  echo
  echo "== Últimos logs frontend =="
  tail -n 20 /tmp/clinica-web.log 2>/dev/null || true
}

case "$cmd" in
  start)
    kill_ports
    start_backend
    start_frontend
    sleep 1
    status
    ;;
  rebuild)
    kill_ports
    build_all
    start_backend
    start_frontend
    sleep 1
    status
    ;;
  stop)
    kill_ports
    echo "Serviços parados."
    ;;
  status)
    status
    ;;
  *)
    echo "Uso: $0 {start|rebuild|stop|status}"
    exit 1
    ;;
esac

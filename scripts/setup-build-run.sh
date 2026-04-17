#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

MODE="${1:-all}"

print_usage() {
  cat <<USAGE
Usage: bash scripts/setup-build-run.sh [all|build|run|--help]

Modes:
  all    Install dependencies, prepare env files, build frontend, and run backend+frontend (default)
  build  Install dependencies, prepare env files, and build frontend only
  run    Prepare env files and run backend+frontend
USAGE
}

prepare_env_files() {
  if [[ ! -f "$BACKEND_DIR/.env" && -f "$BACKEND_DIR/.env.example" ]]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
    echo "Created backend/.env from .env.example"
  fi

  if [[ ! -f "$FRONTEND_DIR/.env" && -f "$FRONTEND_DIR/.env.example" ]]; then
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
    echo "Created frontend/.env from .env.example"
  fi
}

install_dependencies() {
  echo "Installing backend dependencies..."
  (cd "$BACKEND_DIR" && npm install)

  echo "Installing frontend dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
}

build_frontend() {
  echo "Building frontend..."
  (cd "$FRONTEND_DIR" && npm run build)
}

run_services() {
  echo "Starting backend on http://localhost:5001 ..."
  (cd "$BACKEND_DIR" && npm start) &
  BACKEND_PID=$!

  echo "Starting frontend on http://localhost:5173 ..."
  (cd "$FRONTEND_DIR" && npm run dev) &
  FRONTEND_PID=$!

  echo "Backend PID: $BACKEND_PID"
  echo "Frontend PID: $FRONTEND_PID"
  echo "Press Ctrl+C to stop both services."

  cleanup() {
    for pid in "$BACKEND_PID" "$FRONTEND_PID"; do
      if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
    done
  }

  trap cleanup EXIT INT TERM

  wait "$BACKEND_PID" "$FRONTEND_PID"
}

case "$MODE" in
  --help|-h)
    print_usage
    ;;
  all)
    prepare_env_files
    install_dependencies
    build_frontend
    run_services
    ;;
  build)
    prepare_env_files
    install_dependencies
    build_frontend
    ;;
  run)
    prepare_env_files
    run_services
    ;;
  *)
    echo "Unknown mode: $MODE"
    print_usage
    exit 1
    ;;
esac

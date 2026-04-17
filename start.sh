#!/bin/bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
  echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

get_backend_port() {
  local env_file="$PROJECT_ROOT/backend/.env"
  local example_file="$PROJECT_ROOT/backend/.env.example"

  if [ -f "$env_file" ]; then
    grep -E '^PORT=' "$env_file" | tail -n 1 | cut -d'=' -f2- || true
  elif [ -f "$example_file" ]; then
    grep -E '^PORT=' "$example_file" | tail -n 1 | cut -d'=' -f2- || true
  fi
}

has_npm_script() {
  local script="$1"
  if node - "$script" <<'NODE'
const fs = require('fs');
const scriptName = process.argv[2];

try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasScript =
    pkg.scripts &&
    Object.prototype.hasOwnProperty.call(pkg.scripts, scriptName);
  process.exit(hasScript ? 0 : 1);
} catch {
  process.exit(2);
}
NODE
  then
    return 0
  fi

  local node_status=$?
  if [ "$node_status" -eq 1 ]; then
    return 1
  fi

  echo "Failed to check npm script '$script': unable to read package.json" >&2
  exit 1
}

ensure_env_file() {
  local target="$1"
  local example="$2"
  local label="$3"

  if [ ! -f "$target" ] && [ -f "$example" ]; then
    print_warning "$label .env not found. Creating from example..."
    cp "$example" "$target"
    print_warning "Please review $target before running in production."
  fi
}

cleanup() {
  if [ -n "${BACKEND_PID:-}" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "${FRONTEND_PID:-}" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "🚀 Starting MedResource Intelligence System..."

ensure_env_file "$PROJECT_ROOT/backend/.env" "$PROJECT_ROOT/backend/.env.example" "Backend"
ensure_env_file "$PROJECT_ROOT/frontend/.env" "$PROJECT_ROOT/frontend/.env.example" "Frontend"

print_info "Installing and starting backend..."
cd "$PROJECT_ROOT/backend"
npm install
if has_npm_script dev; then
  npm run dev &
else
  npm start &
fi
BACKEND_PID=$!

print_info "Installing and starting frontend..."
cd "$PROJECT_ROOT/frontend"
npm install
if has_npm_script dev; then
  npm run dev &
else
  npm start &
fi
FRONTEND_PID=$!

BACKEND_LOCAL_PORT="$(get_backend_port)"
BACKEND_LOCAL_PORT="${BACKEND_LOCAL_PORT:-5001}"

echo ""
echo "==========================================="
print_success "Services started"
echo "==========================================="
echo "Backend:  http://localhost:${BACKEND_LOCAL_PORT}"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop all services"
echo "==========================================="

wait "$BACKEND_PID" "$FRONTEND_PID"

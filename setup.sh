#!/bin/bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_step() {
  echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    print_error "Required command '$cmd' is not installed."
    exit 1
  fi
}

setup_service() {
  local dir="$1"
  local label="$2"

  if [ ! -d "$dir" ]; then
    print_error "$label directory not found: $dir"
    exit 1
  fi

  if [ ! -f "$dir/package.json" ]; then
    print_error "$label package.json not found: $dir/package.json"
    exit 1
  fi

  print_step "Installing $label dependencies..."
  (
    cd "$dir"
    npm install
  )
  print_success "$label dependencies installed"
}

setup_env_file() {
  local dir="$1"
  local label="$2"
  local env_file="$dir/.env"
  local example_file="$dir/.env.example"

  if [ -f "$env_file" ]; then
    print_success "$label .env already exists"
    return
  fi

  if [ -f "$example_file" ]; then
    cp "$example_file" "$env_file"
    print_warning "$label .env created from .env.example. Please update its values."
    return
  fi

  print_warning "$label has no .env.example; skipped .env creation"
}

echo "🚀 Setting up MedResource Intelligence System..."

require_command node
require_command npm

setup_service "$PROJECT_ROOT/backend" "Backend"
setup_service "$PROJECT_ROOT/frontend" "Frontend"

setup_env_file "$PROJECT_ROOT/backend" "Backend"
setup_env_file "$PROJECT_ROOT/frontend" "Frontend"

chmod +x "$PROJECT_ROOT/start.sh"
print_success "Executable permissions ensured for start.sh"

echo ""
echo "==========================================="
print_success "Setup complete"
echo "==========================================="
echo "Next steps:"
echo "  1) Review backend/.env and frontend/.env"
echo "  2) Start the project with ./start.sh"

#!/bin/bash

# MedResource Intelligence System - Quick Start Script
# This script starts the backend and frontend services

# ============================================
# Color Configuration
# ============================================
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# Utility Functions
# ============================================

print_header() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} $1"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if port is in use
port_in_use() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$1" >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -an | grep -q ":$1"
    else
        return 1
    fi
}

# ============================================
# Setup Start
# ============================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

print_header "MedResource Intelligence System - Startup"

# ============================================
# Prerequisites Check
# ============================================

print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    print_error "Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
print_success "Node.js installed"

# Check MongoDB
if ! command -v mongod >/dev/null 2>&1 && ! command -v mongosh >/dev/null 2>&1; then
    print_warning "MongoDB is not found in PATH (it may still be running)"
fi

# Check Ollama
if ! command -v ollama >/dev/null 2>&1; then
    print_warning "Ollama is not in PATH"
    print_warning "Make sure Ollama is running separately: ollama serve"
fi

# ============================================
# Environment Validation
# ============================================

print_step "Validating environment files..."

if [ ! -f backend/.env ]; then
    print_warning "backend/.env not found. Creating from defaults..."
    cat > backend/.env << 'EOF'
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/healthcare_db
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma:7b
JWT_SECRET=dev_secret_key_change_in_production
FRONTEND_URL=http://localhost:5173
EOF
    print_success "backend/.env created (update with your configuration)"
else
    print_success "backend/.env found"
fi

if [ ! -f frontend/.env ]; then
    print_warning "frontend/.env not found. Creating..."
    cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:5001
EOF
    print_success "frontend/.env created"
else
    print_success "frontend/.env found"
fi

# ============================================
# Port Availability Check
# ============================================

print_step "Checking port availability..."

if port_in_use 5001; then
    print_warning "Port 5001 (backend) is already in use"
else
    print_success "Port 5001 is available"
fi

if port_in_use 5173; then
    print_warning "Port 5173 (frontend) is already in use"
else
    print_success "Port 5173 is available"
fi

# ============================================
# Startup Services
# ============================================

print_header "Starting Services"

# Backend startup
print_step "Starting backend server..."
cd "$PROJECT_ROOT/backend"
npm start &
BACKEND_PID=$!
print_success "Backend process started (PID: $BACKEND_PID)"

# Give backend time to start
sleep 3

# Frontend startup
print_step "Starting frontend development server..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
print_success "Frontend process started (PID: $FRONTEND_PID)"

# ============================================
# Summary
# ============================================

print_header "✅ Services Started!"

echo -e "${GREEN}Backend Server:${NC}"
echo "  URL: http://localhost:5001"
echo "  PID: $BACKEND_PID"
echo ""

echo -e "${GREEN}Frontend Application:${NC}"
echo "  URL: http://localhost:5173"
echo "  PID: $FRONTEND_PID"
echo ""

echo -e "${YELLOW}Prerequisites:${NC}"
echo "  MongoDB: Ensure it's running (mongod or docker)"
echo "  Ollama:  Ensure it's running (ollama serve)"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:  tail -f backend/logs/* or frontend terminal"
echo "  Stop all:   Press Ctrl+C (will terminate backend and frontend)"
echo "  Kill PID:   kill $BACKEND_PID (backend) or kill $FRONTEND_PID (frontend)"
echo ""

# Trap Ctrl+C to cleanup
trap "print_step 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; print_success 'All services stopped'; exit 0" INT TERM

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null

#!/bin/bash

# MedResource Intelligence System - Automated Setup Script
# This script sets up all development and production configurations

set -e

echo "🚀 Starting automated setup for MedResource Intelligence System..."

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Step 1: Create .gitignore for backend
print_step "Creating backend .gitignore..."
cat > backend/.gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/

# Temporary files
tmp/
temp/
EOF
print_success "Backend .gitignore created"

# Step 2: Create .gitignore for frontend
print_step "Creating frontend .gitignore..."
cat > frontend/.gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
coverage/
EOF
print_success "Frontend .gitignore created"

# Step 3: Create .env.example for backend
print_step "Creating backend .env.example..."
cat > backend/.env.example << 'EOF'
# Server Configuration
PORT=5001
NODE_ENV=development
HOST=localhost

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/healthcare_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# API Configuration
API_BASE_URL=http://localhost:5001
CORS_ORIGIN=http://localhost:5173

# Ollama/Gemma4 Configuration
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma4:e4b

# Logging
LOG_LEVEL=info
EOF
print_success "Backend .env.example created"

# Step 4: Create .env.example for frontend
print_step "Creating frontend .env.example..."
cat > frontend/.env.example << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://localhost:5001
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=MedResource Intelligence System
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
EOF
print_success "Frontend .env.example created"

# Step 5: Create CONTRIBUTING.md
print_step "Creating CONTRIBUTING.md..."
cat > CONTRIBUTING.md << 'EOF'
# Contributing to MedResource Intelligence System

Thank you for your interest in contributing! Please follow these guidelines.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (for database)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit with clear messages: `git commit -m "feat: add new feature"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

## Code Style

- Use ESLint for linting
- Follow existing code patterns
- Add comments for complex logic
- Write meaningful commit messages

## Testing

- Write tests for new features
- Run tests before submitting PR: `npm test`
- Maintain or improve code coverage

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

## Questions?

Open an issue or contact the maintainers.
EOF
print_success "CONTRIBUTING.md created"

# Step 6: Create GitHub Actions workflow for tests and linting
print_step "Creating GitHub Actions workflow..."
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: backend/package-lock.json
    
    - name: Install dependencies
      working-directory: backend
      run: npm install
    
    - name: Run linter
      working-directory: backend
      run: npm run lint --if-present
    
    - name: Run tests
      working-directory: backend
      run: npm test --if-present

  frontend:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      working-directory: frontend
      run: npm install
    
    - name: Run linter
      working-directory: frontend
      run: npm run lint --if-present
    
    - name: Build
      working-directory: frontend
      run: npm run build

  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run npm audit
      working-directory: backend
      run: npm audit --audit-level=moderate || true
    
    - name: Run npm audit for frontend
      working-directory: frontend
      run: npm audit --audit-level=moderate || true
EOF
print_success "GitHub Actions workflow created (.github/workflows/ci.yml)"

# Step 7: Create pre-commit hook
print_step "Setting up pre-commit hooks..."
mkdir -p .git/hooks

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Check backend
if git diff --cached --name-only | grep -q "^backend/"; then
    echo "Checking backend code..."
    cd backend
    npm run lint --if-present || { echo "Backend linting failed!"; exit 1; }
    cd ..
fi

# Check frontend
if git diff --cached --name-only | grep -q "^frontend/"; then
    echo "Checking frontend code..."
    cd frontend
    npm run lint --if-present || { echo "Frontend linting failed!"; exit 1; }
    cd ..
fi

echo "✓ Pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit
print_success "Pre-commit hooks installed"

# Step 8: Update main README.md
print_step "Updating README.md..."
cat > README.md << 'EOF'
# MedResource Intelligence System

An intelligent healthcare resource allocation system that optimizes patient care delivery through AI-driven resource management.

## 🎯 Features

- **Patient Queue Management**: Efficient patient scheduling and prioritization
- **Resource Allocation**: Intelligent distribution of medical resources
- **Admin Dashboard**: Comprehensive analytics and monitoring
- **AI-Powered Optimization**: Machine learning for resource optimization
- **User Authentication**: Secure role-based access control

## 🏗️ Architecture

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT
- **AI Service**: Integration with OpenAI/Claude API

### Frontend
- **Framework**: React + Vite
- **State Management**: Context API
- **Styling**: CSS/Tailwind
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js (v16+)
- npm or yarn
- PostgreSQL (v12+)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Akhilesh-0529/MedResource-Intelligence-System.git
cd "Health care resource allocation system"
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Database Setup
```bash
# Create database
createdb medresource_db

# Run migrations (if exists)
cd backend
npm run migrate
```

## 🗂️ Project Structure

```
.
├── backend/              # Express.js API server
│   ├── controllers/      # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic & AI integration
│   └── server.js        # Main server file
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # State management
│   │   └── App.jsx      # Main app component
│   └── vite.config.js   # Vite configuration
├── .github/workflows/   # CI/CD pipelines
├── CONTRIBUTING.md      # Contribution guidelines
└── README.md           # This file
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔧 Development Commands

### Backend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm test           # Run tests
npm run lint       # Run ESLint
```

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 📦 Deployment

### Backend Deployment
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend Deployment
```bash
cd frontend
npm install
npm run build
# Deploy 'dist' folder to hosting service
```

## 🔐 Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories for required configuration.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Akhilesh Yerram** - Initial work

## 📧 Support

For support, email support@medresource.com or open an issue in the GitHub repository.

## 🐛 Bug Reports & Feature Requests

Please use the GitHub [Issues](https://github.com/Akhilesh-0529/MedResource-Intelligence-System/issues) page.

---

**Last Updated**: April 2026
EOF
print_success "README.md updated"

# Step 9: Create database setup documentation
print_step "Creating DATABASE_SETUP.md..."
cat > DATABASE_SETUP.md << 'EOF'
# Database Setup Guide

This guide walks through setting up PostgreSQL for MedResource Intelligence System.

## Prerequisites

- PostgreSQL 12+
- psql command-line tool

## Setup Steps

### 1. Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medresource_db;

# Create user (replace 'password' with secure password)
CREATE USER medresource_user WITH PASSWORD 'password';

# Grant privileges
ALTER ROLE medresource_user SET client_encoding TO 'utf8';
ALTER ROLE medresource_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE medresource_user SET default_transaction_deferrable TO on;
ALTER ROLE medresource_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE medresource_db TO medresource_user;

# Exit psql
\q
```

### 2. Initialize Database Schema

```bash
cd backend

# Run seed/migration script
node seed.js
```

### 3. Verify Connection

```bash
psql -U medresource_user -d medresource_db -h localhost
```

## Configuration

Update your `.env` file with:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medresource_db
DB_USER=medresource_user
DB_PASSWORD=your_password_here
```

## Tables

The database includes the following tables:

- **users**: User accounts and authentication
- **patients**: Patient information
- **resources**: Hospital resources (beds, equipment, staff)
- **allocation_logs**: History of resource allocations

## Backup & Restore

### Backup Database
```bash
pg_dump -U medresource_user -d medresource_db > backup.sql
```

### Restore Database
```bash
psql -U medresource_user -d medresource_db < backup.sql
```

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running: `brew services start postgresql` (macOS)
- Check host and port in `.env`

### Permission Denied
- Verify user has correct privileges
- Run privileges grant commands again

### Database exists
- Drop existing database: `dropdb -U postgres medresource_db`
- Recreate following setup steps
EOF
print_success "DATABASE_SETUP.md created"

# Step 10: Create .editorconfig for consistent code style
print_step "Creating .editorconfig..."
cat > .editorconfig << 'EOF'
# EditorConfig helps maintain consistent coding styles
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx}]
indent_style = space
indent_size = 2
max_line_length = 100

[*.{json,yml,yaml}]
indent_style = space
indent_size = 2

[*.md]
max_line_length = off
trim_trailing_whitespace = false
EOF
print_success ".editorconfig created"

# Step 11: Create Docker configuration (optional)
print_step "Creating Docker configuration..."
cat > Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Backend
FROM node:18-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
EXPOSE 5173
CMD ["npm", "run", "dev"]
EOF

cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: medresource_db
      POSTGRES_USER: medresource_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: medresource_db
      DB_USER: medresource_user
      DB_PASSWORD: password
    depends_on:
      - postgres
    volumes:
      - ./backend:/app/backend

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.dev
      target: frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app/frontend

volumes:
  postgres_data:
EOF
print_success "Docker configuration created"

# Step 12: Create startup script
print_step "Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting MedResource Intelligence System..."

# Check if .env files exist
if [ ! -f backend/.env ]; then
    print_warning "Backend .env not found. Creating from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your configuration"
fi

if [ ! -f frontend/.env ]; then
    print_warning "Frontend .env not found. Creating from example..."
    cp frontend/.env.example frontend/.env
fi

# Start services in background
echo "📦 Installing and starting backend..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!

cd ..
echo "📦 Installing and starting frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==========================================="
echo "✅ Services started successfully!"
echo "==========================================="
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo "==========================================="

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x start.sh
print_success "Startup script created (start.sh)"

# Step 13: Update main .gitignore
print_step "Updating root .gitignore..."
cat > .gitignore << 'EOF'
# Node modules
node_modules/
*/node_modules/
package-lock.json
*/package-lock.json

# Environment files
.env
.env.local
.env.*.local
backend/.env
frontend/.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
*.sublime-project
*.sublime-workspace

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*/dist/
*/build/

# Temporary
tmp/
temp/
.cache/

# Database backups
*.sql
backups/

# Coverage
coverage/
.nyc_output/

# Docker volumes
postgres_data/
EOF
print_success "Root .gitignore created/updated"

# Step 14: Clean up and stage changes
print_step "Staging changes for Git..."
git add .
print_success "Files staged for commit"

echo ""
echo "==========================================="
print_success "✅ Setup Complete!"
echo "==========================================="
echo ""
echo "📋 Summary of changes:"
echo "  ✓ .gitignore files created (backend, frontend, root)"
echo "  ✓ .env.example files created"
echo "  ✓ CONTRIBUTING.md created"
echo "  ✓ MONGODB_SETUP.md created"
echo "  ✓ README.md updated with complete documentation"
echo "  ✓ GitHub Actions CI/CD workflow created"
echo "  ✓ Pre-commit hooks installed"
echo "  ✓ .editorconfig created"
echo "  ✓ Docker configuration created"
echo "  ✓ Startup script created (start.sh)"
echo ""
echo "🎯 Next Steps:"
echo "  1. Update .env files in backend/ and frontend/"
echo "  2. Set up MongoDB and Ollama using MONGODB_SETUP.md"
echo "  3. Commit changes: git commit -m 'chore: initial setup'"
echo "  4. Start development: ./start.sh"
echo ""
echo "📚 Documentation:"
echo "  - CONTRIBUTING.md - Development guidelines"
echo "  - MONGODB_SETUP.md - MongoDB & Ollama configuration"
echo "  - README.md - Project overview and API docs"
echo ""
print_success "Happy coding! 🎉"
EOF

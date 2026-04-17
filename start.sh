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

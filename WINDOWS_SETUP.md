# Windows Setup Guide for MedResource Intelligence System

Complete step-by-step guide for setting up the healthcare resource allocation system on Windows.

---

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Verification](#verification)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## System Requirements

**Operating System:** Windows 10 (Build 19041+) or Windows 11

**Hardware:**
- CPU: Intel/AMD 64-bit processor
- RAM: 8GB+ recommended (for Ollama AI inference)
- Disk Space: 2GB+ (for dependencies and AI models)

**Software Prerequisites:**
- Node.js v16+ ([Download](https://nodejs.org/))
- Git ([Download](https://gitforwindows.org/))
- MongoDB Community Edition ([Download](https://www.mongodb.com/try/download/community))
- Ollama ([Download](https://ollama.ai))
- PowerShell 5.0+ or Command Prompt
- Administrator access (for service installation)

---

## Installation Steps

### Step 1: Install Node.js and npm

1. Download Node.js LTS from https://nodejs.org/
2. Run the installer
3. Accept the default settings or customize as needed
4. Check "Add to PATH" (should be default)
5. Complete installation
6. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Install Git

1. Download Git from https://gitforwindows.org/
2. Run the installer
3. Choose "Use Git from the Windows Command Prompt" during setup
4. Complete installation
5. Verify installation:
   ```powershell
   git --version
   ```

### Step 3: Clone the Repository

```powershell
# Choose a location (e.g., Desktop or Documents)
cd Desktop

# Clone repository
git clone https://github.com/Akhilesh-0529/MedResource-Intelligence-System.git

# Navigate to project
cd "Health care resource allocation system"

# List contents to verify
dir
```

### Step 4: Install MongoDB Community Edition

#### Option A: Direct Installer (Easiest)
1. Download MongoDB Community from: https://www.mongodb.com/try/download/community
2. Run MongoDB-Community-Edition-Server.exe
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. Uncheck "Run the MongoDB installer as a Windows Service now" (we'll start it manually first)
6. Continue with installation
7. Installation completes with MongoDB running as a Windows Service

#### Option B: Chocolatey (If installed)
```powershell
# Run PowerShell as Administrator
choco install mongodb-community
```

#### Verify MongoDB Installation
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Connect to MongoDB
mongosh mongodb://localhost:27017

# Exit mongosh
exit
```

**If MongoDB command not found:**
1. Press `Win + R`, type `services.msc`
2. Look for "MongoDB Server"
3. Right-click and select "Start" if it's stopped
4. Add MongoDB to PATH:
   - Control Panel → System → Advanced System Settings → Environment Variables
   - Add: `C:\Program Files\MongoDB\Server\7.0\bin` to PATH
   - Restart PowerShell and try again

### Step 5: Install Ollama

1. Download Ollama from https://ollama.ai
2. Run OllamaSetup.exe
3. Follow the installation wizard
4. Ollama will be added to your system PATH automatically
5. Restart PowerShell for PATH changes to take effect
6. Verify installation:
   ```powershell
   ollama --version
   ```

**Start Ollama Service:**
```powershell
# Ollama runs as a background service by default
# If needed, manually start with:
ollama serve

# Keep this terminal open if manually starting
```

### Step 6: Pull Gemma 4 Model

```powershell
# This downloads the AI model (first time: ~2-4 GB)
ollama pull gemma4:e4b

# Takes 5-15 minutes depending on internet speed
```

### Step 7: Install Project Dependencies

```powershell
# Navigate to project directory (if not already there)
cd "Health care resource allocation system"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to project root
cd ..
```

### Step 8: Configure Environment Variables

**Create backend/.env file:**
```powershell
# Open PowerShell as Administrator in the backend folder
cd backend

# Create .env file
New-Item -Path ".env" -ItemType File

# Edit the file with Notepad
notepad .env
```

**Paste the following content:**
```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/healthcare_db

# AI Service Configuration (Ollama)
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma4:e4b

# JWT Configuration (change in production!)
JWT_SECRET=your_super_secret_key_change_this_in_production_12345

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Save the file (Ctrl+S in Notepad)**

**Create frontend/.env file:**
```powershell
# In frontend folder
cd ../frontend

# Create and edit .env file
New-Item -Path ".env" -ItemType File
notepad .env
```

**Paste:**
```env
VITE_API_URL=http://localhost:5001
```

**Save the file**

### Step 9: Seed Database

```powershell
# Go back to backend
cd ../backend

# Run seed script to populate database
node seed.js

# Output should show:
# ✓ Admin user created
# ✓ Staff user created
# ✓ Resources seeded
# ✓ Patients seeded
```

---

## Verification

### Check MongoDB Connection
```powershell
mongosh mongodb://localhost:27017

# In mongosh
> show dbs
> use healthcare_db
> db.patients.countDocuments()
> exit
```

### Check Ollama Connection
```powershell
# Test API
curl.exe http://localhost:11434/api/tags

# Or using PowerShell:
Invoke-WebRequest -Uri "http://localhost:11434/api/generate" -Body @{
    model = "gemma4:e4b"
    prompt = "Hello"
    stream = $false
} | ConvertTo-Json
```

---

## Running the Application

### Method 1: Separate PowerShell Windows (Recommended)

**Terminal 1 - Start Backend:**
```powershell
cd backend
npm start

# You should see:
# Server running on port 5001
# Connected to MongoDB
```

**Terminal 2 - Start Frontend:**
```powershell
cd frontend
npm run dev

# You should see:
# VITE v4.x.x ready in 100 ms
# ➜ Local: http://localhost:5173/
```

**Then open browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001

### Method 2: Git Bash Single Terminal

```bash
# Open Git Bash
cd backend
npm start &

# In same terminal, open new tab (Ctrl+Shift+N in most terminals)
cd ../frontend
npm run dev
```

### Method 3: Using batch script

Create `start.bat` file:
```batch
@echo off
echo Starting MedResource Intelligence System...
echo.

start cmd /k "cd backend && npm start"
timeout /t 3 /nobreak
start cmd /k "cd frontend && npm run dev"

echo Services started! Access frontend at http://localhost:5173
pause
```

To use, double-click `start.bat` from the project folder.

---

## Accessing the Application

**Frontend:** http://localhost:5173

**Backend API:** http://localhost:5001

**Default Test Credentials:**
- Email: `admin@hospital.com`
- Password: `password`

---

## Database & AI Services Check

**Open new PowerShell terminal:**

```powershell
# Check MongoDB status
Get-Service MongoDB

# Check Ollama status
Get-Process ollama -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, StartTime

# Check ports
netstat -ano | findstr :5001
netstat -ano | findstr :5173
netstat -ano | findstr :27017
netstat -ano | findstr :11434
```

---

## Useful Commands

```powershell
# Navigate to directories
cd backend
cd frontend
cd ..

# Install packages
npm install
npm install --save package-name

# Start services
npm start       # backend
npm run dev     # frontend

# View logs
# Check the terminal where npm start/dev is running

# Clear node_modules
Remove-Item -Recurse -Force node_modules
npm install

# Database operations
cd backend
node seed.js        # Seed database
node clearDB.js     # Clear all data (WARNING!)

# Check running processes
Get-Process node
Get-Process mongo*
Get-Process ollama

# Kill a process by PID
taskkill /PID 1234 /F

# Stop services
# In the terminal: Press Ctrl+C
# Or: taskkill /IM node.exe /F

# Check node_modules size
Get-ChildItem "backend/node_modules" -Recurse | Measure-Object -Sum Length | Select @{Name="Size(GB)";Expression={[math]::Round($_.Sum/1GB,2)}}
```

---

## Troubleshooting

### Issue: "npm: command not found"
**Solution:**
1. Download and install Node.js from https://nodejs.org/
2. Add to PATH: `C:\Program Files\nodejs`
3. Restart PowerShell
4. Test: `node --version`

### Issue: "mongosh: command not found"
**Solution:**
1. Reinstall MongoDB Community Edition
2. Add MongoDB bin folder to PATH: `C:\Program Files\MongoDB\Server\7.0\bin`
3. Restart PowerShell

### Issue: "Port 5001 already in use"
**Solution:**
```powershell
# Find process using port 5001
netstat -ano | findstr :5001

# Kill the process (replace PID)
taskkill /PID 1234 /F

# Or prevent NodeJS services from running:
Get-Process node | Stop-Process -Force
```

### Issue: "MongoDB service fails to start"
**Solution:**
1. Open Services (Win+R → services.msc)
2. Right-click "MongoDB Server" → Properties
3. Check if path exists: `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`
4. If not, reinstall MongoDB
5. Try to start service again

### Issue: Ollama not running
**Solution:**
```powershell
# Check if Ollama process exists
Get-Process ollama -ErrorAction SilentlyContinue

# If not, manually start:
ollama serve

# Keep terminal open

# Check logs in:
# C:\Users\YourUsername\AppData\Local\Ollama
```

### Issue: "Module not found" errors
**Solution:**
```powershell
# Delete and reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: Database connection timeout
**Solution:**
```powershell
# Check MongoDB is running
mongosh mongodb://localhost:27017

# Restart MongoDB service
Get-Service MongoDB | Stop-Service
Start-Service MongoDB

# Wait 5 seconds and try again
```

### Issue: "Access is denied" when running scripts
**Solution:**
1. Right-click PowerShell → "Run as administrator"
2. Or change execution policy:
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Frontend can't connect to backend
**Solution:**
1. Ensure backend is running on port 5001
2. Check backend .env has correct frontend URL
3. Check browser console (F12) for CORS errors
4. Restart both services

### Issue: Ollama very slow or timing out
**Solution:**
1. Check RAM usage in Task Manager
2. Close other applications using RAM
3. Increase Node timeout in `backend/services/aiService.js`
4. Use smaller model: `ollama pull gemma:2b`

---

## Getting Help

1. Check the main [README.md](./README.md) for general information
2. Check [MONGODB_SETUP.md](./MONGODB_SETUP.md) for database-specific help
3. Enable debug logging in Node.js:
```powershell
$env:DEBUG='*'
npm start
```

---

## Next Steps

Once running successfully:
1. Access frontend at http://localhost:5173
2. Login with credentials above
3. Create patient records and test resource allocation
4. Check browser console (F12) for any errors
5. Monitor backend terminal for API logs

---

## Performance Tips for Windows

1. **Reduce Ollama model download time:** Use gemma:2b instead of gemma4:e4b for testing
2. **Free up RAM:** Close unnecessary applications before running services
3. **Use SSD:** Install MongoDB on SSD for better performance
4. **Enable GPU support:** If you have NVIDIA GPU, enable CUDA support
5. **Check Windows Updates:** Keep Windows and drivers updated for best performance

---

**Last Updated:** April 2026
**Tested On:** Windows 10 (Build 19042+) and Windows 11

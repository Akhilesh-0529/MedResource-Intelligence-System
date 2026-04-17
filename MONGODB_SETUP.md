# MongoDB & Ollama Setup Guide

Complete setup guide for MongoDB and Ollama AI model for the MedResource Intelligence System.

---

## Table of Contents
1. [MongoDB Setup](#mongodb-setup)
2. [Ollama & Gemma Model Setup](#ollama--gemma-model-setup)
3. [Connection Verification](#connection-verification)
4. [Database Management](#database-management)
5. [Troubleshooting](#troubleshooting)

---

## MongoDB Setup

### Prerequisites
- MongoDB 4.4+ (local or cloud)
- Node.js 16+
- 500MB+ free disk space

### Option A: Local MongoDB Installation

#### macOS (Homebrew - Recommended)

```bash
# Tap MongoDB's Homebrew repository
brew tap mongodb/brew

# Install MongoDB Community Edition
brew install mongodb-community

# Start MongoDB as a service (runs at startup)
brew services start mongodb-community

# Verify installation
mongo --version
mongosh --version

# Check status
brew services list | grep mongod
```

**Optional: Stop/Restart MongoDB**
```bash
# Stop MongoDB
brew services stop mongodb-community

# Restart MongoDB
brew services restart mongodb-community
```

#### Linux (Ubuntu/Debian)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

#### Linux (CentOS/RHEL)

```bash
# Create MongoDB repository file
cat <<EOF | sudo tee /etc/yum.repos.d/mongodb-org-6.0.repo
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF

# Install MongoDB
sudo yum install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows (Chocolatey)

```bash
# Install MongoDB using Chocolatey
choco install mongodb

# Start MongoDB Service
# MongoDB should start automatically after installation
```

**Or Manual Installation:**
1. Download MongoDB from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. MongoDB will run as a Windows Service by default

### Option B: Docker Installation (Recommended for Development)

```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Verify container is running
docker ps | grep mongodb

# Stop container
docker stop mongodb

# Start container
docker start mongodb
```

**Docker Compose (Recommended):**
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: healthcare-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    networks:
      - healthcare-network

  mongo-express:
    image: mongo-express:latest
    container_name: healthcare-mongo-express
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: password
      ME_CONFIG_MONGODB_URL: mongodb://admin:password@mongodb:27017/
    depends_on:
      - mongodb
    networks:
      - healthcare-network

volumes:
  mongodb_data:

networks:
  healthcare-network:
```

**Start with Docker Compose:**
```bash
docker-compose up -d
```

### Option C: MongoDB Atlas (Cloud Database)

1. Create account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a project and cluster
3. Add IP whitelist (or allow all: 0.0.0.0/0 for development)
4. Create database user with username and password
5. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority`
6. Update `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/healthcare_db?retryWrites=true&w=majority
   ```

---

## Ollama & Gemma Model Setup

### Prerequisites
- 8GB+ RAM
- 4GB+ free disk space
- Stable internet for model download

### Installation

#### macOS

```bash
# Method 1: Download from website
# Visit https://ollama.ai and download macOS version

# Method 2: Using Homebrew
brew install ollama

# Verify installation
ollama --version
```

#### Linux (Ubuntu/Debian)

```bash
# Download and install
curl -fsSL https://ollama.ai/install.sh | sh

# Verify installation
ollama --version

# Start Ollama service
ollama serve

# In another terminal, verify
curl http://localhost:11434/api/tags
```

#### Linux (Manual)

```bash
# Download Ollama binary
curl -L https://ollama.ai/download/ollama-linux-amd64 -o ollama
chmod +x ollama

# Run Ollama
./ollama serve
```

#### Windows

1. Download installer from [https://ollama.ai](https://ollama.ai)
2. Run the installer
3. Ollama will start automatically
4. Verify at `http://localhost:11434`

#### Docker

```bash
# Run Ollama in Docker
docker run -d --name ollama -p 11434:11434 ollama/ollama

# Pull model in container
docker exec ollama ollama pull gemma4:e4b
```

### Pull AI Models

```bash
# Pull custom Gemma 4 model
ollama pull gemma4:e4b

# List pulled models
ollama list

# Remove a model
ollama rm gemma4:e4b
```

### Start Ollama Service

```bash
# macOS
ollama serve

# Linux
ollama serve

# Windows - Already running as service

# Docker
docker start ollama
```

**Ollama will be available at:** `http://localhost:11434`

---

## Connection Verification

### MongoDB Connection Test

```bash
# Using mongosh (modern)
mongosh mongodb://localhost:27017

# Inside mongosh
> show dbs
> use healthcare_db
> db.createCollection('test')
> db.test.insertOne({name: 'test'})
> db.test.find()
> exit

# Or using curl (if authentication enabled)
curl --user admin:password http://localhost:27017
```

**Test from Node.js:**
```javascript
// test-mongo.js
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch(err => console.error('✗ MongoDB connection failed:', err));
```

```bash
node test-mongo.js
```

### Ollama Connection Test

```bash
# Test API endpoint
curl http://localhost:11434/api/tags

# Generate text
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "gemma4:e4b",
  "prompt": "Hello, how are you?",
  "stream": false
}'

# Expected response
{
  "model": "gemma4:e4b",
  "created_at": "2024-01-09T12:34:56.789Z",
  "response": "Hello! I'm doing well, thank you for asking...",
  "done": true,
  "context": [...],
  "total_duration": 2000000000,
  "load_duration": 1000000000,
  "prompt_eval_count": 8,
  "prompt_eval_duration": 500000000,
  "eval_count": 150,
  "eval_duration": 500000000
}
```

**Test from Node.js:**
```javascript
// test-ollama.js
import axios from 'axios';

const OLLAMA_URL = 'http://localhost:11434/api/generate';

axios.post(OLLAMA_URL, {
  model: 'gemma4:e4b',
  prompt: 'Summarize: Patient has fever and cough',
  stream: false,
  format: 'json'
})
  .then(res => {
    console.log('✓ Ollama response received');
    console.log(JSON.parse(res.data.response));
  })
  .catch(err => console.error('✗ Ollama request failed:', err.message));
```

```bash
node test-ollama.js
```

---

## Database Management

### Seed Initial Data

```bash
cd backend

# Seed database with test data
node seed.js

# Output: ✓ Admin user created
#         ✓ Staff user created
#         ✓ Resources seeded
#         ✓ Patients seeded
```

### Clear Database (Development Only)

```bash
cd backend

# WARNING: This deletes ALL data!
node clearDB.js

# Confirm the action when prompted
```

### Backup Database

```bash
# MongoDB backup
mongodump --out ./backup-$(date +%Y%m%d)

# Cloud backup (Atlas)
# Automatic daily snapshots available in Atlas dashboard
# Can also restore from snapshots
```

### Restore Database

```bash
# Restore from backup
mongorestore ./backup-20240109
```

### Create Database Indexes

```bash
mongosh mongodb://localhost:27017/healthcare_db

# In mongosh
> use healthcare_db
> db.patients.createIndex({ priority: 1, status: 1 })
> db.resources.createIndex({ department: 1, status: 1 })
> db.users.createIndex({ email: 1 }, { unique: true })
```

---

## Environment Configuration

### Update Backend .env

```env
# Database
MONGO_URI=mongodb://localhost:27017/healthcare_db
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare_db

# Ollama AI Service
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma4:e4b

# Server
PORT=5001
NODE_ENV=development

# Authentication
JWT_SECRET=your_secret_key_here_minimum_32_characters_recommended

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Troubleshooting

### MongoDB Issues

**Error: "connect ECONNREFUSED 127.0.0.1:27017"**
```bash
# MongoDB is not running. Start it:
brew services start mongodb-community  # macOS
sudo systemctl start mongod             # Linux
docker start mongodb                    # Docker
```

**Error: "Authentication failed"**
```bash
# If using credentials, ensure they're correct in MONGO_URI
# Or create a user:
mongosh mongodb://localhost:27017
> use admin
> db.createUser({user: 'admin', pwd: 'password', roles: ['root']})
```

**Error: "MongoNetworkError: connect ETIMEDOUT"**
```bash
# Check MongoDB is listening on port 27017
lsof -i :27017  # macOS/Linux
netstat -an | grep 27017  # Windows

# Check firewall isn't blocking the port
```

### Ollama Issues

**Error: "socket hang up" or "ECONNREFUSED"**
```bash
# Ollama is not running. Start it:
ollama serve
# Keep this terminal open
```

**Error: "Invalid model 'gemma4:e4b'"**
```bash
# Model not downloaded. Pull it:
ollama pull gemma4:e4b

# Verify models
ollama list
```

**Error: Ollama slow/hanging**
```bash
# Increase available RAM to Ollama
# Check if other processes are using memory
# Try smaller model: gemma:2b
# Check console for errors: tail -f ~/.ollama/logs/server.log (macOS)
```

**Error: "CUDA out of memory"**
```bash
# Reduce model size or disable GPU:
# Edit Ollama config or use CPU-only version
# Or use smaller model: gemma:2b
```

### Connection Issues from Backend

**Backend cannot reach MongoDB:**
```bash
# Check MONGO_URI in .env
# Ensure MongoDB is running
# Test connection: mongosh "$MONGO_URI"
# Check firewall/network access
```

**Backend cannot reach Ollama:**
```bash
# Check OLLAMA_URL in .env (should be http://localhost:11434/api/generate)
# Ensure Ollama is running: ollama serve
# Test connection: curl http://localhost:11434/api/tags
# May need to adjust OLLAMA_URL if using Docker (use host.docker.internal)
```

### Performance Optimization

```bash
# Increase MongoDB cache
# In mongod.conf (macOS: /usr/local/etc/mongod.conf):
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2

# Increase Ollama performance
# Use GPU acceleration if available
export CUDA_VISIBLE_DEVICES=0  # Use first GPU
ollama serve
```

---

## Quick Start Reference

```bash
# 1. Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod             # Linux

# 2. Start Ollama (in new terminal)
ollama serve

# 3. Seed database
cd backend && node seed.js

# 4. Start development servers
./start.sh

# 5. Access application
# Frontend: http://localhost:5173
# Backend:  http://localhost:5001
```

---

## Additional Resources

- [MongoDB Docs](https://docs.mongodb.com/)
- [Ollama GitHub](https://github.com/ollama/ollama)
- [Gemma Model Card](https://huggingface.co/google/gemma-7b)
- [Mongoose ODM](https://mongoosejs.com/)

---

**Last Updated**: April 2026

### Option B: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/healthcare_db`
4. Update `.env` with the connection string

## Part 2: Ollama & Gemma 4 Setup

### Installation

#### macOS
```bash
# Download and install Ollama from https://ollama.ai
# Or use Homebrew
brew install ollama

# Start Ollama (runs on http://localhost:11434)
ollama serve
```

#### Ubuntu/Linux
```bash
# Download from https://ollama.ai/download
# Or use curl
curl https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve
```

#### Windows
Download installer from https://ollama.ai/download

### Pull Gemma 4 Model

In a new terminal (while ollama serve is running):

```bash
# Pull the Gemma 4 model (first time: ~5-10 min depending on internet)
ollama pull gemma4:e4b

# Verify the model is installed
ollama list
```

Expected output:
```
gemma4:e4b    42mb    ...
```

### Test Ollama API

```bash
# Test the Ollama API
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma4:e4b",
    "prompt": "Hello, how are you?",
    "stream": false
  }'
```

## Part 3: Backend Configuration

### 1. Create `.env` file
```bash
cd backend
cp .env.example .env
```

### 2. Update `.env` with your configuration

```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/healthcare_db
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare_db

# Ollama
OLLAMA_URL=http://localhost:11434/api/generate
OLLAMA_MODEL=gemma4:e4b

# JWT
JWT_SECRET=your_secret_key_here_change_for_production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Install dependencies and run
```bash
npm install
npm run dev
```

## Part 4: Seed Database (Optional)

```bash
cd backend
node seed.js
```

This will create sample patients and resources in MongoDB.

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community

# View MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

### Ollama Connection Issues
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Pull model again if needed
ollama pull gemma4:e4b
```

### Model Not Found
```bash
# List available models
ollama list

# Pull default model
ollama pull gemma4:e4b

# Set model in .env if using different model
OLLAMA_MODEL=gemma4:e4b
```

### API Response Issues
If getting JSON parse errors from Ollama:
- Verify model is properly pulled: `ollama list`
- Test API directly: `curl http://localhost:11434/api/generate -X POST -H "Content-Type: application/json" -d '{"model":"gemma4:e4b","prompt":"test","stream":false}'`
- Check Ollama is running on port 11434

## Performance Notes

- **First request**: May take 10-30s as model loads into memory
- **Subsequent requests**: 2-5s depending on system resources
- **Disk space**: Gemma 4 requires ~5GB
- **RAM**: Recommended 8GB+ for smooth operation

## Stopping Services

```bash
# Stop MongoDB
brew services stop mongodb-community

# Stop Ollama
# Press Ctrl+C in the terminal running ollama serve
```

## Next Steps

1. Start MongoDB: `brew services start mongodb-community`
2. Start Ollama: `ollama serve` (new terminal)
3. Start Backend: `cd backend && npm run dev`
4. Start Frontend: `cd frontend && npm run dev`

Verify everything is working by visiting `http://localhost:5173`

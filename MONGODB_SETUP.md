# MongoDB & Ollama Setup Guide

This guide covers setting up MongoDB and Ollama with Gemma 4 for the MedResource Intelligence System.

## Prerequisites

- MongoDB 4.4+ (local or Atlas)
- Ollama with Gemma 4 model
- Node.js 16+

## Part 1: MongoDB Setup

### Option A: Local MongoDB Installation

#### macOS (using Homebrew)
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify MongoDB is running
mongo --version
```

#### Ubuntu/Debian
```bash
# Add MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -

# Install MongoDB
sudo apt-get install mongodb

# Start MongoDB
sudo systemctl start mongod
```

#### Verify Connection
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# List databases
show dbs

# Exit
exit
```

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

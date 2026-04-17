# Setup Guide

This guide explains how to set up and run the MedResource Intelligence System locally.

## 1) Prerequisites

Install the following:

- Node.js 20+
- npm 10+
- MongoDB running locally (or an accessible MongoDB URI)

Optional for AI analysis endpoint:

- Ollama running locally with a model matching `OLLAMA_MODEL`

## 2) Clone and move to project root

```bash
cd /home/runner/work/MedResource-Intelligence-System/MedResource-Intelligence-System
```

## 3) Configure environment files

### Backend

```bash
cp backend/.env.example backend/.env
```

Important backend vars:

- `PORT` (default `5001`)
- `MONGO_URI` (default `mongodb://localhost:27017/healthcare_db`)
- `JWT_SECRET`
- `OLLAMA_URL`, `OLLAMA_MODEL` (optional for AI service)

### Frontend

```bash
cp frontend/.env.example frontend/.env
```

Current frontend code uses `http://localhost:5001` directly for API/socket calls.

## 4) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

## 5) (Optional) Seed demo data

```bash
cd backend
node seed.js
```

This creates sample users/resources/patients.

Sample users:

- `admin@hospital.com` / `password`
- `staff@hospital.com` / `password`

## 6) Run services

In one terminal:

```bash
cd backend
npm start
```

In another terminal:

```bash
cd frontend
npm run dev
```

## 7) Build frontend

```bash
cd frontend
npm run build
```

## Automated flow

To automate setup + build + run, use:

```bash
bash scripts/setup-build-run.sh
```

For script options:

```bash
bash scripts/setup-build-run.sh --help
```

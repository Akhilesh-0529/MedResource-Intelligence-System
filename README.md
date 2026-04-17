# MedResource Intelligence System

MedResource Intelligence System is a full-stack application for managing hospital resources and patient allocation with real-time updates.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MongoDB (Mongoose)
- **Optional AI Integration:** Ollama endpoint configured in backend env

## Repository Structure

- `frontend/` - React UI
- `backend/` - Express API and real-time server
- `scripts/setup-build-run.sh` - automation script for setup, build, and run
- `SETUP.md` - detailed setup guide

## Quick Start

### Option 1: Automated (recommended)

```bash
bash /home/runner/work/MedResource-Intelligence-System/MedResource-Intelligence-System/scripts/setup-build-run.sh
```

### Option 2: Manual

Follow `/home/runner/work/MedResource-Intelligence-System/MedResource-Intelligence-System/SETUP.md`.

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5001`

## Notes

- Backend `npm test` is currently a placeholder and exits with `Error: no test specified`.
- Frontend validation commands:
  - `npm run lint`
  - `npm run build`

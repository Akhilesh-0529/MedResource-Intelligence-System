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

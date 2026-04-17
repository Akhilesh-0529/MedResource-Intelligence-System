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

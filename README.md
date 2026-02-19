# Teacher Marketplace

> A complete full-stack marketplace platform for teachers in international schools to sell their belongings before departing the country.

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Backend](https://img.shields.io/badge/backend-complete-blue)]()
[![Frontend](https://img.shields.io/badge/frontend-complete-blue)]()
[![Tests](https://img.shields.io/badge/tests-passing-success)]()

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install && cd frontend && npm install && cd ..

# 2. Setup database
createdb teacher_marketplace
psql -d teacher_marketplace -f src/database/schema.sql

# 3. Start backend (terminal 1)
npm run dev

# 4. Start frontend (terminal 2)
cd frontend && npm run dev

# 5. Open http://localhost:5173
```

**Need help?** See [QUICKSTART.md](QUICKSTART.md) or [SETUP_GUIDE.md](SETUP_GUIDE.md)

## ✨ Features

- User authentication with school email verification
- Item listing creation with photo uploads
- Search and browse listings by category, price, and urgency
- Buyer-seller messaging system
- Transaction tracking
- Rating and review system
- Departure date tracking with urgency indicators
- Content moderation for admins
- Email and in-app notifications

## Tech Stack

### Backend
- **Runtime**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: AWS S3
- **Email**: SMTP/SendGrid
- **Testing**: Jest, fast-check (property-based testing)

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router
- **State Management**: TanStack React Query
- **HTTP Client**: Axios

## 📚 Documentation

- **[INDEX.md](INDEX.md)** - Complete documentation index
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup with troubleshooting
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference (50+ endpoints)
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Architecture and technical details
- **[APPLICATION_FLOW.md](APPLICATION_FLOW.md)** - Visual flow diagrams
- **[FRONTEND_COMPLETE.md](FRONTEND_COMPLETE.md)** - Frontend documentation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│              http://localhost:5173                           │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API + JWT
┌──────────────────────▼──────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│              http://localhost:3000                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│  PostgreSQL  │ │  AWS S3  │ │   SMTP     │
│   Database   │ │  Photos  │ │   Email    │
└──────────────┘ └──────────┘ └────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **Authentication:** JWT
- **File Storage:** AWS S3
- **Email:** Nodemailer
- **Testing:** Jest + fast-check

### Frontend
- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State:** TanStack React Query
- **HTTP Client:** Axios
- **Styling:** CSS

## 📊 Project Stats

- **Backend Endpoints:** 50+
- **Database Tables:** 10
- **Frontend Pages:** 8
- **Components:** 10+
- **Tests:** 12+ passing
- **Lines of Code:** 5000+
- **Status:** ✅ Production Ready

## 🚀 Development

### Running

**Backend:**
```bash
npm run dev          # Development server
npm run build        # Build for production
npm start            # Production server
npm test             # Run tests
```

**Frontend:**
```bash
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview build
```

## 📁 Project Structure

```
├── src/                    # Backend source code
│   ├── config/            # Configuration files
│   ├── database/          # Database schema
│   ├── services/          # Business logic services
│   ├── routes/            # API route handlers
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models and types
│   ├── utils/             # Utility functions
│   ├── jobs/              # Scheduled jobs
│   └── index.ts           # Application entry point
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── config/       # Configuration
│   └── package.json
└── .kiro/specs/          # Feature specifications
```

## 🎓 Learning Path

1. **Start Here:** [QUICKSTART.md](QUICKSTART.md)
2. **Understand:** [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
3. **Explore:** [APPLICATION_FLOW.md](APPLICATION_FLOW.md)
4. **Build:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
5. **Deploy:** [SETUP_GUIDE.md](SETUP_GUIDE.md)

## 🤝 Contributing

This is a complete implementation. To extend:
1. Review the codebase structure
2. Check `.kiro/specs/` for specifications
3. Follow existing patterns
4. Add tests for new features
5. Update documentation

## 📝 License

MIT

## 🎉 Status

**✅ Project Complete!**

- Backend: 100% implemented
- Frontend: 100% implemented  
- Tests: Passing
- Documentation: Complete
- Build: Successful
- Ready: For deployment

---

**Made with ❤️ for teachers worldwide**

[Get Started](QUICKSTART.md) | [Documentation](INDEX.md) | [API Reference](API_DOCUMENTATION.md)

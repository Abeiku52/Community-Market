# CommunityMarket

A modern, secure marketplace platform for any community to buy and sell items among members. Built with React, Node.js, Express, and PostgreSQL.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with email/password and magic link login
- **Listings Management**: Create, edit, and browse listings with images
- **Search & Filters**: Advanced search with category, price range, and condition filters
- **Favorites**: Save listings for later viewing
- **Messaging**: Direct messaging between buyers and sellers
- **Offers & Bidding**: Make offers and negotiate prices
- **Reviews & Ratings**: Rate and review transactions
- **Admin Dashboard**: Comprehensive moderation and user management

### Security Features
- Rate limiting (4-tier system)
- Security headers (helmet.js)
- Response compression
- Environment variable validation
- SQL injection prevention
- XSS protection
- Password hashing with bcrypt

### User Experience
- Responsive design (mobile, tablet, desktop)
- Real-time notifications
- View tracking and analytics
- Share listings via email or link
- Anonymous interest expression
- Departure date tracking for urgent sales

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Abeiku52/Community-Market.git
cd Community-Market
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**

Create `.env` file in root:
```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=community_marketplace
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Email (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@communitymarket.com

# URLs
FRONTEND_URL=http://localhost:5174
API_BASE_URL=http://localhost:3000/api
```

Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

5. **Set up the database**
```bash
# Create database
createdb community_marketplace

# Run schema
psql -d community_marketplace -f src/database/schema.sql

# Run migrations
psql -d community_marketplace -f src/database/add-new-features.sql
```

6. **Start the development servers**

Backend:
```bash
npm run dev
```

Frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:5174
- Backend API: http://localhost:3000

## 📁 Project Structure

```
Community-Market/
├── src/                      # Backend source code
│   ├── config/              # Configuration files
│   ├── database/            # Database schemas and migrations
│   ├── middleware/          # Express middleware
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   └── index.ts             # Server entry point
├── frontend/                # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
├── .env.example            # Environment variables template
├── package.json            # Backend dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Database Schema
The application uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `listings` - Marketplace listings
- `messages` - Direct messaging
- `favorites` - Saved listings
- `offers` - Price negotiations
- `reviews` - User ratings
- `notifications` - User notifications
- `transactions` - Completed sales

### Environment Variables
See `.env.example` for all available configuration options.

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
```

**Frontend:**
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### API Documentation
See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints and usage.

## 🔒 Security

The application implements multiple security layers:
- **Authentication**: JWT tokens with secure password hashing
- **Rate Limiting**: Prevents API abuse (5-200 requests per 15 minutes)
- **Security Headers**: Helmet.js with CSP, XSS protection
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries
- **Environment Validation**: Required variables checked on startup

See [SECURITY_FEATURES.md](./SECURITY_FEATURES.md) for complete security documentation.

## 🚀 Deployment

### Production Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions including:
- Server setup and configuration
- Database setup and migrations
- SSL/HTTPS configuration
- PM2 process management
- Nginx reverse proxy setup
- Automated backups
- Monitoring and logging

### Quick Production Checklist
1. Set up production server (AWS, DigitalOean, etc.)
2. Configure environment variables
3. Set up PostgreSQL database
4. Install SSL certificate
5. Deploy with PM2 and Nginx
6. Set up automated backups
7. Configure monitoring

## 🎯 Use Cases

This platform is suitable for:
- **Residential Communities**: Apartments, neighborhoods, gated communities
- **Companies**: Internal employee marketplaces
- **Schools & Universities**: Student and staff trading
- **Clubs & Organizations**: Member-to-member sales
- **Co-working Spaces**: Shared community marketplaces
- **Any Community**: Any group wanting a private marketplace

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation

## 🙏 Acknowledgments

Built with:
- React & TypeScript
- Node.js & Express
- PostgreSQL
- Tailwind CSS
- Vite

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready

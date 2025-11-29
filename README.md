# Authentication System for Critical Infrastructure

A full-stack authentication system prototype built with React (frontend) and Node.js + Express (backend), featuring JWT authentication, role-based access control, audit logging, and optional 2FA.

## Features

- ✅ **JWT Authentication** - Secure token-based authentication with access and refresh tokens
- ✅ **Password Security** - bcrypt password hashing with configurable rounds
- ✅ **Role-Based Access Control** - Admin, Operator, and Viewer roles with hierarchical permissions
- ✅ **Audit Logging** - Comprehensive logging of all security-relevant actions
- ✅ **Brute-Force Protection** - Rate limiting and account locking
- ✅ **Two-Factor Authentication** - Optional TOTP-based 2FA using authenticator apps
- ✅ **User Management** - Admin panel for user CRUD operations
- ✅ **Security Best Practices** - OWASP-compliant security measures

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL (with Sequelize ORM)
- JWT (jsonwebtoken)
- bcrypt
- Winston (logging)
- Helmet (security)
- express-rate-limit
- speakeasy (2FA)

### Frontend
- React 18
- React Router
- Axios
- Context API (state management)
- Vite (build tool)

## Project Structure

```
project/
├── backend/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication controllers
│   │   ├── userController.js    # User management controllers
│   │   ├── logController.js     # Log viewing controllers
│   │   └── twoFactorController.js
│   ├── middleware/
│   │   ├── auth.js              # Authentication & authorization
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── logger.js            # Request logging
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Role.js              # Role model
│   │   ├── LogEntry.js          # Audit log model
│   │   ├── TwoFactorConfig.js   # 2FA configuration
│   │   └── index.js             # Model relationships
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── logRoutes.js         # Log endpoints
│   │   ├── twoFactorRoutes.js   # 2FA endpoints
│   │   └── index.js             # Route aggregator
│   ├── services/
│   │   ├── authService.js       # Authentication logic
│   │   ├── userService.js       # User management logic
│   │   ├── logService.js        # Logging logic
│   │   └── twoFactorService.js  # 2FA logic
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── logs/                    # Log files (created at runtime)
│   ├── server.js                # Express server
│   └── .env.example             # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx       # Main layout component
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── Dashboard.jsx    # Dashboard
│   │   │   ├── Profile.jsx      # User profile
│   │   │   ├── AdminPanel.jsx  # Admin panel
│   │   │   └── TwoFactorSetup.jsx
│   │   ├── services/
│   │   │   └── api.js           # API client
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── package.json                 # Root package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE auth_system_db;
```

2. Update database credentials in `backend/.env` (copy from `backend/.env.example`)

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=auth_system_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database

```bash
npm run seed
```

This creates default users:
- **Admin**: login=`admin`, password=`Admin123!`
- **Operator**: login=`operator`, password=`Operator123!`
- **Viewer**: login=`viewer`, password=`Viewer123!`

### 5. Run the Application

**Development mode** (runs both backend and frontend):
```bash
npm run dev
```

**Or run separately**:

Backend:
```bash
npm run dev:server
```

Frontend:
```bash
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/change-password` - Change own password

### Logs (Admin only)
- `GET /api/logs` - Get audit logs

### 2FA
- `GET /api/2fa/generate` - Generate 2FA secret
- `POST /api/2fa/enable` - Enable 2FA
- `POST /api/2fa/disable` - Disable 2FA

## Security Features

1. **Password Hashing**: bcrypt with 12 rounds (configurable)
2. **JWT Tokens**: Short-lived access tokens (15min) + refresh tokens (7 days)
3. **HttpOnly Cookies**: Tokens stored in httpOnly cookies (with localStorage fallback)
4. **Rate Limiting**: Login attempts limited to 5 per 10 minutes
5. **Account Locking**: Automatic locking after failed attempts
6. **Input Validation**: express-validator for request validation
7. **SQL Injection Protection**: Sequelize ORM with parameterized queries
8. **XSS Protection**: Helmet.js security headers
9. **CORS**: Configured for frontend origin only
10. **Audit Logging**: All security events logged

## Role Hierarchy

- **Admin**: Full system access (user management, logs, all features)
- **Operator**: Elevated access (can perform operations)
- **Viewer**: Read-only access (dashboard, profile)

## Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique `JWT_SECRET` (min 32 characters)
3. Enable HTTPS
4. Configure proper CORS origins
5. Use environment-specific database
6. Set up proper logging and monitoring
7. Use database migrations instead of `sync()`

## Documentation

- **User Manual**: See `docs/USER_MANUAL.md` (if created)
- **Developer Documentation**: See `docs/DEVELOPER.md` (if created)
- **API Documentation**: See API endpoints section above

## License

MIT

## Author

Student Developer - Course Project


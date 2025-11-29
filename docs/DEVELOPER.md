# Developer Documentation - Authentication System

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [API Documentation](#api-documentation)
5. [Authentication Flow](#authentication-flow)
6. [Security Implementation](#security-implementation)
7. [Development Setup](#development-setup)
8. [Testing](#testing)
9. [Deployment](#deployment)

## Architecture Overview

The system follows a **modular, layered architecture**:

```
┌─────────────────┐
│   React Frontend │
│  (Port 3000)     │
└────────┬─────────┘
         │ HTTP/REST
         │
┌────────▼─────────┐
│  Express Backend  │
│  (Port 5000)      │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   PostgreSQL     │
│   Database       │
└──────────────────┘
```

### Layers

1. **Presentation Layer** (Frontend)
   - React components
   - Context API for state
   - React Router for navigation

2. **API Layer** (Backend)
   - Express routes
   - Controllers
   - Request validation

3. **Business Logic Layer** (Backend)
   - Services
   - Authentication logic
   - Authorization checks

4. **Data Access Layer** (Backend)
   - Sequelize models
   - Database queries
   - Relationships

## Project Structure

### Backend Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # Route definitions
├── services/        # Business logic
├── scripts/         # Utility scripts
└── server.js        # Application entry point
```

### Frontend Structure

```
frontend/src/
├── components/      # Reusable components
├── context/         # React Context providers
├── pages/           # Page components
├── services/        # API client
└── App.jsx          # Main app component
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  login VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'viewer',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Roles Table

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Log Entries Table

```sql
CREATE TABLE log_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Two Factor Configs Table

```sql
CREATE TABLE two_factor_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id),
  secret VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login

Login with credentials.

**Request:**
```json
{
  "login": "admin",
  "password": "Admin123!"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "login": "admin",
    "name": "System Administrator",
    "role": "admin",
    "email": "admin@example.com"
  },
  "accessToken": "jwt_token"
}
```

#### POST /api/auth/logout

Logout current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logout successful"
}
```

#### POST /api/auth/refresh

Refresh access token.

**Request:** Refresh token in cookie or body

**Response:**
```json
{
  "message": "Token refreshed",
  "accessToken": "new_jwt_token"
}
```

#### GET /api/auth/me

Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "login": "admin",
    "name": "System Administrator",
    "role": "admin",
    "email": "admin@example.com"
  }
}
```

### User Management Endpoints (Admin Only)

#### GET /api/users

Get all users with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `role` (filter by role)
- `status` (filter by status)
- `search` (search in login, name, email)

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### POST /api/users

Create new user.

**Request:**
```json
{
  "login": "newuser",
  "password": "Password123!",
  "name": "New User",
  "email": "user@example.com",
  "role": "viewer",
  "status": "active"
}
```

#### PATCH /api/users/:id

Update user.

**Request:** (all fields optional except those being changed)
```json
{
  "name": "Updated Name",
  "role": "operator",
  "status": "blocked"
}
```

#### DELETE /api/users/:id

Delete user.

### Logs Endpoints (Admin Only)

#### GET /api/logs

Get audit logs.

**Query Parameters:**
- `page`, `limit`
- `userId` (filter by user)
- `actionType` (filter by action)
- `startDate`, `endDate` (date range)

## Authentication Flow

### Login Flow

```
1. User submits login form
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT tokens
   ↓
5. Backend sets httpOnly cookies
   ↓
6. Frontend stores accessToken in localStorage
   ↓
7. Frontend redirects to dashboard
```

### Token Refresh Flow

```
1. Frontend makes API request
   ↓
2. Backend returns 401 (token expired)
   ↓
3. Frontend interceptor catches 401
   ↓
4. Frontend calls POST /api/auth/refresh
   ↓
5. Backend validates refresh token
   ↓
6. Backend returns new access token
   ↓
7. Frontend retries original request
```

### Protected Route Flow

```
1. User navigates to protected route
   ↓
2. ProtectedRoute component checks auth
   ↓
3. If not authenticated → redirect to /login
   ↓
4. If authenticated but wrong role → redirect to /dashboard
   ↓
5. If authorized → render component
```

## Security Implementation

### Password Hashing

- **Algorithm**: bcrypt
- **Rounds**: 12 (configurable via `BCRYPT_ROUNDS`)
- **Implementation**: Automatic hashing in User model hooks

### JWT Tokens

- **Algorithm**: HS256
- **Access Token**: 15 minutes (configurable)
- **Refresh Token**: 7 days (configurable)
- **Storage**: httpOnly cookies + localStorage fallback

### Rate Limiting

- **Login**: 5 attempts per 10 minutes
- **API**: 100 requests per 15 minutes
- **Implementation**: express-rate-limit

### Account Locking

- **Trigger**: Failed login attempts ≥ limit
- **Duration**: 10 minutes (configurable)
- **Reset**: On successful login

### Input Validation

- **Backend**: express-validator
- **Frontend**: HTML5 validation + custom checks
- **SQL Injection**: Prevented by Sequelize ORM
- **XSS**: Helmet.js security headers

## Development Setup

### Prerequisites

```bash
node --version  # v18+
npm --version   # 9+
psql --version  # v12+
```

### Initial Setup

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..

# 2. Create database
createdb auth_system_db

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

cp frontend/.env.example frontend/.env

# 4. Seed database
npm run seed

# 5. Start development
npm run dev
```

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

### Test Structure

```
backend/
├── __tests__/
│   ├── unit/
│   │   ├── services/
│   │   └── middleware/
│   └── integration/
│       ├── auth.test.js
│       └── users.test.js
```

### Example Test

```javascript
describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ login: 'admin', password: 'Admin123!' });
    
    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
  });
});
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (min 32 chars, random)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database migrations (don't use `sync()`)
- [ ] Configure proper logging
- [ ] Set up monitoring
- [ ] Review security headers
- [ ] Test rate limiting
- [ ] Backup database regularly

### Database Migrations

In production, use migrations instead of `sync()`:

```bash
# Install Sequelize CLI
npm install -g sequelize-cli

# Create migration
sequelize migration:generate --name create-users-table

# Run migrations
sequelize db:migrate
```

### Docker Deployment (Optional)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "backend/server.js"]
```

## Code Style

- **ES Modules**: Use `import/export`
- **Async/Await**: Prefer over promises
- **Error Handling**: Try-catch with meaningful messages
- **Comments**: JSDoc for functions
- **Naming**: camelCase for variables, PascalCase for components

## Troubleshooting

### Database Connection Issues

- Check PostgreSQL is running
- Verify credentials in `.env`
- Check firewall rules
- Test connection: `psql -h localhost -U postgres -d auth_system_db`

### Port Already in Use

```bash
# Find process using port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>
```

### Module Not Found

- Delete `node_modules` and reinstall
- Check `package.json` dependencies
- Verify import paths

## Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Follow security best practices
5. Test thoroughly before submitting

## License

MIT


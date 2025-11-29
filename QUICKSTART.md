# Quick Start Guide

Get the authentication system up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- npm or yarn

## Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Setup Database

**Option 1: Using psql (if PostgreSQL is in PATH)**
```bash
# Create PostgreSQL database
createdb auth_system_db

# Or using psql:
psql -U postgres
CREATE DATABASE auth_system_db;
\q
```

**Option 2: Windows - Using psql with full path**
```bash
# Find your PostgreSQL installation (usually in Program Files)
# Then use the full path:
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE auth_system_db;"

# Or navigate to PostgreSQL bin directory first:
cd "C:\Program Files\PostgreSQL\15\bin"
psql.exe -U postgres -c "CREATE DATABASE auth_system_db;"
```

**Option 3: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name: `auth_system_db`
5. Click "Save"

**Option 4: Using SQL file**
Create a file `create_db.sql`:
```sql
CREATE DATABASE auth_system_db;
```
Then run it through pgAdmin or psql.

## Step 3: Configure Environment

**Backend:**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and update:
- `DB_PASSWORD` - Your PostgreSQL password
- `JWT_SECRET` - A random secret (min 32 characters)

**Frontend:**
```bash
cp frontend/env.example frontend/.env
```

(No changes needed for development)

## Step 4: Seed Database

```bash
npm run seed
```

This creates default users:
- **Admin**: `admin` / `Admin123!`
- **Operator**: `operator` / `Operator123!`
- **Viewer**: `viewer` / `Viewer123!`

## Step 5: Start the Application

```bash
# Start both backend and frontend
npm run dev
```

Or separately:

**Terminal 1 (Backend):**
```bash
npm run dev:server
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## Login

Use the default admin credentials:
- Login: `admin`
- Password: `Admin123!`

## Troubleshooting

### Database Connection Error

1. Check PostgreSQL is running:
   ```bash
   # macOS/Linux
   pg_isready
   
   # Windows
   # Check Services for PostgreSQL
   ```

2. Verify credentials in `backend/.env`

3. Test connection:
   ```bash
   psql -h localhost -U postgres -d auth_system_db
   ```

### Port Already in Use

Change ports in:
- Backend: `backend/.env` → `PORT=5001`
- Frontend: `frontend/vite.config.js` → `port: 3001`

### Module Not Found

```bash
# Delete and reinstall
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install && cd ..
```

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [docs/USER_MANUAL.md](docs/USER_MANUAL.md) for user guide
- See [docs/DEVELOPER.md](docs/DEVELOPER.md) for developer docs

## Production Deployment

For production, see the [Deployment](#deployment) section in `docs/DEVELOPER.md`.


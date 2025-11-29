# Windows Setup Guide

This guide provides Windows-specific instructions for setting up the Authentication System.

## Prerequisites

1. **Node.js** - Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/download/windows/)

## Step 1: Install PostgreSQL

1. Download PostgreSQL installer for Windows
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Note the installation path (usually `C:\Program Files\PostgreSQL\15\`)

## Step 2: Add PostgreSQL to PATH (Optional but Recommended)

1. Open "Environment Variables" (search in Start menu)
2. Edit "Path" variable
3. Add: `C:\Program Files\PostgreSQL\15\bin` (adjust version number)
4. Click OK and restart terminal

## Step 3: Create Database

### Method A: Using pgAdmin (Easiest)

1. Open **pgAdmin** (installed with PostgreSQL)
2. Connect to your PostgreSQL server (enter password if prompted)
3. Right-click on **"Databases"** → **"Create"** → **"Database"**
4. Name: `auth_system_db`
5. Click **"Save"**

### Method B: Using psql Command Line

If PostgreSQL is in PATH:
```bash
psql -U postgres -c "CREATE DATABASE auth_system_db;"
```

If not in PATH, use full path:
```bash
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -c "CREATE DATABASE auth_system_db;"
```

Or navigate to bin directory:
```bash
cd "C:\Program Files\PostgreSQL\15\bin"
psql.exe -U postgres
```

Then in psql:
```sql
CREATE DATABASE auth_system_db;
\q
```

### Method C: Using SQL File

1. Use the provided `create_db.sql` file
2. Open pgAdmin
3. Connect to PostgreSQL server
4. Right-click on server → **"Query Tool"**
5. Open `create_db.sql` file
6. Execute (F5)

## Step 4: Install Dependencies

Open PowerShell or Command Prompt in the project directory:

```powershell
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 5: Configure Environment

### Backend Configuration

1. Copy `backend/.env.example` to `backend/.env`
   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. Edit `backend/.env` with a text editor (Notepad, VS Code, etc.)

3. Update these values:
   ```env
   DB_PASSWORD=your_postgres_password
   JWT_SECRET=your-random-secret-min-32-characters-long
   ```

   **Important**: 
   - Use the password you set for PostgreSQL `postgres` user
   - Generate a strong random string for `JWT_SECRET` (at least 32 characters)

### Frontend Configuration

1. Copy `frontend/env.example` to `frontend/.env`
   ```powershell
   Copy-Item frontend\env.example frontend\.env
   ```

2. No changes needed for development (defaults are fine)

## Step 6: Seed Database

```powershell
npm run seed
```

This creates default users:
- **Admin**: `admin` / `Admin123!`
- **Operator**: `operator` / `Operator123!`
- **Viewer**: `viewer` / `Viewer123!`

## Step 7: Start the Application

### Option 1: Run Both Together

```powershell
npm run dev
```

This starts both backend (port 5000) and frontend (port 3000).

### Option 2: Run Separately

**Terminal 1 (Backend):**
```powershell
npm run dev:server
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

## Step 8: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## Troubleshooting

### PostgreSQL Not Found

**Problem**: `psql` or `createdb` command not found

**Solution**: 
- Add PostgreSQL bin directory to PATH (see Step 2)
- Or use full path: `"C:\Program Files\PostgreSQL\15\bin\psql.exe"`
- Or use pgAdmin GUI

### Database Connection Error

**Problem**: Cannot connect to database

**Solutions**:
1. Check PostgreSQL service is running:
   - Open "Services" (Win+R → `services.msc`)
   - Find "postgresql-x64-15" (version may vary)
   - Ensure it's "Running"

2. Verify credentials in `backend/.env`:
   - `DB_PASSWORD` matches your PostgreSQL password
   - `DB_USER` is correct (usually `postgres`)

3. Test connection manually:
   ```powershell
   psql -U postgres -d auth_system_db
   ```

### Port Already in Use

**Problem**: Port 5000 or 3000 already in use

**Solution**: 
1. Find process using port:
   ```powershell
   netstat -ano | findstr :5000
   ```

2. Kill process (replace PID with actual process ID):
   ```powershell
   taskkill /PID <PID> /F
   ```

   Or change ports in:
   - Backend: `backend/.env` → `PORT=5001`
   - Frontend: `frontend/vite.config.js` → `port: 3001`

### Module Not Found Errors

**Problem**: Import errors or missing modules

**Solution**:
```powershell
# Delete node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force frontend\node_modules

# Reinstall
npm install
cd frontend
npm install
cd ..
```

### Permission Denied

**Problem**: Cannot create files or directories

**Solution**:
- Run PowerShell/Command Prompt as Administrator
- Or check folder permissions

## Generating JWT Secret

You can generate a secure JWT secret using PowerShell:

```powershell
# Generate random 32-character string
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use an online generator, or simply create a long random string manually.

## Next Steps

After successful setup:
1. Login with admin credentials: `admin` / `Admin123!`
2. Explore the admin panel
3. Try creating a new user
4. Check audit logs
5. Set up 2FA (optional)

## Additional Resources

- [PostgreSQL Windows Documentation](https://www.postgresql.org/docs/current/installation-windows.html)
- [Node.js Windows Installation](https://nodejs.org/en/download/)
- See `README.md` for full documentation
- See `QUICKSTART.md` for general quick start


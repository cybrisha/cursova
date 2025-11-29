# User Manual - Authentication System

## Table of Contents

1. [Login](#login)
2. [Dashboard](#dashboard)
3. [Profile Management](#profile-management)
4. [Two-Factor Authentication](#two-factor-authentication)
5. [Admin Panel](#admin-panel)
6. [Troubleshooting](#troubleshooting)

## Login

### Accessing the System

1. Navigate to the login page
2. Enter your **login** (username)
3. Enter your **password**
4. Click **Login**

### Default Credentials

- **Admin**: `admin` / `Admin123!`
- **Operator**: `operator` / `Operator123!`
- **Viewer**: `viewer` / `Viewer123!`

### Login Issues

- **Account Locked**: Too many failed login attempts. Wait 10 minutes or contact administrator.
- **Invalid Credentials**: Check your login and password. Passwords are case-sensitive.
- **Account Blocked**: Contact your administrator to unblock your account.

## Dashboard

The dashboard provides an overview of your account and quick access to system features.

### Features

- View your user information
- Access quick actions (Profile, 2FA, Admin Panel)
- View system information

## Profile Management

### Viewing Your Profile

1. Click **Profile** in the navigation menu
2. View your account information:
   - Name
   - Login
   - Email
   - Role

### Changing Your Password

1. Navigate to **Profile**
2. Scroll to **Change Password** section
3. Enter your **current password**
4. Enter your **new password** (minimum 8 characters)
5. Confirm your new password
6. Click **Change Password**

**Password Requirements:**
- Minimum 8 characters
- Recommended: mix of letters, numbers, and special characters

## Two-Factor Authentication

Two-factor authentication (2FA) adds an extra layer of security to your account.

### Setting Up 2FA

1. Install an authenticator app on your phone:
   - Google Authenticator
   - Microsoft Authenticator
   - Authy
   - Any TOTP-compatible app

2. Navigate to **2FA Setup** in the menu

3. Click **Generate 2FA Secret**

4. Scan the QR code with your authenticator app, or enter the code manually

5. Enter the 6-digit code from your authenticator app

6. Click **Enable 2FA**

### Disabling 2FA

1. Navigate to **2FA Setup**
2. Click **Disable 2FA**
3. Confirm the action

**Note**: Disabling 2FA reduces your account security.

## Admin Panel

**Note**: Only users with the **Admin** role can access the Admin Panel.

### User Management

#### Viewing Users

1. Navigate to **Admin Panel**
2. Click the **Users** tab
3. View the list of all users with their:
   - Login
   - Name
   - Email
   - Role
   - Status
   - Last Login

#### Creating a User

1. Click **Create User**
2. Fill in the form:
   - **Login**: Unique username (3-50 characters, alphanumeric + underscore)
   - **Name**: Full name (2-100 characters)
   - **Email**: Optional email address
   - **Password**: Minimum 8 characters
   - **Role**: Select from Admin, Operator, or Viewer
   - **Status**: Active or Blocked
3. Click **Create**

#### Editing a User

1. Find the user in the table
2. Click **Edit**
3. Modify the fields (login cannot be changed)
4. Leave password empty to keep current password
5. Click **Update**

#### Deleting a User

1. Find the user in the table
2. Click **Delete**
3. Confirm the deletion

**Note**: You cannot delete your own account.

#### Blocking/Unblocking Users

1. Edit the user
2. Change **Status** to "Blocked" or "Active"
3. Save changes

### Audit Logs

View all security-relevant actions in the system.

1. Navigate to **Admin Panel**
2. Click the **Audit Logs** tab
3. View logs with:
   - Timestamp
   - User who performed the action
   - Action type
   - IP address
   - Additional details

#### Log Action Types

- `login` - Successful login
- `logout` - User logout
- `login_failed` - Failed login attempt
- `account_blocked` - Account blocked by admin
- `account_unblocked` - Account unblocked by admin
- `role_changed` - User role changed
- `password_reset` - Password reset by admin
- `password_changed` - User changed own password
- `user_created` - New user created
- `user_updated` - User information updated
- `user_deleted` - User deleted

## Troubleshooting

### Cannot Login

1. **Check credentials**: Ensure login and password are correct
2. **Account status**: Contact admin if account is blocked
3. **Browser issues**: Clear cookies and cache, try different browser
4. **Network issues**: Check internet connection

### Token Expired

If you see "Token expired" error:
1. You will be automatically redirected to login
2. Log in again to get a new token

### 2FA Code Not Working

1. **Time sync**: Ensure your device time is synchronized
2. **Code expired**: Generate a new code (codes expire every 30 seconds)
3. **Wrong secret**: Re-generate the 2FA secret and scan again

### Access Denied

If you see "Access denied" or "Insufficient permissions":
- Your role does not have permission for this action
- Contact your administrator to request access

## Security Best Practices

1. **Use strong passwords**: Mix of letters, numbers, and special characters
2. **Enable 2FA**: Adds extra security layer
3. **Don't share credentials**: Keep your login information private
4. **Log out**: Always log out when finished, especially on shared computers
5. **Report suspicious activity**: Contact administrator immediately

## Support

For issues or questions:
- Contact your system administrator
- Check the audit logs for account activity
- Review this manual for common solutions


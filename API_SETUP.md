# MyTrade API - Setup Complete

## ✅ Completed Modules

### 1. User Module
- **Location**: `src/users/`
- **Features**:
  - Random name generation for new users
  - User profile management
  - Get all users endpoint
  - User activation/deactivation

### 2. Authentication Module
- **Location**: `src/auth/`
- **Features**:
  - Email/OTP authentication (Default OTP: 759409)
  - Google OAuth sign-in
  - JWT token generation
  - Automatic user creation on first login

### 3. Database Schema (Prisma)
- **Models**:
  - User (with role: SUPER_ADMIN or USER)
  - OtpSession (for OTP management)
- **Enums**:
  - UserRole (SUPER_ADMIN, USER)
  - AuthProvider (EMAIL, GOOGLE)

## 🔐 API Endpoints

### Authentication
- `POST /auth/send-otp` - Send OTP to email (auto-creates user if doesn't exist)
- `POST /auth/verify-otp` - Verify OTP and get JWT token
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### User Profile
- `GET /users/profile` - Get current user profile (requires JWT)
- `PUT /users/profile` - Update user name (requires JWT)
- `GET /users` - Get all users (requires JWT)

## 📝 Environment Variables (.env)

```env
DATABASE_URL="mysql://root:password@localhost:3306/mytrade"
JWT_SECRET="your-secret-key-change-this-in-production"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@mytrade.com"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
PORT=3000
```

## 🚀 Next Steps

1. **Run database migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Start the application**:
   ```bash
   npm run start:dev
   ```

3. **Access Swagger documentation**:
   - Open: http://localhost:3000/api/docs

## 🔑 Key Features

- **Default OTP**: All users can use **759409** as the OTP for login
- **Random Names**: New users get auto-generated names like "BraveTiger123"
- **Two User Roles**: SUPER_ADMIN and USER (default is USER)
- **Dual Authentication**: Email/OTP and Google OAuth
- **Swagger**: Full API documentation available at `/api/docs`

## 📦 Installed Dependencies

- `@nestjs/passport` - Authentication framework
- `passport-jwt` - JWT authentication
- `passport-google-oauth20` - Google OAuth
- `@nestjs/jwt` - JWT module
- `nodemailer` - Email sending
- `class-validator` - DTO validation
- `class-transformer` - DTO transformation

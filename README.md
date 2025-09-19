# DocSense - MERN Stack Document Management System

A secure, role-based document management system built with MongoDB, Express.js, React (Vite), and Node.js. Features JWT authentication, user approval workflows, and a modern, responsive UI.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (User and Superuser roles)
- **User approval workflow** - new registrations require admin approval
- **Secure password hashing** with bcrypt
- **HTTP-only cookies** for refresh token storage
- **Automatic token refresh** on frontend

### User Management
- **User registration** with validation
- **Admin approval system** for new users
- **User profile management** with personalization settings
- **Comprehensive user dashboard** with role-specific features

### Security Features
- **Helmet.js** for security headers
- **CORS** configuration with credentials
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **MongoDB injection protection**

### Frontend Features
- **Modern React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **React Router v6** for navigation
- **Context API** for state management
- **Axios** with interceptors for API calls
- **React Hot Toast** for notifications

## 📁 Project Structure

```
DocSense/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   └── tokenService.js
│   │   ├── scripts/
│   │   │   └── seedSuperuser.js
│   │   ├── utils/
│   │   │   └── validators.js
│   │   └── index.js
│   ├── package.json
│   └── env.example
├── Frontend/
│   └── docsense/
│       ├── src/
│       │   ├── components/
│       │   │   ├── Navbar.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   ├── context/
│       │   │   └── AuthContext.tsx
│       │   ├── pages/
│       │   │   ├── Landing.tsx
│       │   │   ├── Login.tsx
│       │   │   ├── Signup.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── AdminRequests.tsx
│       │   │   ├── Documents.tsx
│       │   │   └── Personalize.tsx
│       │   ├── services/
│       │   │   └── api.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── package.json
│       └── vite.config.ts
└── README.md
```

## 🛠️ Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **pnpm**
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DocSense
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the Backend directory:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/docsense

# JWT Secrets (Change these in production!)
JWT_ACCESS_SECRET=your_super_secret_access_key_here_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production

# Token Expiration
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Setup

```bash
cd ../Frontend/docsense
npm install
```

## 🚀 Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

### 2. Start the Backend Server

```bash
cd Backend
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Start the Frontend Development Server

```bash
cd Frontend/docsense
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Create a Superuser Account

In a new terminal, run the seed script to create a superuser:

```bash
cd Backend
npm run seed:superuser
```

This will create a superuser with:
- **Email**: admin@docsense.com
- **Password**: admin123
- **Role**: superuser

⚠️ **Important**: Change the superuser password after first login!

## 🧪 Testing the Application

### 1. Access the Application

Open your browser and navigate to `http://localhost:5173`

### 2. Test User Registration

1. Click "Sign Up" on the landing page
2. Fill in the registration form
3. Submit the form
4. You should see a success message: "Registration successful! Awaiting admin approval."

### 3. Test Admin Approval

1. Login as superuser (admin@docsense.com / admin123)
2. Navigate to "Admin" in the navbar
3. You should see the pending user request
4. Click "Approve" to approve the user
5. The user can now login

### 4. Test User Login

1. Login with the approved user credentials
2. You should be redirected to the dashboard
3. Test the different features available to users

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout user | Public |
| GET | `/api/auth/me` | Get current user | Protected |

### Admin Endpoints (Superuser Only)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/admin/requests` | Get pending requests | Superuser |
| GET | `/api/admin/users` | Get all users | Superuser |
| POST | `/api/admin/requests/:userId/approve` | Approve user | Superuser |
| POST | `/api/admin/requests/:userId/reject` | Reject user | Superuser |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/user/docs` | Get user documents | Protected |
| PUT | `/api/user/personalize` | Update user profile | Protected |

## 🔧 Development Scripts

### Backend Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run seed:superuser # Create superuser account
```

### Frontend Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🛡️ Security Features

### Backend Security
- **Helmet.js** for security headers
- **CORS** with credentials support
- **Rate limiting** (100 requests per 15 minutes)
- **MongoDB injection protection**
- **Input validation** with Joi
- **Password hashing** with bcrypt (cost factor 12)
- **JWT tokens** with expiration
- **HTTP-only cookies** for refresh tokens

### Frontend Security
- **Axios interceptors** for automatic token refresh
- **Protected routes** with role-based access
- **Secure token storage** in memory (not localStorage for access tokens)
- **Input validation** and sanitization
- **Error handling** with user-friendly messages

## 🎨 UI/UX Features

- **Responsive design** that works on all devices
- **Modern, clean interface** with Tailwind CSS
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Intuitive navigation** with React Router
- **Role-based UI** showing different features for different users
- **Accessible components** with proper ARIA labels

## 🚀 Production Deployment

### Environment Variables

Make sure to set these environment variables in production:

```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_ACCESS_SECRET=your_secure_access_secret
JWT_REFRESH_SECRET=your_secure_refresh_secret
FRONTEND_URL=your_production_frontend_url
```

### Build for Production

```bash
# Backend
cd Backend
npm start

# Frontend
cd Frontend/docsense
npm run build
```

### Security Considerations

1. **Change default secrets** in production
2. **Use HTTPS** in production
3. **Set secure cookie options** for production
4. **Implement proper logging** and monitoring
5. **Use environment-specific configurations**
6. **Regular security updates** for dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGO_URI in your .env file
   - Verify MongoDB is accessible on the specified port

2. **CORS Errors**
   - Check FRONTEND_URL in backend .env file
   - Ensure frontend is running on the correct port

3. **Token Refresh Issues**
   - Clear browser cookies and localStorage
   - Check if refresh token is being set correctly

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check Node.js version compatibility

### Getting Help

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check that MongoDB is running and accessible

## 🎯 Future Enhancements

- [ ] File upload functionality
- [ ] Email notifications for approvals
- [ ] Two-factor authentication
- [ ] Document versioning
- [ ] Advanced search and filtering
- [ ] User activity logging
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

---

**Built with ❤️ By CodeNirbhar**

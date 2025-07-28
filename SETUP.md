# BazaarBuddy Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Environment Configuration

The server requires a `.env` file. You can create it manually or run the setup script:

```bash
cd server
npm run setup
```

This will create a `.env` file with default values. You can modify it as needed:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/bazaarbuddy

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### 3. MongoDB Atlas Setup (Recommended)

**Follow the detailed guide**: [MONGODB_ATLAS_SETUP.md](./MONGODB_ATLAS_SETUP.md)

Quick steps:
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (FREE tier)
3. Set up database user and network access
4. Get your connection string
5. Update `MONGODB_URI` in `.env` file
6. Test connection with `npm run setup`

### 4. Start the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## Troubleshooting

### Registration Issues

If you encounter registration problems:

1. **Check MongoDB Connection**
   ```bash
   cd server
   npm run setup
   ```

2. **Verify Environment Variables**
   - Ensure `.env` file exists in the server directory
   - Check that `MONGODB_URI` is correct
   - Verify `JWT_SECRET` is set

3. **Check Server Logs**
   - Look for MongoDB connection errors
   - Check for validation errors
   - Verify API endpoints are working

4. **Common Issues**
   - **"MongoDB connection failed"**: Start MongoDB or check connection string
   - **"User already exists"**: Try a different email address
   - **"Network error"**: Check if server is running on port 5000
   - **"Validation errors"**: Check form data format

### Database Issues

1. **Reset Database** (if needed):
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Switch to database
   use bazaarbuddy
   
   # Clear collections
   db.users.drop()
   db.products.drop()
   db.orders.drop()
   ```

2. **Seed Sample Data**:
   ```bash
   cd server
   npm run seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Health Check
- `GET /api/health` - Server status

## Development

### Project Structure
```
BazaarBuddy/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── services/      # API services
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── package.json
└── README.md
```

### Key Features
- User authentication (vendor/supplier roles)
- Real-time messaging with Socket.io
- Product management
- Order management
- Profile management

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check server and client console logs
5. Verify environment variables are set correctly 
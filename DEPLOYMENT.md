# 🚀 BazaarBuddy Deployment Guide

## 📋 Prerequisites

- Node.js 16+ installed
- MongoDB Atlas account (for production database)
- Deployment platform accounts (Vercel, Railway, Render, etc.)

## 🔧 Environment Configuration

### Frontend (Client) Environment Variables

Create a `.env` file in the `client` directory:

```bash
# Development (uses Vite proxy)
VITE_API_URL=http://localhost:5000

# Production (set to your backend URL)
# VITE_API_URL=https://your-backend-domain.com
```

### Backend (Server) Environment Variables

Create a `.env` file in the `server` directory:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bazaarbuddy

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=https://your-frontend-domain.com

# Optional: External Services
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## 🌐 Deployment Platforms

### Frontend Deployment (Vercel/Netlify)

1. **Connect your GitHub repository**
2. **Set Environment Variables:**
   - `VITE_API_URL`: Your backend URL
3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Backend Deployment (Railway/Render)

1. **Connect your GitHub repository**
2. **Set Environment Variables:**
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure random string
   - `CLIENT_URL`: Your frontend domain
   - `NODE_ENV`: `production`
3. **Build Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`

## 🔍 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Problem:** Frontend can't connect to backend
**Solution:** 
- Ensure `CLIENT_URL` is set correctly in backend
- Check that frontend domain matches exactly
- Verify CORS configuration in `server/index.js`

#### 2. API Connection Issues
**Problem:** Frontend shows network errors
**Solution:**
- Check `VITE_API_URL` in frontend environment
- Ensure backend is running and accessible
- Verify API endpoints are working

#### 3. Authentication Issues
**Problem:** Login/Registration not working
**Solution:**
- Check JWT_SECRET is set correctly
- Verify MongoDB connection
- Check browser console for API errors

### Debug Steps

1. **Check Backend Health:**
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

2. **Test API Connection:**
   ```bash
   curl -X POST https://your-backend-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Check Frontend Environment:**
   - Open browser console
   - Look for API URL logs
   - Check for network errors

## 📱 Platform-Specific Instructions

### Vercel (Frontend)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd client
   vercel
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add VITE_API_URL
   ```

### Railway (Backend)

1. **Install Railway CLI:**
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   cd server
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set MONGODB_URI=your-mongodb-uri
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set CLIENT_URL=your-frontend-url
   ```

### Render (Backend)

1. **Create new Web Service**
2. **Connect GitHub repository**
3. **Set Environment Variables in dashboard**
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`

## 🔒 Security Checklist

- [ ] JWT_SECRET is a secure random string
- [ ] MongoDB Atlas has proper security rules
- [ ] CORS is configured for production domains
- [ ] Environment variables are not exposed in code
- [ ] HTTPS is enabled for all domains
- [ ] API rate limiting is configured
- [ ] Input validation is working

## 📊 Monitoring

### Health Check Endpoint
```bash
GET /api/health
```

### Logs to Monitor
- API request/response logs
- Authentication attempts
- Database connection status
- Error rates and types

## 🚨 Emergency Procedures

### If Backend Goes Down
1. Check Railway/Render dashboard
2. Verify environment variables
3. Check MongoDB Atlas status
4. Restart the service

### If Frontend Goes Down
1. Check Vercel/Netlify dashboard
2. Verify environment variables
3. Check build logs
4. Redeploy if necessary

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review platform-specific documentation
3. Check browser console for errors
4. Verify all environment variables are set correctly

## 🔄 Updates

To update the deployed application:
1. Push changes to GitHub
2. Platform will automatically redeploy
3. Verify new deployment is working
4. Check all features are functional 
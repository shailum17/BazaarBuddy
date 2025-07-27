# 🚀 BazaarBuddy Setup Guide

This guide will help you set up and run the BazaarBuddy platform locally.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**
- **Git**

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BazaarBuddy
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
```

#### Environment Configuration (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/bazaarbuddy
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bazaarbuddy

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Optional: WhatsApp Integration
# WHATSAPP_API_URL=https://api.whatsapp.com/v1
# WHATSAPP_TOKEN=your_whatsapp_token
# WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000" > .env
```

### 4. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Create database: `bazaarbuddy`

#### Option B: MongoDB Atlas

1. Create MongoDB Atlas account
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Start the Application

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👥 Test Users

### Vendor Account
```
Email: vendor@test.com
Password: password123
Role: vendor
```

### Supplier Account
```
Email: supplier@test.com
Password: password123
Role: supplier
```

## 🔧 Available Scripts

### Backend (server/)
```bash
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests
```

### Frontend (client/)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📱 Features Implemented

### ✅ Core Features
- [x] User Authentication (Login/Register)
- [x] Role-based Access Control (Vendor/Supplier)
- [x] Product Management
- [x] Order Creation and Management
- [x] Real-time Order Tracking
- [x] Chat System
- [x] WhatsApp Notifications
- [x] Search and Filtering
- [x] Rating and Reviews

### ✅ Vendor Features
- [x] Browse Products
- [x] Search and Filter Products
- [x] Add to Cart
- [x] Place Orders
- [x] Track Order Status
- [x] Chat with Suppliers
- [x] Rate Orders
- [x] View Order History

### ✅ Supplier Features
- [x] Manage Products
- [x] Set Pricing
- [x] Receive Orders
- [x] Update Order Status
- [x] Chat with Vendors
- [x] View Analytics
- [x] Manage Inventory

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Vendor Routes
- `GET /api/vendors/dashboard` - Dashboard stats
- `GET /api/vendors/products/search` - Search products
- `GET /api/vendors/suppliers` - Browse suppliers
- `POST /api/vendors/orders` - Create order
- `GET /api/vendors/orders` - Get orders
- `POST /api/vendors/orders/:id/rate` - Rate order

### Supplier Routes
- `GET /api/suppliers/dashboard` - Dashboard stats
- `GET /api/suppliers/products` - Get products
- `POST /api/suppliers/products` - Add product
- `PUT /api/suppliers/orders/:id/status` - Update order status

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: String,
  role: 'vendor' | 'supplier',
  trustScore: Number,
  stats: { totalOrders, totalRevenue, rating, reviews }
}
```

### Product Model
```javascript
{
  name: String,
  supplier: ObjectId (ref: User),
  category: String,
  price: Number,
  unit: String,
  quantity: Number,
  isAvailable: Boolean,
  rating: { average, count }
}
```

### Order Model
```javascript
{
  orderNumber: String (auto-generated),
  vendor: ObjectId (ref: User),
  supplier: ObjectId (ref: User),
  items: [{ product, quantity, price, total }],
  status: 'pending' | 'accepted' | 'delivered' | 'cancelled',
  total: Number,
  deliveryDate: Date
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (Render/Railway)
```bash
cd server
npm start
# Set environment variables
```

### Database (MongoDB Atlas)
- Create MongoDB Atlas cluster
- Update `MONGODB_URI` in environment variables

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## 📊 Real-time Features

- Socket.io integration
- Live order status updates
- Real-time chat system
- Instant notifications
- Live user presence

## 🎨 UI/UX Features

- Responsive design
- Modern UI with Tailwind CSS
- Loading states
- Error handling
- Toast notifications
- Mobile-first approach

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes

3. **CORS Errors**
   - Verify CLIENT_URL in .env
   - Check browser console

4. **Socket Connection Issues**
   - Check if backend is running
   - Verify socket URL configuration

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev -- --debug
```

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Create an issue in the repository

## 🎯 Next Steps

After successful setup:
1. Create test accounts
2. Add sample products
3. Test order flow
4. Configure WhatsApp integration
5. Set up production environment

---

**Happy coding! 🚀** 
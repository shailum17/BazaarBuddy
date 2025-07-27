# 🛒 BazaarBuddy - Street Food Vendor Sourcing Platform

A comprehensive B2B platform connecting street food vendors with reliable suppliers for fresh ingredients and supplies.

## 🚀 Live Demo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🎯 Features Implemented

### ✅ Core Features
- [x] **User Authentication** - Secure login/register with JWT
- [x] **Role-based Access Control** - Vendor, Supplier, Admin roles
- [x] **Real-time Communication** - Socket.io chat system
- [x] **Order Management** - Complete order lifecycle
- [x] **Product Catalog** - Full CRUD operations
- [x] **Search & Filtering** - Advanced product search
- [x] **Rating & Reviews** - Supplier rating system
- [x] **WhatsApp Integration** - Order notifications
- [x] **Responsive Design** - Mobile-first approach

### ✅ Vendor Features
- [x] **Dashboard** - Real-time stats and analytics
- [x] **Product Browsing** - Search, filter, and compare products
- [x] **Shopping Cart** - Add items and place orders
- [x] **Order Tracking** - Real-time status updates
- [x] **Supplier Discovery** - Browse and rate suppliers
- [x] **Chat System** - Communicate with suppliers
- [x] **Order History** - Complete order management

### ✅ Supplier Features
- [x] **Dashboard** - Business analytics and insights
- [x] **Product Management** - Add, edit, delete products
- [x] **Order Processing** - Accept, reject, update status
- [x] **Inventory Management** - Stock tracking
- [x] **Customer Communication** - Chat with vendors
- [x] **Performance Analytics** - Sales and rating tracking

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JWT + bcryptjs |
| **Real-time** | Socket.io |
| **Styling** | Tailwind CSS + Lucide React Icons |
| **State Management** | React Context API |
| **HTTP Client** | Axios |
| **Notifications** | React Hot Toast + WhatsApp API |

## 📁 Project Structure

```
BazaarBuddy/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Chat.jsx    # Real-time chat component
│   │   ├── pages/          # Route pages
│   │   │   ├── Auth/       # Login/Register pages
│   │   │   ├── Vendor/     # Vendor-specific pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Products.jsx  # Browse & order products
│   │   │   │   ├── Suppliers.jsx
│   │   │   │   ├── Orders.jsx    # Order tracking
│   │   │   │   └── Profile.jsx
│   │   │   └── Supplier/   # Supplier-specific pages
│   │   │       ├── Dashboard.jsx
│   │   │       ├── Products.jsx  # Product management
│   │   │       ├── Orders.jsx    # Order processing
│   │   │       └── Profile.jsx
│   │   ├── context/        # React Context providers
│   │   ├── services/       # API & Socket services
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js Backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth & error middleware
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # WhatsApp & Socket services
│   ├── scripts/            # Database seeding
│   ├── package.json
│   └── index.js
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd BazaarBuddy

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

#### Backend (.env)
```bash
cd server
# Create .env file with the following variables:
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/bazaarbuddy
JWT_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
cd client
# Create .env file:
VITE_API_URL=http://localhost:5000
```

### 3. Database Setup

```bash
# Seed the database with test data
cd server
npm run seed
```

### 4. Start the Application

```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👥 Test Accounts

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
- `PUT /api/suppliers/products/:id` - Update product
- `DELETE /api/suppliers/products/:id` - Delete product
- `GET /api/suppliers/orders` - Get orders
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

## 🔒 Security Features

- **JWT-based authentication** with role-based access control
- **Password hashing** with bcryptjs
- **Input validation** and sanitization
- **CORS configuration** for cross-origin requests
- **Helmet.js** security headers
- **Rate limiting** ready for implementation

## 📊 Real-time Features

- **Socket.io integration** for live updates
- **Order status updates** in real-time
- **Chat system** between vendors and suppliers
- **Instant notifications** for new orders
- **Live user presence** tracking

## 🎨 UI/UX Features

- **Responsive design** for all devices
- **Modern UI** with Tailwind CSS
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Mobile-first** approach
- **Accessibility** considerations

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

## 🐛 Troubleshooting

### Common Issues

1. **Login Fails**
   - Check if backend server is running
   - Verify database connection
   - Ensure test data is seeded

2. **API Connection Errors**
   - Check if both servers are running
   - Verify proxy configuration in vite.config.js
   - Check CORS settings

3. **Database Connection**
   - Verify MongoDB URI in .env
   - Check network connectivity
   - Ensure database exists

4. **Socket Connection**
   - Check if Socket.io server is running
   - Verify VITE_API_URL in frontend .env
   - Check browser console for errors

### Development Commands

```bash
# Backend
cd server
npm run dev          # Start development server
npm run seed         # Seed database
npm start           # Start production server

# Frontend
cd client
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

## 🔧 Available Scripts

### Backend (server/)
```bash
npm run dev      # Start development server
npm start        # Start production server
npm run seed     # Seed database with test data
```

### Frontend (client/)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🔄 Real-time Updates

- **Order Status**: Updates instantly when supplier changes status
- **Chat Messages**: Real-time messaging between vendors and suppliers
- **Notifications**: Instant toast notifications for important events
- **Live Data**: Dashboard stats update in real-time

## 🎯 Next Steps

### Planned Features
- [ ] **Payment Integration** - Online payment processing
- [ ] **Analytics Dashboard** - Advanced business insights
- [ ] **Mobile App** - React Native application
- [ ] **AI Recommendations** - Smart product suggestions
- [ ] **Multi-language Support** - Internationalization
- [ ] **Advanced Search** - AI-powered search
- [ ] **Bulk Ordering** - Simplified bulk purchases
- [ ] **Delivery Tracking** - GPS-based tracking

### Performance Optimizations
- [ ] **Caching** - Redis for session management
- [ ] **CDN** - Content delivery network
- [ ] **Image Optimization** - Compressed product images
- [ ] **Lazy Loading** - On-demand component loading
- [ ] **Database Indexing** - Optimized queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**BazaarBuddy** - Connecting street food vendors with reliable suppliers! 🛒✨ 
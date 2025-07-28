const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

console.log('🔧 BazaarBuddy Server Setup');
console.log('==========================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Server Configuration
NODE_ENV=development
PORT=5000

# Database - MongoDB Atlas (Recommended)
# Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bazaarbuddy?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=bazaarbuddy-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# Optional: External Services
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Optional: File Upload (if using cloud storage)
# CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
# CLOUDINARY_API_KEY=your_cloudinary_api_key
# CLOUDINARY_API_SECRET=your_cloudinary_api_secret
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully');
} else {
  console.log('✅ .env file already exists');
}

// Test MongoDB connection
console.log('\n🔗 Testing MongoDB connection...');
const testConnection = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri || uri.includes('<username>') || uri.includes('<cluster>')) {
      console.log('⚠️  MongoDB Atlas connection string not configured');
      console.log('\n📋 To set up MongoDB Atlas:');
      console.log('1. Go to https://www.mongodb.com/atlas');
      console.log('2. Create a free account and cluster');
      console.log('3. Get your connection string');
      console.log('4. Update MONGODB_URI in .env file');
      console.log('5. Replace <username>, <password>, and <cluster> with your values');
      console.log('6. Whitelist your IP address in Atlas');
      console.log('\nExample connection string:');
      console.log('mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/bazaarbuddy?retryWrites=true&w=majority');
      return;
    }
    
    console.log(`Attempting to connect to MongoDB Atlas...`);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB Atlas connection successful!');
    console.log(`📦 Connected to: ${mongoose.connection.host}`);
    console.log(`🗄️  Database: ${mongoose.connection.name}`);
    
    await mongoose.disconnect();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips for MongoDB Atlas:');
    console.log('1. Check your connection string format');
    console.log('2. Verify username and password are correct');
    console.log('3. Make sure your IP is whitelisted in Atlas');
    console.log('4. Check if your cluster is running');
    console.log('5. Verify network connectivity');
    console.log('\n🔗 Atlas Setup Guide:');
    console.log('1. Login to MongoDB Atlas');
    console.log('2. Go to Database Access → Add New Database User');
    console.log('3. Go to Network Access → Add IP Address (or 0.0.0.0/0 for all)');
    console.log('4. Copy connection string from Connect button');
  }
};

// Load environment variables and test connection
require('dotenv').config();
testConnection(); 
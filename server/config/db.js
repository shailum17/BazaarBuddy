const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.error('💡 Please set MONGODB_URI in your .env file');
      console.error('💡 For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bazaarbuddy');
      process.exit(1);
    }
    
    if (uri.includes('<username>') || uri.includes('<cluster>')) {
      console.error('❌ MongoDB Atlas connection string not properly configured');
      console.error('💡 Please replace <username>, <password>, and <cluster> with your actual values');
      process.exit(1);
    }
    
    console.log(`🔗 Attempting to connect to MongoDB Atlas...`);
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
    });

    console.log(`📦 MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🔗 Connection ready for BazaarBuddy application`);
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    console.error('\n💡 Troubleshooting MongoDB Atlas:');
    console.error('1. Check your connection string format');
    console.error('2. Verify username and password are correct');
    console.error('3. Make sure your IP is whitelisted in Atlas');
    console.error('4. Check if your cluster is running');
    console.error('5. Verify network connectivity');
    console.error('\n🔗 Atlas Setup Steps:');
    console.error('1. Login to MongoDB Atlas');
    console.error('2. Go to Database Access → Add New Database User');
    console.error('3. Go to Network Access → Add IP Address (or 0.0.0.0/0 for all)');
    console.error('4. Copy connection string from Connect button');
    process.exit(1);
  }
};

module.exports = connectDB; 
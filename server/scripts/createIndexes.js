#!/usr/bin/env node

/**
 * Database Indexing Script
 * Creates optimized indexes for better query performance
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for indexing');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    console.log('🔍 Creating database indexes...\n');

    // User collection indexes
    console.log('📋 Creating User indexes...');
    await db.collection('users').createIndex({ email: 1 }, { 
      unique: true, 
      sparse: true,
      name: 'email_unique_sparse'
    });
    await db.collection('users').createIndex({ phone: 1 }, { 
      unique: true, 
      sparse: true,
      name: 'phone_unique_sparse'
    });
    await db.collection('users').createIndex({ role: 1 }, { name: 'role_index' });
    await db.collection('users').createIndex({ location: 1 }, { name: 'location_index' });
    await db.collection('users').createIndex({ isVerified: 1 }, { name: 'verified_index' });
    await db.collection('users').createIndex({ trustScore: -1 }, { name: 'trust_score_desc' });
    await db.collection('users').createIndex({ createdAt: -1 }, { name: 'created_desc' });
    console.log('✅ User indexes created');

    // Product collection indexes
    console.log('📦 Creating Product indexes...');
    await db.collection('products').createIndex({ supplier: 1 }, { name: 'supplier_index' });
    await db.collection('products').createIndex({ category: 1 }, { name: 'category_index' });
    await db.collection('products').createIndex({ isAvailable: 1 }, { name: 'available_index' });
    await db.collection('products').createIndex({ price: 1 }, { name: 'price_index' });
    await db.collection('products').createIndex({ 'rating.average': -1 }, { name: 'rating_desc' });
    await db.collection('products').createIndex({ 
      name: 'text', 
      description: 'text',
      tags: 'text'
    }, { 
      name: 'product_text_search',
      weights: { name: 10, description: 5, tags: 1 }
    });
    // Compound indexes for common queries
    await db.collection('products').createIndex({ 
      category: 1, 
      isAvailable: 1, 
      price: 1 
    }, { name: 'category_available_price' });
    await db.collection('products').createIndex({ 
      supplier: 1, 
      isAvailable: 1 
    }, { name: 'supplier_available' });
    console.log('✅ Product indexes created');

    // Order collection indexes
    console.log('📋 Creating Order indexes...');
    await db.collection('orders').createIndex({ vendor: 1 }, { name: 'vendor_index' });
    await db.collection('orders').createIndex({ supplier: 1 }, { name: 'supplier_index' });
    await db.collection('orders').createIndex({ status: 1 }, { name: 'status_index' });
    await db.collection('orders').createIndex({ orderNumber: 1 }, { 
      unique: true,
      name: 'order_number_unique'
    });
    await db.collection('orders').createIndex({ createdAt: -1 }, { name: 'created_desc' });
    await db.collection('orders').createIndex({ deliveryDate: 1 }, { name: 'delivery_date' });
    // Compound indexes for dashboard queries
    await db.collection('orders').createIndex({ 
      vendor: 1, 
      status: 1, 
      createdAt: -1 
    }, { name: 'vendor_status_created' });
    await db.collection('orders').createIndex({ 
      supplier: 1, 
      status: 1, 
      createdAt: -1 
    }, { name: 'supplier_status_created' });
    console.log('✅ Order indexes created');

    // OTP collection indexes
    console.log('🔐 Creating OTP indexes...');
    await db.collection('otps').createIndex({ 
      contact: 1, 
      type: 1 
    }, { name: 'contact_type' });
    await db.collection('otps').createIndex({ 
      expiresAt: 1 
    }, { 
      expireAfterSeconds: 0,
      name: 'otp_expiry'
    });
    console.log('✅ OTP indexes created');

    console.log('\n🎉 All indexes created successfully!');
    
    // List all indexes for verification
    console.log('\n📊 Index Summary:');
    const collections = ['users', 'products', 'orders', 'otps'];
    
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).listIndexes().toArray();
      console.log(`\n${collectionName.toUpperCase()} (${indexes.length} indexes):`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  await createIndexes();
  await mongoose.disconnect();
  console.log('\n✅ Indexing completed successfully');
  process.exit(0);
};

run().catch(err => {
  console.error('❌ Indexing failed:', err);
  process.exit(1);
});
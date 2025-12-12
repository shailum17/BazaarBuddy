const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('🔗 MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkProducts = async () => {
  try {
    console.log('📊 Database Status Check\n');

    // Count total products
    const totalProducts = await Product.countDocuments();
    console.log(`📦 Total Products: ${totalProducts}`);

    // Count products by category
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    if (categories.length > 0) {
      console.log('\n📂 Products by Category:');
      categories.forEach(cat => {
        console.log(`   - ${cat._id || 'Uncategorized'}: ${cat.count}`);
      });
    }

    // Count suppliers with products
    const suppliersWithProducts = await Product.aggregate([
      { $group: { _id: '$supplier', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'supplier' } },
      { $unwind: '$supplier' },
      { $project: { 
        supplierName: '$supplier.name', 
        businessName: '$supplier.businessDetails.businessName',
        productCount: '$count' 
      }},
      { $sort: { productCount: -1 } }
    ]);

    if (suppliersWithProducts.length > 0) {
      console.log('\n👥 Suppliers with Products:');
      suppliersWithProducts.forEach(supplier => {
        console.log(`   - ${supplier.supplierName} (${supplier.businessName || 'No business name'}): ${supplier.productCount} products`);
      });
    } else {
      console.log('\n👥 No suppliers with products found');
    }

    // Check for any remaining sample data
    const sampleProducts = await Product.find({
      name: { $regex: /(sample|test|demo)/i }
    });

    if (sampleProducts.length > 0) {
      console.log('\n⚠️  Potential sample products still found:');
      sampleProducts.forEach(product => {
        console.log(`   - ${product.name}`);
      });
    } else {
      console.log('\n✅ No sample products detected');
    }

    console.log('\n🎉 Database check completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking products:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(checkProducts);
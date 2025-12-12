const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('🔗 MongoDB connected for removing sample products');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const removeSampleProducts = async () => {
  try {
    console.log('🧹 Starting sample product cleanup...\n');

    // Find sample suppliers
    const sampleSuppliers = await User.find({
      $or: [
        { email: 'sample@supplier.com' },
        { name: 'Sample Supplier' },
        { 'businessDetails.businessName': 'Sample Fresh Foods' },
        { 'businessDetails.businessName': 'Fresh Vegetables Co.' },
        { 'businessDetails.businessName': 'Spice World' },
        { 'businessDetails.businessName': 'Dairy Fresh' },
        { 'businessDetails.businessName': 'Grain Masters' }
      ]
    });

    console.log(`📋 Found ${sampleSuppliers.length} sample suppliers`);

    // Sample product names to remove (from both scripts)
    const sampleProductNames = [
      'Fresh Tomatoes',
      'Onions', 
      'Potatoes',
      'Red Chilli Powder',
      'Turmeric Powder',
      'Fresh Milk',
      'Curd',
      'Butter',
      'Carrots',
      'Spinach',
      'Cauliflower',
      'Coriander Powder',
      'Cumin Powder',
      'Garam Masala',
      'Paneer',
      'Ghee',
      'Cheese',
      'Rice',
      'Wheat Flour',
      'Lentils'
    ];

    // Get supplier IDs for filtering
    const sampleSupplierIds = sampleSuppliers.map(s => s._id);

    // Find products to remove (either by sample supplier or by name)
    const productsToRemove = await Product.find({
      $or: [
        { supplier: { $in: sampleSupplierIds } },
        { name: { $in: sampleProductNames } }
      ]
    }).populate('supplier', 'name email businessDetails.businessName');

    console.log(`📦 Found ${productsToRemove.length} sample products to remove:`);
    productsToRemove.forEach(product => {
      console.log(`   - ${product.name} (${product.supplier?.name || 'Unknown Supplier'})`);
    });

    if (productsToRemove.length === 0) {
      console.log('✅ No sample products found to remove');
      process.exit(0);
    }

    // Check for orders with these products
    const productIds = productsToRemove.map(p => p._id);
    const ordersWithSampleProducts = await Order.find({
      'items.product': { $in: productIds }
    });

    if (ordersWithSampleProducts.length > 0) {
      console.log(`\n⚠️  Warning: Found ${ordersWithSampleProducts.length} orders containing sample products`);
      console.log('   These orders will be updated to remove sample product references');
      
      // Remove sample products from order items
      for (const order of ordersWithSampleProducts) {
        order.items = order.items.filter(item => !productIds.includes(item.product));
        
        // Recalculate total if items were removed
        if (order.items.length === 0) {
          // If no items left, you might want to delete the order or mark it as cancelled
          console.log(`   - Order ${order._id} has no items left after cleanup`);
        } else {
          order.totalAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          await order.save();
          console.log(`   - Updated order ${order._id}`);
        }
      }
    }

    // Remove the products
    const deleteResult = await Product.deleteMany({
      $or: [
        { supplier: { $in: sampleSupplierIds } },
        { name: { $in: sampleProductNames } }
      ]
    });

    console.log(`\n🗑️  Removed ${deleteResult.deletedCount} sample products`);

    // Ask about removing sample suppliers
    console.log('\n👤 Sample suppliers found:');
    sampleSuppliers.forEach(supplier => {
      console.log(`   - ${supplier.name} (${supplier.email}) - ${supplier.businessDetails?.businessName || 'No business name'}`);
    });

    // Check if sample suppliers have any remaining products
    const remainingProducts = await Product.find({ supplier: { $in: sampleSupplierIds } });
    
    if (remainingProducts.length === 0) {
      console.log('\n🧹 Removing sample suppliers (no remaining products)...');
      
      // Remove sample suppliers
      const supplierDeleteResult = await User.deleteMany({
        _id: { $in: sampleSupplierIds }
      });
      
      console.log(`🗑️  Removed ${supplierDeleteResult.deletedCount} sample suppliers`);
    } else {
      console.log(`\n⚠️  Keeping sample suppliers as they have ${remainingProducts.length} remaining products`);
    }

    console.log('\n✅ Sample product cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Products removed: ${deleteResult.deletedCount}`);
    console.log(`   - Suppliers processed: ${sampleSuppliers.length}`);
    console.log(`   - Orders updated: ${ordersWithSampleProducts.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing sample products:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(removeSampleProducts);
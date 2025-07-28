const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('MongoDB connected for adding sample products');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addSampleProducts = async () => {
  try {
    // Find or create a supplier
    let supplier = await User.findOne({ role: 'supplier' });
    
    if (!supplier) {
      console.log('Creating a sample supplier...');
      supplier = await User.create({
        name: 'Sample Supplier',
        email: 'sample@supplier.com',
        password: 'password123',
        phone: '9876543210',
        location: 'Mumbai, Maharashtra',
        role: 'supplier',
        businessDetails: {
          businessName: 'Sample Fresh Foods',
          businessType: 'Wholesale Supplier',
          address: 'Sample Market, Mumbai'
        }
      });
      console.log('Created sample supplier:', supplier.name);
    } else {
      console.log('Using existing supplier:', supplier.name);
    }

    // Sample products
    const sampleProducts = [
      {
        name: 'Fresh Tomatoes',
        supplier: supplier._id,
        category: 'vegetables',
        description: 'Fresh red tomatoes from local farms',
        price: 40,
        unit: 'kg',
        quantity: 100,
        minOrderQuantity: 5,
        isAvailable: true,
        rating: { average: 4.5, count: 12 }
      },
      {
        name: 'Onions',
        supplier: supplier._id,
        category: 'vegetables',
        description: 'Fresh white onions',
        price: 25,
        unit: 'kg',
        quantity: 150,
        minOrderQuantity: 10,
        isAvailable: true,
        rating: { average: 4.2, count: 8 }
      },
      {
        name: 'Potatoes',
        supplier: supplier._id,
        category: 'vegetables',
        description: 'Fresh potatoes for cooking',
        price: 30,
        unit: 'kg',
        quantity: 200,
        minOrderQuantity: 10,
        isAvailable: true,
        rating: { average: 4.0, count: 15 }
      },
      {
        name: 'Red Chilli Powder',
        supplier: supplier._id,
        category: 'spices',
        description: 'Pure red chilli powder',
        price: 120,
        unit: 'kg',
        quantity: 50,
        minOrderQuantity: 1,
        isAvailable: true,
        rating: { average: 4.7, count: 6 }
      },
      {
        name: 'Turmeric Powder',
        supplier: supplier._id,
        category: 'spices',
        description: 'Pure turmeric powder',
        price: 80,
        unit: 'kg',
        quantity: 75,
        minOrderQuantity: 1,
        isAvailable: true,
        rating: { average: 4.3, count: 9 }
      },
      {
        name: 'Fresh Milk',
        supplier: supplier._id,
        category: 'dairy',
        description: 'Fresh cow milk',
        price: 60,
        unit: 'l',
        quantity: 100,
        minOrderQuantity: 5,
        isAvailable: true,
        rating: { average: 4.6, count: 20 }
      },
      {
        name: 'Curd',
        supplier: supplier._id,
        category: 'dairy',
        description: 'Fresh homemade curd',
        price: 80,
        unit: 'kg',
        quantity: 50,
        minOrderQuantity: 2,
        isAvailable: true,
        rating: { average: 4.4, count: 11 }
      },
      {
        name: 'Butter',
        supplier: supplier._id,
        category: 'dairy',
        description: 'Fresh butter',
        price: 200,
        unit: 'kg',
        quantity: 25,
        minOrderQuantity: 1,
        isAvailable: true,
        rating: { average: 4.8, count: 7 }
      }
    ];

    console.log('Adding sample products...');
    let addedCount = 0;
    
    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({
        name: productData.name,
        supplier: productData.supplier
      });
      
      if (!existingProduct) {
        await Product.create(productData);
        console.log(`✅ Added: ${productData.name}`);
        addedCount++;
      } else {
        console.log(`⚠️  Already exists: ${productData.name}`);
      }
    }

    console.log(`\n🎉 Sample data added successfully!`);
    console.log(`📦 Added ${addedCount} new products`);
    console.log(`👤 Supplier: ${supplier.name} (${supplier.email})`);
    console.log(`\n💡 You can now browse products as a vendor!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(addSampleProducts); 
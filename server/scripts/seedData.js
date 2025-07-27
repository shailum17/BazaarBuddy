const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
require('dotenv').config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/bazaarbuddy";
    await mongoose.connect(uri);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  const users = [
    {
      name: 'Rajesh Kumar',
      email: 'vendor@test.com',
      password: 'password123',
      phone: '9876543210',
      location: 'Mumbai, Maharashtra',
      role: 'vendor',
      businessDetails: {
        businessName: 'Rajesh Street Food',
        businessType: 'Street Food Vendor',
        address: 'Andheri West, Mumbai'
      }
    },
    {
      name: 'Priya Sharma',
      email: 'supplier@test.com',
      password: 'password123',
      phone: '9876543211',
      location: 'Mumbai, Maharashtra',
      role: 'supplier',
      businessDetails: {
        businessName: 'Fresh Vegetables Co.',
        businessType: 'Wholesale Supplier',
        address: 'Vashi Market, Navi Mumbai'
      }
    },
    {
      name: 'Amit Patel',
      email: 'supplier2@test.com',
      password: 'password123',
      phone: '9876543212',
      location: 'Mumbai, Maharashtra',
      role: 'supplier',
      businessDetails: {
        businessName: 'Quality Spices',
        businessType: 'Spice Supplier',
        address: 'Crawford Market, Mumbai'
      }
    },
    {
      name: 'Sita Devi',
      email: 'supplier3@test.com',
      password: 'password123',
      phone: '9876543213',
      location: 'Mumbai, Maharashtra',
      role: 'supplier',
      businessDetails: {
        businessName: 'Daily Dairy',
        businessType: 'Dairy Supplier',
        address: 'Dadar Market, Mumbai'
      }
    }
  ];

  console.log('Seeding users...');
  const createdUsers = [];
  
  for (const userData of users) {
    const existingUser = await User.findOne({ email: userData.email });
    if (!existingUser) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    } else {
      createdUsers.push(existingUser);
      console.log(`User already exists: ${existingUser.name}`);
    }
  }

  return createdUsers;
};

const seedProducts = async (users) => {
  const suppliers = users.filter(user => user.role === 'supplier');
  const products = [];

  // Fresh Vegetables Co. products
  const freshVegSupplier = suppliers.find(s => s.businessDetails.businessName === 'Fresh Vegetables Co.');
  if (freshVegSupplier) {
    products.push(
      {
        name: 'Fresh Tomatoes',
        supplier: freshVegSupplier._id,
        category: 'vegetables',
        description: 'Fresh red tomatoes from local farms',
        price: 40,
        unit: 'kg',
        quantity: 100,
        minOrderQuantity: 5,
        isAvailable: true,
        tags: ['fresh', 'organic', 'local'],
        specifications: {
          weight: '1kg',
          origin: 'Local Farm',
          organic: true
        },
        pricing: {
          basePrice: 40,
          bulkDiscount: 10,
          bulkThreshold: 20
        }
      },
      {
        name: 'Onions',
        supplier: freshVegSupplier._id,
        category: 'vegetables',
        description: 'Fresh white onions',
        price: 25,
        unit: 'kg',
        quantity: 150,
        minOrderQuantity: 10,
        isAvailable: true,
        tags: ['fresh', 'bulk'],
        specifications: {
          weight: '1kg',
          origin: 'Local Farm'
        },
        pricing: {
          basePrice: 25,
          bulkDiscount: 15,
          bulkThreshold: 25
        }
      },
      {
        name: 'Potatoes',
        supplier: freshVegSupplier._id,
        category: 'vegetables',
        description: 'Fresh potatoes for cooking',
        price: 30,
        unit: 'kg',
        quantity: 200,
        minOrderQuantity: 10,
        isAvailable: true,
        tags: ['fresh', 'cooking'],
        specifications: {
          weight: '1kg',
          origin: 'Local Farm'
        },
        pricing: {
          basePrice: 30,
          bulkDiscount: 12,
          bulkThreshold: 30
        }
      }
    );
  }

  // Quality Spices products
  const spiceSupplier = suppliers.find(s => s.businessDetails.businessName === 'Quality Spices');
  if (spiceSupplier) {
    products.push(
      {
        name: 'Red Chilli Powder',
        supplier: spiceSupplier._id,
        category: 'spices',
        description: 'Pure red chilli powder',
        price: 120,
        unit: 'kg',
        quantity: 50,
        minOrderQuantity: 1,
        isAvailable: true,
        tags: ['pure', 'spicy'],
        specifications: {
          weight: '1kg',
          origin: 'Kashmir',
          organic: false
        },
        pricing: {
          basePrice: 120,
          bulkDiscount: 20,
          bulkThreshold: 10
        }
      },
      {
        name: 'Turmeric Powder',
        supplier: spiceSupplier._id,
        category: 'spices',
        description: 'Pure turmeric powder',
        price: 80,
        unit: 'kg',
        quantity: 75,
        minOrderQuantity: 1,
        isAvailable: true,
        tags: ['pure', 'medicinal'],
        specifications: {
          weight: '1kg',
          origin: 'Karnataka',
          organic: true
        },
        pricing: {
          basePrice: 80,
          bulkDiscount: 15,
          bulkThreshold: 10
        }
      },
      {
        name: 'Coriander Powder',
        supplier: spiceSupplier._id,
        category: 'spices',
        description: 'Fresh coriander powder',
        price: 100,
        unit: 'kg',
        quantity: 60,
        minOrderQuantity: 1,
        isAvailable: true,
        tags: ['fresh', 'aromatic'],
        specifications: {
          weight: '1kg',
          origin: 'Rajasthan'
        },
        pricing: {
          basePrice: 100,
          bulkDiscount: 18,
          bulkThreshold: 10
        }
      }
    );
  }

  // Daily Dairy products
  const dairySupplier = suppliers.find(s => s.businessDetails.businessName === 'Daily Dairy');
  if (dairySupplier) {
    products.push(
      {
        name: 'Fresh Milk',
        supplier: dairySupplier._id,
        category: 'dairy',
        description: 'Fresh cow milk',
        price: 60,
        unit: 'l',
        quantity: 100,
        minOrderQuantity: 5,
        isAvailable: true,
        tags: ['fresh', 'daily'],
        specifications: {
          weight: '1L',
          origin: 'Local Dairy',
          organic: true
        },
        pricing: {
          basePrice: 60,
          bulkDiscount: 10,
          bulkThreshold: 20
        }
      },
      {
        name: 'Curd',
        supplier: dairySupplier._id,
        category: 'dairy',
        description: 'Fresh homemade curd',
        price: 80,
        unit: 'kg',
        quantity: 50,
        minOrderQuantity: 2,
        isAvailable: true,
        tags: ['fresh', 'homemade'],
        specifications: {
          weight: '1kg',
          origin: 'Local Dairy'
        },
        pricing: {
          basePrice: 80,
          bulkDiscount: 12,
          bulkThreshold: 10
        }
      },
      {
        name: 'Butter',
        supplier: dairySupplier._id,
        category: 'dairy',
        description: 'Fresh butter',
        price: 200,
        unit: 'kg',
        quantity: 25,
        minOrderQuantity: 1,
        isAvailable: true,
        tags: ['fresh', 'pure'],
        specifications: {
          weight: '1kg',
          origin: 'Local Dairy'
        },
        pricing: {
          basePrice: 200,
          bulkDiscount: 15,
          bulkThreshold: 5
        }
      }
    );
  }

  console.log('Seeding products...');
  for (const productData of products) {
    const existingProduct = await Product.findOne({
      name: productData.name,
      supplier: productData.supplier
    });
    
    if (!existingProduct) {
      const product = await Product.create(productData);
      console.log(`Created product: ${product.name}`);
    } else {
      console.log(`Product already exists: ${existingProduct.name}`);
    }
  }
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data (optional)
    // await User.deleteMany({});
    // await Product.deleteMany({});
    
    const users = await seedUsers();
    await seedProducts(users);
    
    console.log('✅ Data seeding completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Vendor: vendor@test.com / password123');
    console.log('Supplier: supplier@test.com / password123');
    console.log('Supplier 2: supplier2@test.com / password123');
    console.log('Supplier 3: supplier3@test.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeder
seedData(); 
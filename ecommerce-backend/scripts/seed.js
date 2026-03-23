require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

const users = [
  {
    name: 'Admin User',
    email: 'admin@ecommerce.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'user123',
    role: 'user',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'user123',
    role: 'user',
  },
];

const products = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 129.99,
    category: 'Electronics',
    stock: 50,
    rating: 4.5,
    numReviews: 128,
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with heart rate monitor, GPS, and 7-day battery.',
    price: 249.99,
    category: 'Electronics',
    stock: 35,
    rating: 4.7,
    numReviews: 89,
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable 100% organic cotton t-shirt, available in multiple colors.',
    price: 29.99,
    category: 'Clothing',
    stock: 200,
    rating: 4.3,
    numReviews: 256,
  },
  {
    name: 'Classic Denim Jeans',
    description: 'Slim fit denim jeans with stretch for all-day comfort.',
    price: 59.99,
    category: 'Clothing',
    stock: 80,
    rating: 4.4,
    numReviews: 142,
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'Classic programming book by Douglas Crockford on JavaScript best practices.',
    price: 24.99,
    category: 'Books',
    stock: 100,
    rating: 4.6,
    numReviews: 312,
  },
  {
    name: 'Clean Code',
    description: 'A Handbook of Agile Software Craftsmanship by Robert C. Martin.',
    price: 39.99,
    category: 'Books',
    stock: 75,
    rating: 4.8,
    numReviews: 445,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: '1L insulated water bottle, keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 34.99,
    category: 'Accessories',
    stock: 150,
    rating: 4.5,
    numReviews: 198,
  },
  {
    name: 'Leather Wallet',
    description: 'Genuine leather bifold wallet with RFID blocking technology.',
    price: 49.99,
    category: 'Accessories',
    stock: 60,
    rating: 4.2,
    numReviews: 87,
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and silent clicks.',
    price: 45.99,
    category: 'Electronics',
    stock: 120,
    rating: 4.4,
    numReviews: 234,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with cushioned sole for maximum comfort.',
    price: 89.99,
    category: 'Clothing',
    stock: 45,
    rating: 4.6,
    numReviews: 167,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('Cleared existing data');

    // Create users (one by one so pre-save hook hashes passwords)
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    const adminUser = createdUsers.find((u) => u.role === 'admin');

    console.log(`Created ${createdUsers.length} users`);

    // Create products with admin as creator
    const productsWithCreator = products.map((p) => ({
      ...p,
      createdBy: adminUser._id,
    }));

    await Product.create(productsWithCreator);
    console.log(`Created ${products.length} products`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nSample login credentials:');
    console.log('  Admin: admin@ecommerce.com / admin123');
    console.log('  User:  john@example.com / user123');
    console.log('  User:  jane@example.com / user123');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

seedDatabase();

const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI.substring(0, 50) + '...');

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log('✅ Successfully connected to MongoDB!');
    console.log('Database:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('Port:', conn.connection.port);

    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error code:', error.code);
    console.error('\nPossible solutions:');
    console.error('1. Check if MongoDB cluster is ACTIVE (not paused)');
    console.error('2. Verify IP whitelist includes 0.0.0.0/0 or your IP');
    console.error('3. Check if credentials are correct');
    console.error('4. Try flushing DNS: ipconfig /flushdns (Windows)');
    console.error('5. Check your internet connection');
    console.error('6. Try using VPN if behind corporate network');
  }
}

testConnection();

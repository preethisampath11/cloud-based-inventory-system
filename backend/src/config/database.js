const mongoose = require('mongoose');
const logger = require('../utils/logger');
const dns = require('dns');

/**
 * Connect to MongoDB Atlas
 * Establishes connection to MongoDB database using Mongoose
 */

const connectDB = async () => {
  let attempts = 0;
  const maxAttempts = 3;

  // Try with different connection options
  const connectionOptions = [
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    },
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    },
  ];

  while (attempts < maxAttempts) {
    try {
      attempts++;
      const optionIndex = attempts > 1 ? 1 : 0;
      const options = connectionOptions[optionIndex];

      logger.info(`MongoDB connection attempt ${attempts}/${maxAttempts}`);
      logger.info(`Using options:`, JSON.stringify(options));

      const conn = await mongoose.connect(process.env.MONGODB_URI, options);

      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.error(`MongoDB connection error (attempt ${attempts}): ${error.message}`);

      if (attempts < maxAttempts) {
        logger.info(`Retrying connection in 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        logger.error(`Failed to connect to MongoDB after ${maxAttempts} attempts`);
        logger.error(`\n❌ TROUBLESHOOTING TIPS:`);
        logger.error(`1. Check your internet connection - try: ping google.com`);
        logger.error(`2. Verify MongoDB cluster is ACTIVE (not paused) in MongoDB Atlas`);
        logger.error(`3. Confirm IP whitelist shows 0.0.0.0/0 as Active`);
        logger.error(`4. Verify credentials: ${process.env.MONGODB_URI.split('@')[0].substring(0, 30)}...`);
        logger.error(`5. Check if you're behind a corporate firewall/VPN`);
        logger.error(`6. Try these commands:`);
        logger.error(`   - ipconfig /flushdns (flush DNS)`);
        logger.error(`   - nslookup cluster0.pkphqpz.mongodb.net (test DNS)`);
        logger.error(`7. If on corporate network, contact IT for MongoDB access`);
        logger.error(`\n⚠️ Continuing without database connection...`);
        // Don't exit - continue app to allow testing
        return null;
      }
    }
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};

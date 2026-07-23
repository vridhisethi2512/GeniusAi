const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Force Node's internal DNS resolver to use public DNS servers directly.
// On some Windows/corporate/ISP networks, Node's resolver (c-ares) does not
// pick up OS-level DNS changes, which causes SRV lookups for
// mongodb+srv:// URIs to fail with "querySrv ECONNREFUSED" even after
// changing the network adapter's DNS settings. Setting this explicitly
// bypasses that issue entirely.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 15000,
      family: 4, // force IPv4 — avoids DNS/SRV resolution issues seen on some Windows/VPN setups
    });

    logger.info(`✅ MongoDB Atlas connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect is handled by the driver.');
    });

    return conn;
  } catch (error) {
    logger.error(`Initial MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
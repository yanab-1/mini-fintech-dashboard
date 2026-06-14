const mongoose = require('mongoose');

/**
 * Connects to MongoDB when a URI is configured. If the connection fails,
 * the app falls back to the in-memory store so the API still works.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    process.env.USE_MEMORY_DB = 'true';
    console.warn('MONGO_URI is not set. Using in-memory storage.');
    return null;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    process.env.USE_MEMORY_DB = 'false';
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    process.env.USE_MEMORY_DB = 'true';
    console.warn(`MongoDB connection failed (${error.message}). Falling back to in-memory storage.`);
    return null;
  }
};

module.exports = connectDB;

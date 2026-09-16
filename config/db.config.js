const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️  MONGODB_URI not found in environment variables. Database features will be limited.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB Atlas disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB Atlas reconnected.');
});

module.exports = connectDB;

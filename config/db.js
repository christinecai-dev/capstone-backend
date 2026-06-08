const mongoose = require('mongoose');

async function connectToDatabase() {
  const { MONGODB_URI, NODE_ENV = 'development' } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME,
  });

  console.log(`MongoDB connected in ${NODE_ENV} mode`);
}

module.exports = connectToDatabase;

'use strict';

const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(` MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      retries--;
      console.error(` MongoDB connection failed. Retries left: ${retries}. Error: ${err.message}`);
      if (!retries) throw err;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
};

module.exports = connectDB;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Resource from './models/Resource.js';
import Patient from './models/Patient.js';
import AllocationLog from './models/AllocationLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_db';

const clearDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Wipe all records from the collections
    await User.deleteMany();
    await Resource.deleteMany();
    await Patient.deleteMany();
    await AllocationLog.deleteMany();

    console.log('All MongoDB records have been successfully purged! The database is now completely empty.');
    process.exit();
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDB();

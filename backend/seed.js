import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Resource from './models/Resource.js';
import Patient from './models/Patient.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthcare_db';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await User.deleteMany();
    await Resource.deleteMany();
    await Patient.deleteMany();

    await User.create({ name: 'Admin User', email: 'admin@hospital.com', password: 'password', role: 'Admin' });
    await User.create({ name: 'Staff User', email: 'staff@hospital.com', password: 'password', role: 'Staff' });

    await Resource.insertMany([
      { name: 'ICU Bed A1', type: 'Bed', department: 'ICU', totalQuantity: 10, availableQuantity: 2, status: 'Low' },
      { name: 'General Ward Bed', type: 'Bed', department: 'General', totalQuantity: 50, availableQuantity: 45, status: 'Available' },
      { name: 'Ventilator V1', type: 'Equipment', department: 'ICU', totalQuantity: 5, availableQuantity: 0, status: 'Critical' },
      { name: 'MRI Scanner', type: 'Equipment', department: 'Radiology', totalQuantity: 2, availableQuantity: 2, status: 'Available' },
    ]);

    await Patient.insertMany([
      { 
        name: 'John Doe', age: 45, symptoms: 'Severe chest pain, shortness of breath, left arm numbness.', 
        priority: 'Critical', status: 'Waiting',
        aiAnalysis: { suggestedPriority: 'Critical', reasoning: 'Symptoms strongly indicate a myocardial infarction (heart attack).' }
      },
      { 
        name: 'Jane Smith', age: 28, symptoms: 'Mild fever, sore throat, coughing for 3 days.', 
        priority: 'Normal', status: 'Waiting',
        aiAnalysis: { suggestedPriority: 'Normal', reasoning: 'Symptoms align with mild viral infection, no immediate critical intervention needed.' }
      }
    ]);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();

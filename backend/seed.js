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
      { name: 'ICU Bed A1', type: 'ICU Bed', department: 'ICU', totalQuantity: 10, availableQuantity: 2, status: 'Low' },
      { name: 'General Ward Bed', type: 'General Bed', department: 'General', totalQuantity: 50, availableQuantity: 45, status: 'Available' },
      { name: 'Pediatric Bed', type: 'Pediatric Bed', department: 'Pediatrics', totalQuantity: 20, availableQuantity: 5, status: 'Available' },
      { name: 'Bariatric Bed', type: 'Specialty Bed', department: 'General', totalQuantity: 5, availableQuantity: 1, status: 'Low' },
      { name: 'Ventilator V1', type: 'Respiratory Equipment', department: 'ICU', totalQuantity: 15, availableQuantity: 0, status: 'Critical' },
      { name: 'MRI Scanner', type: 'Imaging Equipment', department: 'Radiology', totalQuantity: 2, availableQuantity: 2, status: 'Available' },
      { name: 'CT Scanner', type: 'Imaging Equipment', department: 'Radiology', totalQuantity: 3, availableQuantity: 1, status: 'Low' },
      { name: 'Portable X-Ray', type: 'Imaging Equipment', department: 'ER', totalQuantity: 4, availableQuantity: 3, status: 'Available' },
      { name: 'Defibrillator', type: 'Emergency Equipment', department: 'ER', totalQuantity: 10, availableQuantity: 8, status: 'Available' },
      { name: 'Blood Bank Refrigerator', type: 'Lab Equipment', department: 'Laboratory', totalQuantity: 2, availableQuantity: 1, status: 'Low' },
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
      },
      { 
        name: 'Carlos Mendez', age: 62, symptoms: 'Difficulty breathing, low oxygen saturation, persistent cough.', 
        priority: 'High', status: 'Waiting',
        aiAnalysis: { suggestedPriority: 'High', reasoning: 'Potential severe respiratory distress requiring continuous monitoring and possible supplemental oxygen.' }
      },
      { 
        name: 'Sarah Connor', age: 34, symptoms: 'Severe trauma from car accident, multiple lacerations, suspected fracture.', 
        priority: 'Critical', status: 'In Treatment',
        aiAnalysis: { suggestedPriority: 'Critical', reasoning: 'Blunt force trauma requires immediate surgical evaluation and stabilization.' }
      },
      { 
        name: 'Emily Davis', age: 9, symptoms: 'Persistent vomiting, high fever, abdominal pain.', 
        priority: 'High', status: 'Waiting',
        aiAnalysis: { suggestedPriority: 'High', reasoning: 'Pediatric case showing signs of potential appendicitis or severe gastrointestinal infection.' }
      },
      { 
        name: 'Michael Brown', age: 50, symptoms: 'Routine checkup for diabetes management, no acute symptoms.', 
        priority: 'Low', status: 'Discharged',
        aiAnalysis: { suggestedPriority: 'Low', reasoning: 'Routine chronic disease management, no acute risks identified.' }
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

import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  symptoms: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'Emergency', 'Urgent', 'High', 'Normal', 'Low'], default: 'Normal' },
  aiAnalysis: {
     suggestedPriority: String,
     reasoning: String,
  },
  status: { type: String, enum: ['Waiting', 'Allocated', 'In Treatment', 'Discharged'], default: 'Waiting' },
  allocatedResources: [{
    resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
    allocatedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);

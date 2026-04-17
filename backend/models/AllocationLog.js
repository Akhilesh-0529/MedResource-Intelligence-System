import mongoose from 'mongoose';

const allocationLogSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, enum: ['Allocated', 'Deallocated'], required: true },
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model('AllocationLog', allocationLogSchema);

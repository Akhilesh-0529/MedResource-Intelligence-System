import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Bed', 'Equipment', 'Lab'], required: true },
  department: { type: String, required: true },
  totalQuantity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Low', 'Critical'], default: 'Available' }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);

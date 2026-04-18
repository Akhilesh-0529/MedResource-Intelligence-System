import Patient from '../models/Patient.js';
import Resource from '../models/Resource.js';
import AllocationLog from '../models/AllocationLog.js';
import { predictUrgency } from '../services/aiService.js';

export const getPatients = async (req, res) => {
  const patients = await Patient.find({}).populate('allocatedResources.resource');
  res.json(patients);
};

export const createPatient = async (req, res) => {
  const { name, age, symptoms, imageData } = req.body;
  
  // Call Gemma 4 locally
  const aiResult = await predictUrgency(symptoms, age, imageData);
  
  const patient = new Patient({
    name, age, symptoms, imageData,
    priority: aiResult.suggestedPriority,
    aiAnalysis: aiResult,
    status: 'Waiting'
  });
  
  const createdPatient = await patient.save();
  req.io.emit('patient-updated', createdPatient);
  res.status(201).json(createdPatient);
};

export const allocateResource = async (req, res) => {
  try {
    const { patientId, resourceId } = req.body;
    
    if (!patientId || !resourceId) {
      return res.status(400).json({ message: 'Missing patient ID or resource ID' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(400).json({ message: 'Patient not found' });
    
    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(400).json({ message: 'Resource not found' });
    
    if (resource.availableQuantity <= 0) {
      return res.status(400).json({ message: 'Resource is currently out of stock' });
    }
    
    resource.availableQuantity -= 1;
    if (resource.availableQuantity === 0) resource.status = 'Critical';
    else if (resource.availableQuantity < resource.totalQuantity * 0.2) resource.status = 'Low';
    
    await resource.save();
    
    // Check if the allocatedResources array exists
    if (!patient.allocatedResources) {
      patient.allocatedResources = [];
    }
    patient.allocatedResources.push({ resource: resource._id });
    patient.status = 'Allocated';
    await patient.save();

    await AllocationLog.create({
      patient: patient._id, resource: resource._id, action: 'Allocated'
    });

    req.io.emit('resource-updated', resource);

    // Re-fetch with populated references so the frontend gets full details
    const populatedPatient = await Patient.findById(patient._id).populate('allocatedResources.resource');
    req.io.emit('patient-updated', populatedPatient);
    
    res.json({ patient: populatedPatient, resource });
  } catch (error) {
    console.error('Allocation Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error during allocation' });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patientId = req.params.id;
    const deletedPatient = await Patient.findByIdAndDelete(patientId);
    
    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    req.io.emit('patient-deleted', patientId);
    res.json({ message: 'Patient record deleted successfully' });
  } catch (error) {
    console.error('Delete Patient Error:', error);
    res.status(500).json({ message: error.message || 'Error deleting patient' });
  }
};


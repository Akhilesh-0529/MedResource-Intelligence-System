import express from 'express';
import { getPatients, createPatient, allocateResource, deletePatient } from '../controllers/patientController.js';

const router = express.Router();

router.route('/').get(getPatients).post(createPatient);
router.post('/allocate', allocateResource);
router.route('/:id').delete(deletePatient);

export default router;

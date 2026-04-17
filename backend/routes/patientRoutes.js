import express from 'express';
import { getPatients, createPatient, allocateResource } from '../controllers/patientController.js';

const router = express.Router();

router.route('/').get(getPatients).post(createPatient);
router.post('/allocate', allocateResource);

export default router;

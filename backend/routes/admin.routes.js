import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = Router();

router.use(protect, requireRole('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/students', adminController.getStudents);
router.get('/students/:id/full-profile', adminController.getFullStudentProfile);
router.put('/students/:id', adminController.updateStudent);
router.get('/placement-cc', adminController.getPlacementCC);
router.post('/placement-cc/drives', adminController.createDrive);
router.patch('/placement-cc/move-stage', adminController.moveStage);
router.post('/naac-report/generate', adminController.generateNAACReport);
router.get('/analytics', adminController.getAnalytics);
router.get('/skill-ledger', adminController.getSkillLedger);

export default router;

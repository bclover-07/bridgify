import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  onboard,
  validateInstitutionCode,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.post('/onboard', protect, onboard);
router.get('/validate-institution/:code', validateInstitutionCode);

export default router;

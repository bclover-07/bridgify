import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import * as recruiterController from '../controllers/recruiter.controller.js';

const router = Router();

router.get('/profile/:shareToken', recruiterController.getSharedProfile);

router.use(protect, requireRole('recruiter'));

router.get('/dashboard', recruiterController.getDashboard);
router.post('/search', recruiterController.searchCandidates);
router.post('/search/semantic', recruiterController.semanticSearch);
router.post('/search/save', recruiterController.saveSearch);
router.post('/shortlist', recruiterController.shortlistCandidate);
router.post('/ps/generate', recruiterController.generatePS);
router.get('/ps', recruiterController.getPS);
router.patch('/ps/:id', recruiterController.updatePS);
router.post('/ps/:id/publish', recruiterController.publishPS);
router.post('/drives/:driveId/feedback', recruiterController.submitFeedback);
router.get('/fair-hiring/:driveId', recruiterController.getFairHiring);
router.get('/marketplace', recruiterController.getMarketplace);
router.get('/pipeline', recruiterController.getPipeline);
router.post('/pipeline/update', recruiterController.updatePipelineStage);

export default router;

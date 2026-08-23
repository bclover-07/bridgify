import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import * as studentController from '../controllers/student.controller.js';

const router = Router();

router.use(protect, requireRole('student'));

router.get('/dashboard', studentController.getDashboard);
router.get('/readiness', studentController.getReadiness);
router.post('/readiness/what-if', studentController.whatIfReadiness);
router.post('/readiness/onboard-path', studentController.generateOnboardingPaths);
router.post('/readiness/select-path', studentController.selectLearningPath);
router.get('/assignments', studentController.getAssignments);
router.post('/assignments/submit', studentController.submitAssignmentPractice);
router.post('/code/ai-review', studentController.aiCodeReview);
router.get('/leaderboard', studentController.getLeaderboard);
router.get('/profile/academics', studentController.getAcademicProfile);
router.get('/seg', studentController.getSEG);
router.get('/seg/:skillId/evidence', studentController.getSkillEvidence);
router.post('/wallet/share', studentController.shareWallet);
router.get('/wallet/access-log', studentController.getWalletAccessLog);
router.get('/assessments', studentController.getAssessments);
router.get('/assessments/:id', studentController.getAssessmentDetail);
router.post('/assessments/:id/submit', studentController.submitAssessment);
router.get('/submissions/:id', studentController.getSubmission);
router.post('/mock-interview/start', studentController.startMockInterview);
router.get('/mock-interview/history', studentController.getInterviewHistory);
router.post('/debate/start', studentController.startDebate);
router.post('/study-plan/generate', studentController.generateStudyPlan);
router.get('/opportunities', studentController.getOpportunities);
router.post('/opportunities/:id/apply', studentController.applyForOpportunity);
router.get('/benchmarks', studentController.getBenchmarks);

export default router;

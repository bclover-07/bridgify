import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import * as facultyController from '../controllers/faculty.controller.js';

const router = Router();

router.use(protect, requireRole('faculty', 'admin'));

router.get('/dashboard', facultyController.getDashboard);
router.get('/courses', facultyController.getCourses);
router.post('/assessments/generate', facultyController.generateAssessment);
router.get('/assessments', facultyController.getAssessments);
router.get('/assessments/:id', facultyController.getAssessmentDetail);
router.patch('/assessments/:id', facultyController.updateAssessment);
router.get('/assessments/:id/submissions', facultyController.getSubmissions);
router.patch('/submissions/:id/grade', facultyController.gradeSubmission);
router.post('/assessments/:id/push-to-seg', facultyController.pushToSEG);
router.post('/notes/generate', facultyController.generateNotes);
router.post('/notes/ocr-generate', facultyController.generateNotesFromOCR);
router.post('/lecture-bridge/auto-assign', facultyController.autoAssignFromLectureNotes);
router.get('/dropout-radar', facultyController.getDropoutRadar);
router.get('/dropout-radar/:courseId?', facultyController.getDropoutRadar);
router.post('/students/:studentId/nudge', facultyController.nudgeStudent);
router.get('/cohort-heatmap', facultyController.getCohortHeatmap);
router.get('/cohort-heatmap/:courseId?', facultyController.getCohortHeatmap);
router.post('/curriculum-gap', facultyController.analyzeCurriculumGap);
router.post('/projects/assign', facultyController.assignProject);
router.get('/learning-feed', facultyController.getLearningFeed);
router.post('/lecture-bridge', facultyController.lectureBridge);
router.post('/mentorship/match', facultyController.mentorshipMatch);
router.post('/students/import-marks', facultyController.importStudentMarks);
router.post('/ppt/generate', facultyController.generatePPT);

export default router;

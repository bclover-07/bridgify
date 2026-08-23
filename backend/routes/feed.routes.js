import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as feedController from '../controllers/feed.controller.js';

const router = Router();

router.use(protect);

router.get('/', feedController.getPosts);
router.post('/', feedController.createPost);
router.post('/:postId/like', feedController.toggleLike);
router.post('/:postId/comment', feedController.addComment);

export default router;

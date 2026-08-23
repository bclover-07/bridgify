import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

router.use(protect);

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createOrGetConversation);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.get('/contacts', chatController.getContacts);

export default router;

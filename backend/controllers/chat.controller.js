import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export async function getConversations(req, res, next) {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name email role faculty.department student.branch student.rollNo recruiter.company')
      .sort({ lastMessageAt: -1 });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req, res, next) {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    if (!conversation.participants.some((p) => String(p) === String(req.user._id))) {
      return res.status(403).json({ error: 'Unauthorized to view this conversation' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const message = await Message.create({
      conversationId,
      senderId: req.user._id,
      content,
    });

    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name role');

    // Socket emit to room
    for (const participantId of conversation.participants) {
      req.io.to(`user:${participantId}`).emit('chat:message', populatedMessage);
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    next(error);
  }
}

export async function createOrGetConversation(req, res, next) {
  try {
    const { targetUserId } = req.body;
    const currentUserId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({ error: 'targetUserId is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    }).populate('participants', 'name email role faculty.department student.branch recruiter.company');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, targetUserId],
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name email role faculty.department student.branch recruiter.company'
      );
    }

    res.json({ conversation });
  } catch (error) {
    next(error);
  }
}

export async function getContacts(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const role = req.user.role;
    const institutionId = req.user.institutionId;

    let filter = { _id: { $ne: currentUserId }, isActive: true };

    if (role === 'student') {
      filter.role = { $in: ['faculty', 'admin', 'student'] };
    } else if (role === 'faculty') {
      filter.role = { $in: ['student', 'faculty', 'admin'] };
    }

    const contacts = await User.find(filter)
      .select('name email role faculty.department student.branch student.rollNo recruiter.company')
      .limit(30);

    res.json({ contacts });
  } catch (error) {
    next(error);
  }
}

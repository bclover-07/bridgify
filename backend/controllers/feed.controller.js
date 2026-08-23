import FeedPost from '../models/FeedPost.js';

export async function getPosts(req, res, next) {
  try {
    const { category, targetRole } = req.query;
    const filter = {};
    if (category) filter.category = category;

    // Role specific recommendation order or filtering
    let posts = await FeedPost.find(filter)
      .populate('authorId', 'name email role faculty.department student.branch recruiter.company')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({ posts });
  } catch (error) {
    next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const { title, content, category = 'tech_news', tags = [] } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await FeedPost.create({
      authorId: req.user._id,
      authorRole: req.user.role,
      title,
      content,
      category,
      tags: Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()),
    });

    const populatedPost = await FeedPost.findById(post._id).populate(
      'authorId',
      'name email role faculty.department student.branch recruiter.company'
    );

    res.status(201).json({ post: populatedPost, message: 'Post created' });
  } catch (error) {
    next(error);
  }
}

export async function toggleLike(req, res, next) {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const likedIndex = post.likes.indexOf(userId);
    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likesCount: post.likes.length, isLiked: likedIndex === -1 });
  } catch (error) {
    next(error);
  }
}

export async function addComment(req, res, next) {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const post = await FeedPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.comments.push({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      text,
      createdAt: new Date(),
    });

    await post.save();
    res.json({ comments: post.comments });
  } catch (error) {
    next(error);
  }
}

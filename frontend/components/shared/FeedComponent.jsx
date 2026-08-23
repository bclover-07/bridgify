'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiThumbsUp, FiMessageCircle, FiShare2, FiSend, FiTag, FiTrendingUp, FiPlusCircle } from 'react-icons/fi';
import NeuCard from '@/components/shared/NeuCard';
import NeuButton from '@/components/shared/NeuButton';
import NeuBadge from '@/components/shared/NeuBadge';
import api from '@/lib/api';
import useAuthStore from '@/lib/store/authStore';
import PageTransition, { StaggerItem } from '@/components/shared/PageTransition';

export default function FeedComponent({ roleTitle = 'Tech & Skill Feed', roleTheme = 'var(--electric)' }) {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('tech_news');
  const [newTags, setNewTags] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feed');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/feed', {
        title: newTitle,
        content: newContent,
        category: newCategory,
        tags: newTags ? newTags.split(',').map((t) => t.trim()) : [],
      });
      setPosts((prev) => [res.data.post, ...prev]);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/feed/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id === postId) {
            const isLiked = res.data.isLiked;
            const updatedLikes = isLiked
              ? [...p.likes, user._id]
              : p.likes.filter((id) => String(id) !== String(user._id));
            return { ...p, likes: updatedLikes };
          }
          return p;
        })
      );
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/feed/${postId}/comment`, { text: commentText });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
      );
      setCommentText('');
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'recruiter':
        return 'warning';
      case 'faculty':
        return 'info';
      case 'student':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <PageTransition className="space-y-6">
      <StaggerItem className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 mb-1">
            <FiTrendingUp style={{ color: roleTheme }} />
            {roleTitle}
          </h1>
          <p className="text-gray-500 font-medium">
            Shared professional feed across Students, Faculty, and Recruiters
          </p>
        </div>
        <NeuButton
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          icon={FiPlusCircle}
          className="shrink-0"
        >
          Create Post
        </NeuButton>
      </StaggerItem>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white border-[4px] border-[var(--ink)] rounded-3xl p-6 shadow-[8px_8px_0px_0px_var(--ink)] space-y-4"
          >
            <div className="flex justify-between items-center border-b-[3px] border-[var(--ink)] pb-3">
              <h3 className="font-bold text-xl">Create a New Post</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="font-bold text-gray-400 hover:text-black"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="form-label block mb-1">Title</label>
                <input
                  className="neu-input"
                  placeholder="Post title or topic"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label block mb-1">Category</label>
                  <select
                    className="neu-select"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="tech_news">Tech News</option>
                    <option value="skill_update">Skill Update</option>
                    <option value="hiring">Hiring / Drive</option>
                    <option value="research">Research / Notes</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="form-label block mb-1">Tags (comma separated)</label>
                  <input
                    className="neu-input"
                    placeholder="React, AI, Web3"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="form-label block mb-1">Content</label>
                <textarea
                  className="neu-input h-32 resize-none"
                  placeholder="Share insights, job opportunities, technical notes, or skill achievements..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <NeuButton variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </NeuButton>
                <NeuButton variant="primary" type="submit" loading={creating}>
                  Publish Post
                </NeuButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Feed Posts Listing */}
      <StaggerItem className="space-y-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="p-12 text-center font-bold text-gray-500">Loading feed updates...</div>
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const authorName = post.authorId?.name || 'Community Member';
            const authorRole = post.authorRole || post.authorId?.role || 'user';
            const isLiked = user && post.likes?.some((id) => String(id) === String(user._id));
            const likesCount = post.likes?.length || 0;
            const isCommenting = activeCommentPost === post._id;

            return (
              <NeuCard key={post._id} className="p-6 bg-white space-y-4">
                {/* Author Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[var(--electric)] text-white border-[2px] border-[var(--ink)] flex items-center justify-center font-bold text-base">
                      {authorName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-tight">{authorName}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString()} at{' '}
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <NeuBadge variant={getRoleBadgeVariant(authorRole)} className="capitalize font-bold">
                    {authorRole}
                  </NeuBadge>
                </div>

                {/* Post Body */}
                <div>
                  <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {post.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-bold px-2.5 py-1 bg-[var(--paper)] border-[2px] border-[var(--ink)] rounded-full text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Footer Controls */}
                <div className="flex items-center justify-between border-t-[2px] border-[var(--ink)] pt-3 text-sm">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl border-[2px] border-[var(--ink)] transition-all ${
                      isLiked ? 'bg-[var(--coral)] text-white' : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    <FiThumbsUp /> {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                  </button>

                  <button
                    onClick={() => setActiveCommentPost(isCommenting ? null : post._id)}
                    className="flex items-center gap-2 font-bold px-3 py-1.5 rounded-xl border-[2px] border-[var(--ink)] bg-white hover:bg-gray-100"
                  >
                    <FiMessageCircle /> {post.comments?.length || 0} Comments
                  </button>
                </div>

                {/* Comments Section */}
                {isCommenting && (
                  <div className="pt-3 border-t-[2px] border-dashed border-gray-300 space-y-3 bg-[var(--paper)] p-4 rounded-xl border-[2px] border-[var(--ink)]">
                    <div className="flex gap-2">
                      <input
                        className="neu-input text-sm flex-1"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                      />
                      <NeuButton variant="primary" size="sm" onClick={() => handleAddComment(post._id)} icon={FiSend}>
                        Comment
                      </NeuButton>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c, i) => (
                          <div key={i} className="p-2.5 bg-white border-[2px] border-[var(--ink)] rounded-xl text-xs">
                            <div className="flex justify-between font-bold text-gray-800 mb-1">
                              <span>
                                {c.userName} ({c.userRole})
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-gray-700">{c.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 font-bold text-center py-2">No comments yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </NeuCard>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-500 font-bold bg-white border-[3px] border-[var(--ink)] rounded-2xl">
            No posts found in global feed yet. Create the first post above!
          </div>
        )}
      </StaggerItem>
    </PageTransition>
  );
}

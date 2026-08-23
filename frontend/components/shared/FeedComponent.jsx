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
              <div key={post._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                {/* Author Info Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {authorName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">{authorName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {post.category || 'Update'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {authorRole}
                  </span>
                </div>

                {/* Post Body */}
                <div className="px-4 pb-3">
                  <h3 className="font-bold text-base text-gray-900 mb-1">{post.title}</h3>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-medium text-blue-600 hover:underline cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Footer Controls */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isLiked ? 'text-red-500' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiThumbsUp className={isLiked ? 'fill-current' : ''} size={20} /> 
                    <span>{likesCount > 0 ? likesCount : 'Like'}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPost(isCommenting ? null : post._id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <FiMessageCircle size={20} /> 
                    <span>{post.comments?.length > 0 ? post.comments.length : 'Comment'}</span>
                  </button>
                  
                  <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors ml-auto">
                    <FiShare2 size={18} />
                  </button>
                </div>

                {/* Comments Section */}
                {isCommenting && (
                  <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 space-y-3">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">
                        {user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-sm py-1.5 pr-8 transition-colors"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                        />
                        <button 
                          onClick={() => handleAddComment(post._id)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700"
                        >
                          <FiSend size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto pt-3">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c, i) => (
                          <div key={i} className="flex gap-2 group">
                            <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xs mt-0.5">
                              {c.userName?.[0] || 'U'}
                            </div>
                            <div className="flex-1 bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm border border-gray-100">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="font-bold text-xs text-gray-900">{c.userName}</span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm">{c.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
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

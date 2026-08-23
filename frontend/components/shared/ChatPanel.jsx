'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiUser, FiSearch, FiCircle } from 'react-icons/fi';
import api from '@/lib/api';
import useAuthStore from '@/lib/store/authStore';
import { getSocket } from '@/lib/socket';

export default function ChatPanel() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'contacts'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:join', user._id);
      socket.on('chat:message', (newMsg) => {
        if (activeConv && newMsg.conversationId === activeConv._id) {
          setMessages((prev) => [...prev, newMsg]);
        }
        loadConversations();
      });
    }
    return () => {
      if (socket) socket.off('chat:message');
    };
  }, [user, activeConv]);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
      loadContacts();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv._id);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadContacts = async () => {
    try {
      const res = await api.get('/chat/contacts');
      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error('Failed to load contacts:', err);
    }
  };

  const loadMessages = async (convId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/conversations/${convId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChatWithContact = async (contactId) => {
    try {
      const res = await api.post('/chat/conversations', { targetUserId: contactId });
      setActiveConv(res.data.conversation);
      setActiveTab('chats');
      loadConversations();
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConv) return;
    const text = inputText;
    setInputText('');

    try {
      const res = await api.post(`/chat/conversations/${activeConv._id}/messages`, { content: text });
      setMessages((prev) => [...prev, res.data.message]);
      loadConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find((p) => String(p._id) !== String(user?._id)) || conv.participants[0];
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--electric)] text-white border-[3px] border-[var(--ink)] shadow-[4px_4px_0px_0px_var(--ink)] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open Chat"
      >
        <FiMessageSquare size={24} />
      </button>

      {/* Sliding Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-20 right-6 z-50 w-96 h-[540px] bg-white border-[4px] border-[var(--ink)] rounded-3xl shadow-[8px_8px_0px_0px_var(--ink)] flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 bg-[var(--paper)] border-b-[3px] border-[var(--ink)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--electric)] text-white border-[2px] border-[var(--ink)] flex items-center justify-center font-bold text-xs">
                  💬
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {activeConv ? getOtherParticipant(activeConv)?.name || 'Chat' : 'Bridgify Messages'}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">
                    {activeConv ? getOtherParticipant(activeConv)?.role : 'Real-time Chat'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {activeConv && (
                  <button
                    onClick={() => setActiveConv(null)}
                    className="text-xs font-bold text-gray-500 hover:text-black mr-2"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full border-[2px] border-[var(--ink)] flex items-center justify-center hover:bg-gray-100"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            {!activeConv ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tab selector */}
                <div className="flex border-b-[2px] border-[var(--ink)] text-sm font-bold bg-[#f8f7f4]">
                  <button
                    className={`flex-1 py-2 text-center border-r-[2px] border-[var(--ink)] ${
                      activeTab === 'chats' ? 'bg-[var(--electric)] text-white' : 'text-gray-600'
                    }`}
                    onClick={() => setActiveTab('chats')}
                  >
                    Recent Chats ({conversations.length})
                  </button>
                  <button
                    className={`flex-1 py-2 text-center ${
                      activeTab === 'contacts' ? 'bg-[var(--electric)] text-white' : 'text-gray-600'
                    }`}
                    onClick={() => setActiveTab('contacts')}
                  >
                    Directory ({contacts.length})
                  </button>
                </div>

                {activeTab === 'chats' ? (
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {conversations.length > 0 ? (
                      conversations.map((conv) => {
                        const other = getOtherParticipant(conv);
                        return (
                          <div
                            key={conv._id}
                            onClick={() => setActiveConv(conv)}
                            className="p-3 border-[2px] border-[var(--ink)] rounded-xl bg-white hover:bg-[var(--paper)] cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[var(--sky)] border-[2px] border-[var(--ink)] flex items-center justify-center font-bold text-sm">
                                {other?.name?.[0] || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-sm leading-tight">{other?.name || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[170px]">
                                  {conv.lastMessage || 'Tap to chat...'}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 capitalize">
                              {other?.role}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-400 font-bold text-sm">
                        No active conversations yet.<br />Switch to Directory to start chatting!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {contacts.map((contact) => (
                      <div
                        key={contact._id}
                        onClick={() => handleStartChatWithContact(contact._id)}
                        className="p-3 border-[2px] border-[var(--ink)] rounded-xl bg-white hover:bg-[var(--paper)] cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--acid)] border-[2px] border-[var(--ink)] flex items-center justify-center font-bold text-xs">
                            {contact.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-tight">{contact.name}</p>
                            <p className="text-[10px] text-gray-500">
                              {contact.role === 'student' ? contact.student?.branch : contact.role === 'faculty' ? contact.faculty?.department : contact.email}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--electric)] text-white capitalize">
                          {contact.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Active Chat Message View */
              <div className="flex-1 flex flex-col overflow-hidden bg-[var(--paper)]">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-xs font-bold text-gray-400">Loading messages...</div>
                  ) : messages.length > 0 ? (
                    messages.map((msg, i) => {
                      const isMe = String(msg.senderId?._id || msg.senderId) === String(user._id);
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl border-[2px] border-[var(--ink)] text-sm font-medium ${
                              isMe ? 'bg-[var(--electric)] text-white rounded-br-none' : 'bg-white rounded-bl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap leading-snug">{msg.content}</p>
                            <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400 font-bold">
                      Say hello to start the conversation!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-2 bg-white border-t-[3px] border-[var(--ink)] flex items-center gap-2">
                  <input
                    className="neu-input flex-1 py-2 px-3 text-sm"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <NeuButton variant="primary" size="sm" onClick={handleSendMessage} icon={FiSend}>
                    Send
                  </NeuButton>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

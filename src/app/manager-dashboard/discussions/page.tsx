'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Plus,
  X,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { ManagerDashboardLayout } from '@/components/dashboard/ManagerDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  riskLevel: 'green' | 'yellow' | 'red';
}

interface Discussion {
  id: string;
  title: string;
  status: string;
  priority: string;
  member: {
    id: string;
    name: string;
    email: string;
  };
  messages: Array<{
    id: string;
    content: string;
    isManagerMessage: boolean;
    createdAt: string;
  }>;
  _count?: {
    messages: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ManagerDiscussionsPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // New discussion form
  const [selectedMember, setSelectedMember] = useState('');
  const [discussionTitle, setDiscussionTitle] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, discussionsRes] = await Promise.all([
          fetch('/api/manager/team'),
          fetch('/api/manager/discussions'),
        ]);

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setMembers(teamData.team.members);
        }

        if (discussionsRes.ok) {
          const discussionsData = await discussionsRes.json();
          setDiscussions(discussionsData.discussions);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateDiscussion = async () => {
    if (!selectedMember || !discussionTitle || !initialMessage) return;

    try {
      const res = await fetch('/api/manager/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMember,
          title: discussionTitle,
          message: initialMessage,
          priority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiscussions([data.discussion, ...discussions]);
        setShowNewDiscussion(false);
        setSelectedMember('');
        setDiscussionTitle('');
        setInitialMessage('');
        setPriority('normal');
      }
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleSelectDiscussion = async (discussion: Discussion) => {
    try {
      const res = await fetch(`/api/manager/discussions?discussionId=${discussion.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDiscussion(data.discussion);
      }
    } catch (error) {
      console.error('Error fetching discussion:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDiscussion) return;

    setIsSending(true);
    try {
      await fetch('/api/manager/discussions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discussionId: selectedDiscussion.id,
          message: newMessage,
          markAsRead: true,
        }),
      });

      // Refresh discussion
      const res = await fetch(`/api/manager/discussions?discussionId=${selectedDiscussion.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedDiscussion(data.discussion);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <ManagerDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-purple-500/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </ManagerDashboardLayout>
    );
  }

  return (
    <ManagerDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Discussions</h1>
              <p className="text-sm text-muted-foreground">Communicate with your team members</p>
            </div>
          </div>
          <Button onClick={() => setShowNewDiscussion(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Discussion
          </Button>
        </div>

        {/* New Discussion Modal */}
        {showNewDiscussion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Start a Discussion</h2>
                <button onClick={() => setShowNewDiscussion(false)} className="p-2 rounded-lg hover:bg-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Team Member</label>
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 outline-none"
                  >
                    <option value="">Select a team member...</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
                  <input
                    type="text"
                    value={discussionTitle}
                    onChange={(e) => setDiscussionTitle(e.target.value)}
                    placeholder="Discussion title..."
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Priority</label>
                  <div className="flex gap-2">
                    {['low', 'normal', 'high', 'urgent'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                          priority === p
                            ? p === 'urgent' ? 'bg-red-500 text-white' :
                              p === 'high' ? 'bg-amber-500 text-white' :
                              p === 'low' ? 'bg-gray-500 text-white' :
                              'bg-primary text-white'
                            : 'bg-secondary/50 text-muted-foreground'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <textarea
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={() => setShowNewDiscussion(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreateDiscussion} className="flex-1" disabled={!selectedMember || !discussionTitle || !initialMessage}>
                    Start Discussion
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Discussion View */}
        {selectedDiscussion ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl border border-border/50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedDiscussion.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    with {selectedDiscussion.member.name}
                  </p>
                </div>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium',
                selectedDiscussion.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                selectedDiscussion.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                'bg-gray-500/10 text-gray-500'
              )}>
                {selectedDiscussion.status}
              </span>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {selectedDiscussion.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.isManagerMessage ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.isManagerMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 border border-border/50'
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <p className={cn(
                      'text-xs mt-1',
                      message.isManagerMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 outline-none"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Discussion List */
          <div className="space-y-4">
            {discussions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-2">No discussions yet</p>
                <p className="text-sm text-muted-foreground mb-4">Start a discussion with a team member to communicate and track actions.</p>
                <Button onClick={() => setShowNewDiscussion(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Start Discussion
                </Button>
              </div>
            ) : (
              discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSelectDiscussion(discussion)}
                  className="glass rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {discussion.member.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{discussion.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          with {discussion.member.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        discussion.status === 'open' ? 'bg-blue-500/10 text-blue-500' :
                        discussion.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                        'bg-gray-500/10 text-gray-500'
                      )}>
                        {discussion.status}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        discussion.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                        discussion.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                        'text-muted-foreground'
                      )}>
                        {discussion.priority}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </ManagerDashboardLayout>
  );
}

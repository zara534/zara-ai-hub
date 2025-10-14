import React, { useState, useEffect } from 'react';
import { useAI } from '../contexts/AIContext';
import Card from '../ui/Card';
import { fonts } from '../contexts/ThemeContext';
import Button from '../ui/Button';
import { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  announcementId: string;
  onReply: (parentId: string) => void;
  activeReplyId: string | null;
  onCancelReply: () => void;
  onReplySubmit: (text: string, parentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, announcementId, onReply, activeReplyId, onCancelReply, onReplySubmit }) => {
  const { user } = useAI();
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onReplySubmit(replyText, comment.id);
      setReplyText('');
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0 text-sm">
        {comment.username.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="bg-surface p-3 rounded-lg border border-border-color">
            <p className="font-semibold text-text-primary text-sm">
              {comment.username}
              {comment.is_admin_post && <span className="text-xs font-semibold bg-accent text-background px-1.5 py-0.5 rounded ml-2">Admin</span>}
              <span className="text-xs text-text-secondary font-normal ml-2">{new Date(comment.created_at).toLocaleDateString()}</span>
            </p>
            <p className="text-text-primary mt-1">{comment.text}</p>
        </div>
        
        {user && (
          <button onClick={() => onReply(comment.id)} className="text-xs text-primary font-bold mt-1 ml-2">
            {activeReplyId === comment.id ? 'Cancel' : 'Reply'}
          </button>
        )}

        {activeReplyId === comment.id && (
          <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Replying to ${comment.username}...`}
              className="flex-grow w-full px-3 py-1.5 bg-background border border-border-color rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-text-primary text-sm"
              autoFocus
              onBlur={() => {
                  if (!replyText) onCancelReply();
              }}
            />
            <Button type="submit" className="!py-1.5 !px-3 text-sm" disabled={!replyText.trim()}>Post</Button>
          </form>
        )}

        <div className="mt-3 space-y-3 pl-4 border-l-2 border-border-color/50">
          {(comment.replies || []).map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              announcementId={announcementId}
              onReply={onReply}
              activeReplyId={activeReplyId}
              onCancelReply={onCancelReply}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


const AnnouncementsPage: React.FC = () => {
  const { announcements, user, toggleAnnouncementLike, addCommentToAnnouncement, addReplyToComment, markAnnouncementsAsSeen } = useAI();
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  
  useEffect(() => {
    markAnnouncementsAsSeen();
  }, [markAnnouncementsAsSeen]);
  
  const sortedAnnouncements = [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCommentChange = (announcementId: string, value: string) => {
    setCommentInputs(prev => ({ ...prev, [announcementId]: value }));
  };

  const handleCommentSubmit = (e: React.FormEvent, announcementId: string) => {
    e.preventDefault();
    const text = commentInputs[announcementId];
    if (text && text.trim() && user) {
      addCommentToAnnouncement(announcementId, user.id, user.user_metadata?.username || 'Anonymous', text);
      handleCommentChange(announcementId, '');
    }
  };
  
  const handleReplySubmit = (text: string, parentId: string, announcementId: string) => {
    if (user) {
      addReplyToComment(announcementId, parentId, user.id, user.user_metadata?.username || 'Anonymous', text);
      setActiveReplyId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-primary">Announcement History</h1>
            <p className="mt-2 text-lg text-text-secondary">Stay up-to-date with the latest news and features from ZARA AI HUB.</p>
        </div>
        
        {sortedAnnouncements.length > 0 ? (
            <div className="space-y-8">
            {sortedAnnouncements.map(announcement => {
                const selectedFont = fonts[announcement.fontFamily as keyof typeof fonts] || fonts.inter;
                const userHasLiked = user && announcement.likes?.includes(user.id);

                return (
                <Card 
                    key={announcement.id} 
                    className="p-0 overflow-hidden"
                    style={{ fontFamily: selectedFont.family }}
                >
                    <div className="p-6">
                    <p className="text-sm text-text-secondary mb-2">
                        {new Date(announcement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        })}
                    </p>
                    <h2 className="text-2xl font-bold text-text-primary mb-3">{announcement.title}</h2>
                    <p className="text-text-secondary whitespace-pre-wrap">{announcement.message}</p>
                    </div>
                    
                    <div className="bg-surface/50 px-6 py-4 border-t border-border-color space-y-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => user && toggleAnnouncementLike(announcement.id, user.id)}
                                className={`flex items-center gap-2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                disabled={!user}
                                aria-label={userHasLiked ? 'Unlike announcement' : 'Like announcement'}
                            >
                                {userHasLiked ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                )}
                                <span>{announcement.likes?.length || 0} Likes</span>
                            </button>
                            <div className="flex items-center gap-2 text-text-secondary">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              <span>{announcement.comments?.length || 0} Comments</span>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {(announcement.comments || []).map(comment => (
                              <div key={comment.id} className="pt-3">
                                  <CommentItem
                                    comment={comment}
                                    announcementId={announcement.id}
                                    onReply={(commentId) => setActiveReplyId(activeReplyId === commentId ? null : commentId)}
                                    activeReplyId={activeReplyId}
                                    onCancelReply={() => setActiveReplyId(null)}
                                    onReplySubmit={(text, parentId) => handleReplySubmit(text, parentId, announcement.id)}
                                  />
                              </div>
                            ))}
                        </div>

                        {user && (
                          <form onSubmit={(e) => handleCommentSubmit(e, announcement.id)} className="pt-4 border-t border-border-color flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                    {user.user_metadata?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                              </div>
                            <div className="flex-1">
                                <textarea
                                  value={commentInputs[announcement.id] || ''} 
                                  onChange={(e) => handleCommentChange(announcement.id, e.target.value)}
                                  placeholder="Add a comment..."
                                  rows={2}
                                  className="block w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-text-primary text-sm"
                                />
                                <div className="text-right mt-2">
                                    <Button type="submit" disabled={!commentInputs[announcement.id]?.trim()} className="!py-1.5 !px-4 text-sm">
                                      Post Comment
                                    </Button>
                                </div>
                            </div>
                          </form>
                        )}
                    </div>
                </Card>
                )
            })}
            </div>
        ) : (
            <div className="text-center py-16">
            <p className="text-text-secondary">No announcements have been posted yet.</p>
            </div>
        )}
        </div>
    </div>
  );
};

export default AnnouncementsPage;
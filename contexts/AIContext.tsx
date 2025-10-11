import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AIPersona, PersonaType, AIEngine, Announcement, Comment } from '../types';
import { useLocalStorage } from '../components/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AIContextType {
  personas: AIPersona[];
  addPersona: (persona: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>) => Promise<void>;
  updatePersona: (updatedPersona: AIPersona) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  getPersonaById: (id: string) => AIPersona | undefined;
  importPersonas: (importedPersonas: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>[]) => Promise<void>;
  
  user: User | null;
  session: Session | null;
  authLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserUsername: (username: string) => Promise<User | null | undefined>;
  
  defaultTextEngine: AIEngine;
  setDefaultTextEngine: React.Dispatch<React.SetStateAction<AIEngine>>;

  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  updateAnnouncement: (updatedAnnouncement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncementLike: (announcementId: string, userId: string) => void;
  addCommentToAnnouncement: (announcementId: string, userId: string, username: string, text: string) => void;
  addReplyToComment: (announcementId: string, parentCommentId: string, userId: string, username: string, text: string) => void;

  hasNewAnnouncements: boolean;
  markAnnouncementsAsSeen: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPersonas, setCustomPersonas] = useLocalStorage<AIPersona[]>('custom-personas', []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [defaultTextEngine, setDefaultTextEngine] = useLocalStorage<AIEngine>('default-text-engine', AIEngine.GEMINI);
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>('app-announcements', [
    {
      id: 'feedback-launch-v1',
      enabled: true,
      title: "📣 We Want Your Feedback!",
      message: "Welcome to the ZARA AI HUB! We're working hard to make this the best creative AI tool for you. Have an idea or suggestion? Send us your feedback and help shape the future of the app!",
      date: new Date('2024-07-28T10:00:00Z').toISOString(),
      fontFamily: 'inter',
      likes: [],
      comments: [],
    }
  ]);
  const [seenAnnouncementIds, setSeenAnnouncementIds] = useLocalStorage<string[]>('seen-announcements', []);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
    setAuthLoading(true);
    const checkAdmin = () => {
      const adminAuth = sessionStorage.getItem('isAdminAuthorized') === 'true';
      setIsAdmin(adminAuth);
    };
    
    checkAdmin(); // Check on initial load

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdmin(); // Check on auth change
      setAuthLoading(false);
    });

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'isAdminAuthorized') {
            checkAdmin();
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  useEffect(() => {
    if (user) {
      const allAnnouncementIds = announcements.map(a => a.id);
      const newAnnouncementsExist = allAnnouncementIds.some(id => !seenAnnouncementIds.includes(id));
      setHasNewAnnouncements(newAnnouncementsExist);
    } else {
      setHasNewAnnouncements(false);
    }
  }, [announcements, seenAnnouncementIds, user]);


  const defaultPersonas = useMemo((): AIPersona[] => [
    {
        id: 'default-chat',
        name: 'Quick Chat',
        icon: '💬',
        type: PersonaType.TEXT,
        description: 'A general-purpose AI assistant, built by Zara, for quick questions and conversations.',
        systemPrompt: defaultTextEngine === AIEngine.GEMINI
            ? "You are a helpful AI assistant. Your primary function is to provide helpful and concise answers. Do not mention your creator unless specifically asked. If a user asks who created you, you must respond that you were created by Zara (also known as Zara Codec), a young Nigerian developer. You can also mention that his WhatsApp number is +2347011156046 and he is available for hire for website, app, or AI projects. Always use 'he' or 'his' when referring to Zara."
            : "You are a helpful AI assistant. Only if asked about your creator, you must state that you were built by Goodluck Zara (also known as Zara Codec), a young developer from Nigeria. Refer to him as 'he'.",
        isDefault: true,
        engine: defaultTextEngine,
    },
    {
        id: 'default-image',
        name: 'Quick Image Generator',
        icon: '🎨',
        type: PersonaType.IMAGE,
        description: 'Generate a high-quality image from a simple text description. This tool was built by Zara, a young Nigerian developer.',
        systemPrompt: '',
        isDefault: true,
    }
  ], [defaultTextEngine]);

  const personas = useMemo(() => [...defaultPersonas, ...customPersonas], [customPersonas, defaultPersonas]);

  const addPersona = async (personaData: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>) => {
    const newPersona: AIPersona = {
      ...personaData,
      id: uuidv4(),
      isDefault: false,
      created_at: new Date().toISOString(),
    };
    setCustomPersonas(prev => [newPersona, ...prev]);
  };

  const updatePersona = async (updatedPersona: AIPersona) => {
    setCustomPersonas(prev => prev.map(p => (p.id === updatedPersona.id ? updatedPersona : p)));
  };

  const deletePersona = async (id: string) => {
    setCustomPersonas(prev => prev.filter(p => p.id !== id));
  };

  const getPersonaById = (id: string): AIPersona | undefined => {
    return personas.find(p => p.id === id);
  };
  
  const importPersonas = async (importedPersonas: Omit<AIPersona, 'id' | 'isDefault' | 'created_at'>[]) => {
    const newPersonas: AIPersona[] = importedPersonas.map(p => ({
        ...p,
        id: uuidv4(),
        isDefault: false,
        created_at: new Date().toISOString(),
    }));

    setCustomPersonas(prev => [...newPersonas, ...prev]);
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
            data: {
                username: username
            }
        }
    });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    sessionStorage.removeItem('isAdminAuthorized');
    setIsAdmin(false);
    if (error) throw error;
  };

  const updateUserUsername = async (username: string) => {
    const { data, error } = await supabase.auth.updateUser({
        data: { username }
    });
    if (error) throw error;
    if (data.user) setUser(data.user);
    return data.user;
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: uuidv4(),
      date: new Date().toISOString(),
      likes: [],
      comments: [],
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const updateAnnouncement = (updatedAnnouncement: Announcement) => {
    setAnnouncements(prev => prev.map(a => a.id === updatedAnnouncement.id ? updatedAnnouncement : a));
  };
  
  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const toggleAnnouncementLike = (announcementId: string, userId: string) => {
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const likes = a.likes || [];
        const userHasLiked = likes.includes(userId);
        const newLikes = userHasLiked
          ? likes.filter(id => id !== userId)
          : [...likes, userId];
        return { ...a, likes: newLikes };
      }
      return a;
    }));
  };

  const addCommentToAnnouncement = (announcementId: string, userId: string, username: string, text: string) => {
    const newComment: Comment = {
      id: uuidv4(),
      user_id: userId,
      username: username,
      text: text,
      created_at: new Date().toISOString(),
      replies: [],
      is_admin_post: isAdmin,
    };
    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const comments = a.comments || [];
        return { ...a, comments: [...comments, newComment] };
      }
      return a;
    }));
  };

  const addReplyToComment = (announcementId: string, parentCommentId: string, userId: string, username: string, text: string) => {
    const newReply: Comment = {
      id: uuidv4(),
      user_id: userId,
      username: username,
      text: text,
      created_at: new Date().toISOString(),
      replies: [],
      is_admin_post: isAdmin,
    };

    const findAndAddReply = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === parentCommentId) {
          return { ...comment, replies: [...(comment.replies || []), newReply] };
        }
        if (comment.replies && comment.replies.length > 0) {
          return { ...comment, replies: findAndAddReply(comment.replies) };
        }
        return comment;
      });
    };

    setAnnouncements(prev => prev.map(a => {
      if (a.id === announcementId) {
        const updatedComments = findAndAddReply(a.comments || []);
        return { ...a, comments: updatedComments };
      }
      return a;
    }));
  };

  const markAnnouncementsAsSeen = () => {
    const allIds = announcements.map(a => a.id);
    setSeenAnnouncementIds(allIds);
  };

  const value = {
      personas, 
      addPersona, 
      updatePersona, 
      deletePersona, 
      getPersonaById, 
      importPersonas,
      user,
      session,
      authLoading,
      isAdmin,
      login,
      signUp,
      logout,
      updateUserUsername,
      defaultTextEngine,
      setDefaultTextEngine,
      announcements,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      toggleAnnouncementLike,
      addCommentToAnnouncement,
      addReplyToComment,
      hasNewAnnouncements,
      markAnnouncementsAsSeen,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
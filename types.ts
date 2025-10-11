export enum PersonaType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export enum AIEngine {
  POLLINATIONS = 'POLLINATIONS',
  GEMINI = 'GEMINI',
}

export interface AIPersona {
  id: string;
  created_at?: string;
  name: string;
  icon?: string; // Emoji icon for the persona
  type: PersonaType;
  description: string;
  systemPrompt: string; // The behavior description
  isDefault?: boolean;
  engine?: AIEngine; // For text personas
  model?: string; // For image personas
  supportsImageUpload?: boolean; // For Gemini text personas
}

export interface ChatMessage {
  id?: string;
  created_at?: string;
  sender: 'user' | 'ai';
  text: string;
  persona_id?: string;
  user_id?: string;
  imageUrl?: string; // For displaying user-uploaded images in chat
}

export interface Comment {
  id: string;
  user_id: string;
  username: string;
  text: string;
  created_at: string;
  replies: Comment[];
  is_admin_post?: boolean;
}

export interface Announcement {
  id: string;
  enabled: boolean;
  title: string;
  message: string;
  date: string;
  actionText?: string;
  actionLink?: string;
  fontFamily?: string;
  likes?: string[]; // Array of user IDs
  comments?: Comment[];
}

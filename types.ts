export enum PersonaType {
  IMAGE = 'IMAGE',
}

export interface AIPersona {
  id: string;
  created_at?: string;
  name: string;
  icon?: string; // Emoji icon for the persona
  type: PersonaType;
  description: string;
  systemPrompt: string; // The behavior description
  examplePrompt?: string; // Add example prompt for user guidance
  isDefault?: boolean;
  model?: string; // For image personas
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
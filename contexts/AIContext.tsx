import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { AIPersona, PersonaType, Announcement, Comment } from '../types';
import { useLocalStorage } from '../components/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

// Define the admin email address in a constant for clarity and easy maintenance.
const ADMIN_EMAIL = 'admin@zaraaihub.com';

const initialCustomPersonas: AIPersona[] = [
    { id: 'logo-designer-v1', name: 'Logo Designer', icon: '✨', type: PersonaType.IMAGE, description: 'Generates clean, modern, and minimalist logos for businesses and projects.', systemPrompt: 'minimalist logo, vector, flat design, professional', examplePrompt: 'A minimalist logo for a coffee shop named "The Daily Grind"', isDefault: false, model: 'flux' },
    { id: 'character-artist-v1', name: 'Character Concept Artist', icon: '👤', type: PersonaType.IMAGE, description: 'Creates detailed character concepts for games, stories, and animations.', systemPrompt: 'character concept art, detailed, full body, fantasy, cinematic lighting', examplePrompt: 'Concept art of a stoic elven ranger with a bow and arrow', isDefault: false, model: 'flux' },
    { id: 'architect-viz-v1', name: 'Architectural Visualizer', icon: '🏢', type: PersonaType.IMAGE, description: 'Produces photorealistic visualizations of architectural designs and interiors.', systemPrompt: 'architectural rendering, photorealistic, modern architecture, interior design, 8k', examplePrompt: 'Photorealistic rendering of a modern glass house in a forest', isDefault: false, model: 'flux' },
    { id: 'food-photo-v1', name: 'Food Photographer', icon: '🍔', type: PersonaType.IMAGE, description: 'Creates delicious-looking, high-quality photos of various food items.', systemPrompt: 'food photography, delicious, vibrant colors, detailed, professional lighting', examplePrompt: 'A gourmet burger with melted cheese and fresh toppings, studio lighting', isDefault: false, model: 'flux' },
    { id: 'fantasy-painter-v1', name: 'Fantasy Landscape Painter', icon: '🏞️', type: PersonaType.IMAGE, description: 'Paints breathtaking, epic fantasy landscapes with magical elements.', systemPrompt: 'fantasy landscape, epic, matte painting, breathtaking, detailed, magical', examplePrompt: 'An epic painting of a dragon flying over a medieval castle', isDefault: false, model: 'flux' },
    { id: 'tshirt-designer-v1', name: 'T-shirt Graphic Designer', icon: '👕', type: PersonaType.IMAGE, description: 'Designs unique and trendy graphics suitable for T-shirt printing.', systemPrompt: 't-shirt graphic design, vector art, clean, bold, trending', examplePrompt: 'A retro graphic of a cassette tape with the text "Sounds of the 80s"', isDefault: false, model: 'flux' },
    { id: 'vintage-poster-v1', name: 'Vintage Poster Creator', icon: '📜', type: PersonaType.IMAGE, description: 'Generates posters with a retro or vintage aesthetic from the 20th century.', systemPrompt: 'vintage poster, retro style, 1960s, textured, graphic design', examplePrompt: 'A travel poster for Paris in the style of the 1920s', isDefault: false, model: 'flux' },
    { id: '3d-modeler-v1', name: '3D Modeler', icon: '🧊', type: PersonaType.IMAGE, description: 'Renders high-quality 3D models of objects and scenes.', systemPrompt: '3d render, octane render, high detail, 4k, cinematic', examplePrompt: 'High-detail 3D render of a futuristic sci-fi helmet', isDefault: false, model: 'flux' },
    { id: 'abstract-art-v1', name: 'Abstract Art Generator', icon: '🌀', type: PersonaType.IMAGE, description: 'Creates unique and colorful abstract art pieces in various styles.', systemPrompt: 'abstract art, colorful, vibrant, modern, masterpiece', examplePrompt: 'A vibrant and chaotic explosion of colors, digital abstract art', isDefault: false, model: 'flux' },
    { id: 'storybook-illustrator-v1', name: 'Storybook Illustrator', icon: '🖍️', type: PersonaType.IMAGE, description: 'Illustrates charming and whimsical scenes for children\'s books.', systemPrompt: 'children\'s book illustration, whimsical, charming, colorful, watercolor style', examplePrompt: 'A charming watercolor illustration of a fox reading a book under a tree', isDefault: false, model: 'flux' },
    { id: 'comic-book-artist-v1', name: 'Comic Book Artist', icon: '💥', type: PersonaType.IMAGE, description: 'Creates dynamic comic book style panels and characters.', systemPrompt: 'comic book style, dynamic action, bold lines, vibrant colors, halftone dots', examplePrompt: 'A dynamic comic book panel of a superhero landing in a city street', isDefault: false, model: 'flux' },
    { id: 'pixel-artist-v1', name: 'Pixel Artist', icon: '👾', type: PersonaType.IMAGE, description: 'Generates retro pixel art sprites, characters, and scenes.', systemPrompt: 'pixel art, 16-bit, retro gaming, sprite sheet', examplePrompt: 'A 16-bit pixel art scene of a knight fighting a slime in a dungeon', isDefault: false, model: 'flux' },
    { id: 'tattoo-designer-v1', name: 'Tattoo Designer', icon: '✒️', type: PersonaType.IMAGE, description: 'Designs unique tattoo concepts in various styles like traditional, watercolor, or geometric.', systemPrompt: 'tattoo design, line art, black and white, flash sheet style', examplePrompt: 'A black and white tattoo design of a wolf howling at the moon, geometric style', isDefault: false, model: 'flux' },
    { id: 'product-photographer-v1', name: 'Product Photographer', icon: '🛍️', type: PersonaType.IMAGE, description: 'Creates clean, professional product shots for e-commerce and advertising.', systemPrompt: 'product photography, clean background, studio lighting, commercial, 4k', examplePrompt: 'A clean product shot of a luxury watch on a dark background', isDefault: false, model: 'flux' },
    { id: 'watercolor-painter-v1', name: 'Watercolor Painter', icon: '🎨', type: PersonaType.IMAGE, description: 'Paints delicate and beautiful scenes with a watercolor aesthetic.', systemPrompt: 'watercolor painting, soft edges, vibrant washes, paper texture', examplePrompt: 'A delicate watercolor painting of a bouquet of wildflowers', isDefault: false, model: 'flux' },
    { id: 'album-cover-artist-v1', name: 'Album Cover Artist', icon: '💿', type: PersonaType.IMAGE, description: 'Designs striking and memorable album covers for musicians.', systemPrompt: 'album cover art, psychedelic, minimalist, typography, iconic', examplePrompt: 'A surreal and psychedelic album cover for an indie rock band', isDefault: false, model: 'flux' },
    { id: 'fashion-designer-v1', name: 'Fashion Designer', icon: '👗', type: PersonaType.IMAGE, description: 'Sketches new fashion concepts and clothing designs.', systemPrompt: 'fashion design sketch, runway model, haute couture, detailed fabric', examplePrompt: 'A fashion sketch of an elegant evening gown with intricate details', isDefault: false, model: 'flux' },
    { id: 'cyberpunk-city-v1', name: 'Cyberpunk Cityscaper', icon: '🏙️', type: PersonaType.IMAGE, description: 'Generates neon-drenched, futuristic cyberpunk cityscapes.', systemPrompt: 'cyberpunk city, neon lights, rainy, futuristic, dystopian, blade runner style', examplePrompt: 'A rainy cyberpunk city street with glowing neon signs and flying vehicles', isDefault: false, model: 'flux' },
    { id: 'interior-designer-v1', name: 'Interior Designer', icon: '🛋️', type: PersonaType.IMAGE, description: 'Visualizes interior design concepts for homes and offices.', systemPrompt: 'interior design, modern, cozy, scandinavian style, realistic render', examplePrompt: 'A cozy living room with a fireplace and Scandinavian furniture', isDefault: false, model: 'flux' },
    { id: 'wildlife-photographer-v1', name: 'Wildlife Photographer', icon: '🦁', type: PersonaType.IMAGE, description: 'Captures stunning, high-detail photos of animals in their natural habitat.', systemPrompt: 'wildlife photography, national geographic, tack sharp, natural lighting', examplePrompt: 'A sharp, detailed photograph of a snow leopard on a rocky cliff', isDefault: false, model: 'flux' },
    { id: 'horror-artist-v1', name: 'Horror Artist', icon: '👻', type: PersonaType.IMAGE, description: 'Creates chilling and atmospheric horror scenes and creatures.', systemPrompt: 'horror, dark, atmospheric, creepy, lovecraftian, cinematic lighting', examplePrompt: 'A creature from the deep sea emerging from foggy waters, lovecraftian horror', isDefault: false, model: 'flux' },
    { id: 'sticker-designer-v1', name: 'Sticker Designer', icon: '🏷️', type: PersonaType.IMAGE, description: 'Designs cute and cool die-cut stickers.', systemPrompt: 'die-cut sticker design, vector, cute, chibi, pop culture', examplePrompt: 'A cute die-cut sticker of a cartoon avocado doing yoga', isDefault: false, model: 'flux' },
    { id: 'blueprint-drafter-v1', name: 'Blueprint Drafter', icon: '📐', type: PersonaType.IMAGE, description: 'Creates technical blueprint drawings of machines, buildings, or vehicles.', systemPrompt: 'blueprint, technical drawing, schematic, detailed, white on blue', examplePrompt: 'A detailed blueprint of a classic muscle car', isDefault: false, model: 'flux' },
    { id: 'food-illustrator-v1', name: 'Food Illustrator', icon: '🍰', type: PersonaType.IMAGE, description: 'Creates stylized and appetizing illustrations of food.', systemPrompt: 'food illustration, stylized, flat design, vibrant colors, recipe book style', examplePrompt: 'A stylized illustration of a slice of cherry pie for a recipe book', isDefault: false, model: 'flux' },
    { id: 'steampunk-inventor-v1', name: 'Steampunk Inventor', icon: '⚙️', type: PersonaType.IMAGE, description: 'Designs intricate steampunk gadgets, vehicles, and characters.', systemPrompt: 'steampunk, intricate gears, brass and copper, victorian style, detailed', examplePrompt: 'A complex steampunk-style mechanical owl with glowing eyes', isDefault: false, model: 'flux' },
    { id: 'mythical-creature-v1', name: 'Mythical Creature Creator', icon: '🐉', type: PersonaType.IMAGE, description: 'Brings mythical creatures from legends and folklore to life.', systemPrompt: 'mythical creature, legendary, fantasy art, detailed, powerful stance', examplePrompt: 'A majestic phoenix with fiery wings rising from ashes', isDefault: false, model: 'flux' },
    { id: 'isometric-diorama-v1', name: 'Isometric Diorama Builder', icon: '🗺️', type: PersonaType.IMAGE, description: 'Creates charming isometric 3D dioramas of rooms and landscapes.', systemPrompt: 'isometric diorama, cute, low poly, 3d render, detailed miniature', examplePrompt: 'A cute low-poly isometric diorama of a video game developer\'s room', isDefault: false, model: 'flux' },
    { id: 'coloring-book-v1', name: 'Coloring Book Creator', icon: '📖', type: PersonaType.IMAGE, description: 'Generates detailed coloring book pages for adults and children.', systemPrompt: 'coloring book page, intricate patterns, clean line art, black and white', examplePrompt: 'An intricate mandala coloring book page with floral patterns', isDefault: false, model: 'flux' },
    { id: 'car-designer-v1', name: 'Automotive Designer', icon: '🏎️', type: PersonaType.IMAGE, description: 'Sketches and renders concept cars and vehicles.', systemPrompt: 'concept car design, automotive sketch, futuristic, aerodynamic, studio render', examplePrompt: 'A sleek concept sketch of an electric sports car of the future', isDefault: false, model: 'flux' },
    { id: 'jewellery-designer-v1', name: 'Jewellery Designer', icon: '💍', type: PersonaType.IMAGE, description: 'Creates designs for intricate and beautiful pieces of jewellery.', systemPrompt: 'jewellery design, photorealistic, diamonds and gold, intricate details, macro shot', examplePrompt: 'A photorealistic render of an emerald and diamond necklace', isDefault: false, model: 'flux' },
    { id: 'pattern-generator-v1', name: 'Pattern Generator', icon: '🌿', type: PersonaType.IMAGE, description: 'Generates seamless, tileable patterns for fabrics and backgrounds.', systemPrompt: 'seamless pattern, tileable, floral, geometric, vector art', examplePrompt: 'A seamless pattern of tropical leaves and flowers, vector style', isDefault: false, model: 'flux' },
    { id: 'ui-mockup-generator-v1', name: 'UI Mockup Generator', icon: '📱', type: PersonaType.IMAGE, description: 'Creates mockups of user interfaces for mobile apps and websites.', systemPrompt: 'ui design, mobile app, website mockup, clean, modern, figma style', examplePrompt: 'A clean mockup of a mobile banking app homescreen', isDefault: false, model: 'flux' },
    { id: 'infographic-designer-v1', name: 'Infographic Designer', icon: '📊', type: PersonaType.IMAGE, description: 'Designs clear and visually appealing infographics.', systemPrompt: 'infographic design, vector, flat icons, data visualization, clean layout', examplePrompt: 'An infographic about the benefits of drinking water with flat icons', isDefault: false, model: 'flux' },
    { id: 'drone-shot-creator-v1', name: 'Drone Shot Creator', icon: '🚁', type: PersonaType.IMAGE, description: 'Generates epic aerial drone shots of landscapes and cities.', systemPrompt: 'aerial drone shot, top-down view, 4k, epic landscape, coastline, cinematic', examplePrompt: 'An epic aerial drone shot of a tropical beach with turquoise water', isDefault: false, model: 'flux' },
    { id: 'mecha-designer-v1', name: 'Mecha Designer', icon: '🤖', type: PersonaType.IMAGE, description: 'Designs powerful and detailed giant robots (Mecha).', systemPrompt: 'mecha, giant robot, detailed, sci-fi, gundam style, powerful', examplePrompt: 'A giant, heavily-armed mecha robot standing in a destroyed city', isDefault: false, model: 'flux' },
    { id: 'stained-glass-v1', name: 'Stained Glass Artist', icon: '💠', type: PersonaType.IMAGE, description: 'Creates images with the look of stained glass windows.', systemPrompt: 'stained glass window, intricate, vibrant colors, bold black lines, backlit', examplePrompt: 'A beautiful stained glass window depicting a forest scene at sunset', isDefault: false, model: 'flux' },
    { id: 'oil-painter-v1', name: 'Oil Painter', icon: '🖼️', type: PersonaType.IMAGE, description: 'Creates images with a classic oil painting texture and style.', systemPrompt: 'oil painting, thick brush strokes, textured canvas, classic art, masterpiece', examplePrompt: 'A classic oil painting of a stormy sea with a lighthouse', isDefault: false, model: 'flux' },
    { id: 'manga-artist-v1', name: 'Manga Artist', icon: '🎌', type: PersonaType.IMAGE, description: 'Creates black and white manga panels and characters.', systemPrompt: 'manga panel, black and white, screentones, dynamic, shonen style', examplePrompt: 'A black and white manga panel of two characters having an emotional conversation', isDefault: false, model: 'flux' },
    { id: 'voxel-artist-v1', name: 'Voxel Artist', icon: '🧱', type: PersonaType.IMAGE, description: 'Builds scenes and objects out of 3D cubes (voxels).', systemPrompt: 'voxel art, 3d pixels, cute, vibrant colors, isometric, magicavoxel', examplePrompt: 'Voxel art of a small, cozy cabin in a snowy forest', isDefault: false, model: 'flux' },
    { id: 'greeting-card-v1', name: 'Greeting Card Illustrator', icon: '💌', type: PersonaType.IMAGE, description: 'Designs charming illustrations for greeting cards.', systemPrompt: 'greeting card illustration, cute, whimsical, holiday theme, watercolor style', examplePrompt: 'A cute watercolor illustration of a bear holding a birthday cake', isDefault: false, model: 'flux' }
];

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
  login: (email: string, password: string) => Promise<{ user: User; session: Session; }>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserUsername: (username: string) => Promise<User | null | undefined>;
  updateUserPassword: (password: string) => Promise<User | null | undefined>;
  
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  updateAnnouncement: (updatedAnnouncement: Announcement) => void;
  deleteAnnouncement: (id: string) => void;
  toggleAnnouncementLike: (announcementId: string, userId: string) => void;
  addCommentToAnnouncement: (announcementId: string, userId: string, username: string, text: string) => void;
  addReplyToComment: (announcementId: string, parentCommentId: string, userId: string, username: string, text: string) => void;

  hasNewAnnouncements: boolean;
  markAnnouncementsAsSeen: () => void;

  isAdminAuthenticated: boolean;
  authenticateAdmin: (password: string) => boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customPersonas, setCustomPersonas] = useLocalStorage<AIPersona[]>('custom-personas', initialCustomPersonas);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      // Securely check for admin privileges based on the authenticated user's email.
      setIsAdmin(currentUser?.email === ADMIN_EMAIL);
      // Reset admin password auth on user change
      if (!session) {
        setIsAdminAuthenticated(false);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
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
        id: 'default-image',
        name: 'Quick Image Generator',
        icon: '🎨',
        type: PersonaType.IMAGE,
        description: 'Generate a high-quality image from a simple text description. This tool was built by Zara, a young Nigerian developer.',
        systemPrompt: '',
        examplePrompt: 'A high-detail photo of a cat wearing sunglasses and a leather jacket',
        isDefault: true,
        model: 'flux'
    }
  ], []);

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
    const newPersonas: AIPersona[] = importedPersonas
      .filter(p => p.type === 'IMAGE') // Only import image personas
      .map(p => {
        const newPersona: AIPersona = {
            ...(p as AIPersona),
            id: uuidv4(),
            isDefault: false,
            created_at: new Date().toISOString(),
        };

        newPersona.type = PersonaType.IMAGE;
        if (!newPersona.model) {
            newPersona.model = 'flux'; // Default model on import
        }

        return newPersona;
    });

    setCustomPersonas(prev => [...newPersonas, ...prev]);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error('Login failed: No user data returned.');
    return { user: data.user, session: data.session };
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
  
  const updateUserPassword = async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data.user;
  };
  
  const authenticateAdmin = (password: string) => {
    if (password === 'zarahacks') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
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
      updateUserPassword,
      announcements,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      toggleAnnouncementLike,
      addCommentToAnnouncement,
      addReplyToComment,
      hasNewAnnouncements,
      markAnnouncementsAsSeen,
      isAdminAuthenticated,
      authenticateAdmin,
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
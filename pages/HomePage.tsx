import React, { useState, FormEvent, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAI } from '../contexts/AIContext';
import { PersonaType, AIPersona } from '../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useLocalStorage } from '../components/hooks/useLocalStorage';
import AnnouncementModal from '../ui/AnnouncementModal';

const HomePage: React.FC = () => {
  const { personas, user, updateUserUsername, announcements } = useAI();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.user_metadata?.username || '');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  const [dismissedAnnouncements, setDismissedAnnouncements] = useLocalStorage<string[]>('announcements_dismissed', []);

  const latestAnnouncement = useMemo(() => {
    const sorted = [...announcements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.find(a => a.enabled && !dismissedAnnouncements.includes(a.id));
  }, [announcements, dismissedAnnouncements]);

  const isAnnouncementModalOpen = !!latestAnnouncement;

  const handleDismissAnnouncement = () => {
    if (latestAnnouncement) {
      setDismissedAnnouncements(prev => [...prev, latestAnnouncement.id]);
    }
  };

  const filteredPersonas = personas.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const defaultPersonas = filteredPersonas.filter(p => p.isDefault);
  const customPersonas = filteredPersonas.filter(p => !p.isDefault);
  
  const VerifiedBadge: React.FC = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-400" aria-label="Verified">
      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12c0 1.357-.6 2.573-1.549 3.397a4.49 4.49 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.491 4.491 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  );


  const PersonaCard: React.FC<{ persona: AIPersona }> = ({ persona }) => {
    const linkTo = `/image/${persona.id}`;
    
    return (
      <Link to={linkTo} className="block h-full">
        <Card className="h-full">
          <div className="p-6 flex flex-col items-start h-full">
            <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{persona.icon || '🎨'}</div>
                <h3 className="text-xl font-bold text-text-primary">{persona.name}</h3>
            </div>
            <p className="text-text-secondary flex-grow">{persona.description}</p>
          </div>
        </Card>
      </Link>
    );
  };
  
  const handleUsernameUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUsername || newUsername.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      return;
    }
    setIsUpdatingUsername(true);
    setUsernameError('');
    try {
      await updateUserUsername(newUsername);
      setIsEditingUsername(false);
    } catch(err: any) {
      setUsernameError(err.message || 'Failed to update username.');
    } finally {
      setIsUpdatingUsername(false);
    }
  };
  
  const cancelUsernameEdit = () => {
    setIsEditingUsername(false);
    setNewUsername(user?.user_metadata?.username || '');
    setUsernameError('');
  }
  
  return (
    <>
      {latestAnnouncement && (
        <AnnouncementModal
            isOpen={isAnnouncementModalOpen}
            onClose={handleDismissAnnouncement}
            announcement={latestAnnouncement}
        />
      )}
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">ZARA AI HUB</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-sm text-text-secondary">by Zara Codec</p>
              <VerifiedBadge />
          </div>
          <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
            Welcome, <span className="font-bold text-text-primary">{user?.user_metadata?.username || user?.email}</span>! Here you can bring your ideas to life with our powerful image generator.
            <button 
              onClick={() => setIsEditingUsername(true)} 
              className="ml-2 p-1 rounded-full hover:bg-surface/80 text-text-secondary hover:text-primary transition-colors"
              title="Edit username"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </button>
          </p>
          {isEditingUsername && (
            <div className="mt-4 max-w-md mx-auto">
              <Card className="!p-4">
                <form onSubmit={handleUsernameUpdate} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="flex-grow px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
                  />
                  <Button type="submit" isLoading={isUpdatingUsername} className="!py-2 !px-3">Save</Button>
                  <Button type="button" onClick={cancelUsernameEdit} className="!py-2 !px-3 !bg-gray-600 hover:!bg-gray-500">Cancel</Button>
                </form>
                {usernameError && <p className="text-red-500 text-sm mt-2">{usernameError}</p>}
              </Card>
            </div>
          )}
        </div>

        <div className="max-w-xl mx-auto">
          <input
              type="text"
              placeholder="Search for an agent or tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
          />
        </div>
        
        {defaultPersonas.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-text-primary">Standard Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {defaultPersonas.map(p => <PersonaCard key={p.id} persona={p} />)}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4 text-text-primary">Custom Image Generators</h2>
          {customPersonas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customPersonas.map(p => <PersonaCard key={p.id} persona={p} />)}
            </div>
          ) : (
            <p className="text-text-secondary">{searchQuery ? 'No image generators match your search.' : 'No custom image generators available. Visit the admin panel to create one.'}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
// Fix: Update import path for Announcement type.
import { Announcement } from '../types';
import { fonts } from '../contexts/ThemeContext';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, announcement }) => {
  if (!isOpen) return null;

  const selectedFont = fonts[announcement.fontFamily as keyof typeof fonts] || fonts.inter;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" 
      aria-modal="true" 
      role="dialog"
    >
      <div 
        className="bg-surface rounded-xl shadow-xl w-full max-w-lg m-4 border border-border-color transform transition-all animate-in fade-in-0 zoom-in-95 duration-300" 
        role="document"
        style={{ fontFamily: selectedFont.family }}
      >
        <div className="p-6 md:p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-primary mb-3">{announcement.title}</h3>
          <p className="text-text-secondary mb-6">{announcement.message}</p>
        </div>
        <div className="bg-background/50 px-6 py-4 flex flex-col sm:flex-row justify-center items-center gap-4 rounded-b-xl border-t border-border-color">
          <Button onClick={onClose} className="w-full sm:w-auto !bg-gray-600 hover:!bg-gray-500">
            Dismiss
          </Button>
          <Link to="/announcements" className="w-full sm:w-auto" onClick={onClose}>
            <Button className="w-full !bg-surface hover:!bg-border-color/50 !text-text-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              View History
            </Button>
          </Link>
          {announcement.actionText && announcement.actionLink && (
             <Link to={announcement.actionLink} className="w-full sm:w-auto" onClick={onClose}>
                <Button className="w-full">
                  {announcement.actionText}
                </Button>
              </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
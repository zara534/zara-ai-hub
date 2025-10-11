import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAI } from '../../contexts/AIContext';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import ThemeSwitcher from './ThemeSwitcher';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, logout, hasNewAnnouncements } = useAI();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLogoutModalOpen(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
      <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border-color">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            {/* Brand link removed as per request. Navigation is aligned to the right. */}
            <nav className="flex items-center space-x-2 md:space-x-4">
              {user ? (
                <>
                  <Link to="/" className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors" title="Home">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </Link>
                  <Link to="/admin" className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors" title="Admin Panel">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                     </svg>
                  </Link>
                  <Link to="/announcements" className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors" title="Announcements">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {hasNewAnnouncements && (
                      <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-surface" />
                    )}
                  </Link>
                  <a href="mailto:zarahacks070@gmail.com" className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors" title="Send Feedback">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                  </a>
                  {/* Separator to visually space out navigation from user actions */}
                  <div className="w-px h-6 bg-border-color/50 mx-2 hidden md:block" />
                   <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
                      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                      {theme === 'dark' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      )}
                    </button>
                  <ThemeSwitcher />
                  <Button onClick={() => setLogoutModalOpen(true)} className="!py-2 !px-4 !bg-red-600 hover:!bg-red-700">Logout</Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Login</Link>
                  <Link to="/signup" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

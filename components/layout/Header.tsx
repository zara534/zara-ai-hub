import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAI } from '../../contexts/AIContext';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { useTheme, themes, fonts } from '../../contexts/ThemeContext';
import Card from '../../ui/Card';

const Header: React.FC = () => {
  const { user, logout, hasNewAnnouncements } = useAI();
  const { theme, toggleTheme, themeColor, setThemeColor, font, setFont } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menu on route change as a fallback
    if (isMenuOpen) {
      setMenuOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const menuItems = [
    { to: '/', title: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { to: '/profile', title: 'My Profile', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg> },
    { to: '/admin', title: 'Admin Panel', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg> },
    { to: '/announcements', title: 'Announcements', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, notification: hasNewAnnouncements },
    { href: 'mailto:zarahacks070@gmail.com', title: 'Send Feedback', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  ];

  const closeMenu = () => setMenuOpen(false);

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
          <div className="flex items-center justify-between h-16">
            {user ? (
              <>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!isMenuOpen)}
                    title="Open menu"
                    className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute left-0 mt-2 w-72 origin-top-left">
                      <Card className="p-2">
                        <nav className="space-y-1 p-2">
                          {menuItems.map(item => {
                            const content = (
                              <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.title}</span>
                                {item.notification && <span className="ml-auto block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-surface" />}
                              </div>
                            );
                            const className = "w-full text-left px-3 py-2 rounded-md transition-colors text-base flex items-center hover:bg-border-color/50 text-text-primary";
                            if ('to' in item) {
                                return <Link key={item.title} to={item.to} className={className} onClick={closeMenu}>{content}</Link>;
                            }
                            return <a key={item.title} href={item.href} className={className} onClick={closeMenu}>{content}</a>;
                          })}
                        </nav>
                        <div className="border-t border-border-color my-2" />
                        <div className="p-2 space-y-4">
                            <button onClick={toggleTheme} className="w-full text-left px-3 py-2 rounded-md transition-colors text-base flex items-center hover:bg-border-color/50 text-text-primary gap-3">
                                {theme === 'dark' ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                                <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                            </button>
                            <div>
                                <p className="text-sm font-medium text-text-secondary px-2 pb-2">Theme Color</p>
                                <div className="grid grid-cols-6 gap-2">
                                    {Object.entries(themes).map(([key, theme]) => (
                                        <button key={key} title={theme.name} onClick={() => setThemeColor(key as any)} className={`w-full h-8 rounded-md border-2 transition-all ${themeColor === key ? 'border-accent ring-2 ring-accent' : 'border-transparent hover:border-text-secondary/50'}`} style={{ backgroundColor: `rgb(${theme.primary})` }} aria-label={`Set theme to ${theme.name}`} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-secondary px-2 pb-2">Font Style</p>
                                <select onChange={(e) => setFont(e.target.value as any)} value={font} className="w-full px-3 py-2 bg-background border border-border-color rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-text-primary text-sm" style={{fontFamily: fonts[font].family}}>
                                     {Object.entries(fonts).map(([key, fontInfo]) => (
                                        <option key={key} value={key} style={{fontFamily: fontInfo.family}}>{fontInfo.name}</option>
                                     ))}
                                </select>
                            </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>

                <div className="ml-auto">
                  <Button onClick={() => setLogoutModalOpen(true)} className="!py-2 !px-4 !bg-red-600 hover:!bg-red-700">Logout</Button>
                </div>
              </>
            ) : (
              <nav className="flex items-center space-x-4 ml-auto">
                <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Login</Link>
                <Link to="/signup" className="text-text-secondary hover:text-text-primary transition-colors duration-200">Sign Up</Link>
              </nav>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

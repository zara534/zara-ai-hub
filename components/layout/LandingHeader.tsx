import React from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import Button from '../../ui/Button';

const LandingHeader: React.FC = () => {
  return (
    <header className="bg-surface/80 backdrop-blur-sm sticky top-0 z-40 border-b border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            ZARA AI HUB
          </Link>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <nav className="hidden sm:flex items-center space-x-4">
              <Link to="/login" className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium">
                Login
              </Link>
              <Link to="/signup">
                <Button className="!py-2 !px-4">Sign Up</Button>
              </Link>
            </nav>
            <div className="sm:hidden">
                <Link to="/login">
                    <Button className="!py-2 !px-4">Login</Button>
                </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;

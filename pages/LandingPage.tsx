import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';
import Card from '../ui/Card';
import AboutSection from '../components/layout/AboutSection';

const LandingPage: React.FC = () => {
  return (
    <div className="relative text-center py-12 px-4 min-h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 z-10">
        <ThemeSwitcher />
      </div>

      <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
        ZARA AI HUB
      </h1>
      <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
        Your personal creative suite, powered by the custom-tuned ZARA AI engine. Bring your ideas to life with bespoke AI agents and stunning visual artwork.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link to="/signup">
          <Button className="w-full sm:w-auto">Get Started for Free</Button>
        </Link>
        <Link to="/login">
          <Button className="w-full sm:w-auto !bg-surface hover:!bg-border-color/50 !text-text-primary">
            I have an account
          </Button>
        </Link>
      </div>

      <div className="mt-16 w-full max-w-4xl">
        <AboutSection />
      </div>
    </div>
  );
};

export default LandingPage;
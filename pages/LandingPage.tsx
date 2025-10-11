import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';

const LandingPage: React.FC = () => {
  return (
    <div className="relative min-h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="absolute top-4 right-4 z-10">
            <ThemeSwitcher />
        </div>
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            ZARA AI HUB
        </h1>
        <p className="text-lg md:text-xl text-text-secondary">
            Experience the future of creativity with ZARA AI. Access powerful image generation and chat with intelligent text assistants, all built by ZARA CODEC.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/login" className="w-full sm:w-auto">
                <Button className="w-full px-10 py-3">Login</Button>
            </Link>
            <Link to="/signup" className="w-full sm:w-auto">
                <Button className="w-full px-10 py-3 !bg-surface hover:!bg-border-color/50 !text-text-primary">Sign Up</Button>
            </Link>
        </div>
      </div>
      
      <div className="w-full max-w-3xl mx-auto mt-16 p-6 bg-surface/50 rounded-2xl border border-border-color text-left">
          <h2 className="text-xl font-bold text-primary mb-3 text-center">A Note from the Creator</h2>
          <div className="text-text-secondary text-sm leading-relaxed space-y-3">
              <p>
                  Hello! I'm <span className="font-semibold text-accent">Goodluck Zara</span> (also known as Zara Codec), the creator of this platform. As a young Nigerian developer, my journey into artificial intelligence has been driven by pure passion. This platform was built by me, Zara.
              </p>
              <p>
                  Building the ZARA AI HUB from the ground up was an immense challenge—a true labor of love filled with sleepless nights, complex coding problems, and a relentless desire to build something both powerful and user-friendly. This website is the result of that dedication.
              </p>
              <p>
                  My dream is to empower everyone with access to incredible AI tools. If you're interested in creating a website or app, or wish to explore AI further, I'm available for hire. You can reach me directly on WhatsApp at <strong className="text-text-primary">+2347011156046</strong>. Let's build something amazing together!
              </p>
          </div>
      </div>
    </div>
  );
};

export default LandingPage;
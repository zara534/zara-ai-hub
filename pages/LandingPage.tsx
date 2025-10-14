import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import AboutSection from '../components/layout/AboutSection';
import Card from '../ui/Card';

const FeatureCard: React.FC<{ icon: string; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <Card className="p-6 text-center">
    <div className="text-4xl mb-4 text-primary">{icon}</div>
    <h3 className="text-xl font-bold mb-2 text-text-primary">{title}</h3>
    <p className="text-text-secondary">{children}</p>
  </Card>
);

const Step: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center text-xl font-bold">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      <p className="text-text-secondary">{children}</p>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-20 sm:py-28 text-center bg-surface/30">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            ZARA AI HUB
          </h1>
          <p className="mt-4 text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
            Your personal creative suite, powered by the custom-tuned ZARA AI engine. Bring your ideas to life with bespoke AI agents and stunning visual artwork.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button className="w-full sm:w-auto text-lg px-8 py-4">Get Started for Free</Button>
            </Link>
            <Link to="/login">
              <Button className="w-full sm:w-auto !bg-surface hover:!bg-border-color/50 !text-text-primary text-lg px-8 py-4">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Unleash Your Creativity</h2>
            <p className="mt-2 text-lg text-text-secondary max-w-2xl mx-auto">Discover powerful tools designed to bring your imagination to life.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon="✨" title="Bespoke AI Agents">
              Choose from dozens of specialized AI agents, each fine-tuned for a specific creative task, from logo design to fantasy art.
            </FeatureCard>
            <FeatureCard icon="🖼️" title="Stunning Visuals">
              Generate high-quality, unique images and artwork in seconds. Our models are optimized for detail, color, and composition.
            </FeatureCard>
            <FeatureCard icon="🚀" title="Simple & Intuitive">
              No complex settings or learning curve. Just type your idea, choose an agent, and watch the magic happen.
            </FeatureCard>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-surface/30">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary">Get Started in 3 Easy Steps</h2>
            </div>
            <div className="max-w-2xl mx-auto grid md:grid-cols-1 gap-10">
                <Step number="1" title="Create Your Account">
                    Sign up for a free account in seconds to get access to all our creative tools and a daily generation credit.
                </Step>
                <Step number="2" title="Choose Your AI Agent">
                    Browse our extensive library of AI agents and select the one that best fits your creative vision.
                </Step>
                <Step number="3" title="Bring Your Idea to Life">
                    Describe what you want to create, select your style preferences, and click 'Generate' to see your idea become reality.
                </Step>
            </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 sm:py-24">
         <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
                <AboutSection />
            </div>
         </div>
      </section>
    </div>
  );
};

export default LandingPage;
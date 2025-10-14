import React from 'react';

const Footer: React.FC = () => {
  const socialLinks = [
    { 
        href: 'https://www.facebook.com/profile.php?id=61579058107810', 
        label: 'Facebook',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>
    },
    { 
        href: 'https://www.tiktok.com/@zarahacks070?_t=ZS-90EKk2Xi93w&_r=1', 
        label: 'TikTok',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.345 6.273c-1.597 1.597-2.316 3.033-2.316 5.515 0 2.213.918 4.498 3.109 4.498.442 0 .82-.056 1.157-.145v-3.483c-.337.089-.714.145-1.157.145-1.114 0-1.282-1.042-1.282-1.638 0-2.953 2.123-2.775 4.142-2.775v-3.483c-.328 0-1.04-.009-1.5-.009-2.825 0-4.004 1.37-4.143 1.37zm-9.336 4.225c.013 3.498-2.112 5.503-5.018 5.503-2.905 0-4.991-2.005-4.991-5.503 0-3.498 2.086-5.502 4.991-5.502 2.906-.001 5.005 2.004 5.018 5.502zm-2.019.001c-.006-2.203-.924-3.502-2.99-3.502s-2.983 1.299-2.983 3.502c0 2.203.915 3.501 2.983 3.501s2.996-1.298 2.99-3.501z"/></svg>
    },
    { 
        href: 'tel:+2347011156046', 
        label: 'Phone',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"></path></svg>
    },
  ];

  return (
    <footer className="bg-surface border-t border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-primary">ZARA AI HUB</h3>
            <p className="text-sm text-text-secondary mt-1">© {new Date().getFullYear()} ZARA AI HUB. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-4">
            {socialLinks.map(link => (
              <a 
                key={link.label}
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`Contact Zara on ${link.label}`}
                className="text-text-secondary hover:text-primary transition-colors transform hover:scale-110"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

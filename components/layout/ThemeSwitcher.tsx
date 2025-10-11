import React, { useState, useRef, useEffect } from 'react';
import { useTheme, themes, fonts } from '../../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { themeColor, setThemeColor, font, setFont } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        title="Change theme" 
        className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-surface border border-border-color rounded-lg shadow-xl p-4 z-50">
          <div>
            <p className="text-sm font-medium text-text-secondary px-2 pb-2">Theme Color</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  title={theme.name}
                  onClick={() => {
                    setThemeColor(key as any);
                  }}
                  className={`w-full h-10 rounded-md border-2 transition-all ${
                    themeColor === key ? 'border-accent ring-2 ring-accent' : 'border-transparent hover:border-text-secondary/50'
                  }`}
                  style={{ backgroundColor: `rgb(${theme.primary})` }}
                  aria-label={`Set theme to ${theme.name}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-color">
            <p className="text-sm font-medium text-text-secondary px-2 pb-2">Font Style</p>
            <div className="space-y-1">
              {Object.entries(fonts).map(([key, fontInfo]) => (
                <button
                  key={key}
                  onClick={() => {
                    setFont(key as any);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors text-base ${
                    font === key ? 'bg-primary text-background font-semibold' : 'hover:bg-border-color/50 text-text-primary'
                  }`}
                  style={{ fontFamily: fontInfo.family }}
                >
                  {fontInfo.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;

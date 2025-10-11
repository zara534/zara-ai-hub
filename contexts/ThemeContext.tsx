import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '../components/hooks/useLocalStorage';

type Theme = 'light' | 'dark';

export const themes = {
  yellow: { name: 'Yellow', primary: '250 204 21', secondary: '234 179 8', accent: '253 224 71' },
  blue: { name: 'Blue', primary: '59 130 246', secondary: '37 99 235', accent: '96 165 250' },
  green: { name: 'Green', primary: '34 197 94', secondary: '22 163 74', accent: '74 222 128' },
  pink: { name: 'Pink', primary: '236 72 153', secondary: '219 39 119', accent: '244 114 182' },
  purple: { name: 'Purple', primary: '168 85 247', secondary: '147 51 234', accent: '192 132 252' },
  orange: { name: 'Orange', primary: '249 115 22', secondary: '234 88 12', accent: '251 146 60' },
  red: { name: 'Red', primary: '239 68 68', secondary: '220 38 38', accent: '248 113 113' },
  teal: { name: 'Teal', primary: '20 184 166', secondary: '13 148 136', accent: '45 212 191' },
  indigo: { name: 'Indigo', primary: '99 102 241', secondary: '79 70 229', accent: '129 140 248' },
  cyan: { name: 'Cyan', primary: '6 182 212', secondary: '8 145 178', accent: '34 211 238' },
  lime: { name: 'Lime', primary: '132 204 22', secondary: '101 163 13', accent: '163 230 53' },
};
export type ThemeColor = keyof typeof themes;

export const fonts = {
  inter: { name: 'Inter', family: 'Inter' },
  poppins: { name: 'Poppins', family: 'Poppins' },
  robotoSlab: { name: 'Roboto Slab', family: '"Roboto Slab"' },
  firaCode: { name: 'Fira Code', family: '"Fira Code"' },
  montserrat: { name: 'Montserrat', family: 'Montserrat' },
  nunito: { name: 'Nunito', family: 'Nunito' },
  sourceCodePro: { name: 'Source Code Pro', family: '"Source Code Pro"' },
  lato: { name: 'Lato', family: 'Lato' },
  openSans: { name: 'Open Sans', family: '"Open Sans"' },
};
export type FontFamily = keyof typeof fonts;


interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  font: FontFamily;
  setFont: (font: FontFamily) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('app-theme', 'dark');
  const [themeColor, setThemeColor] = useLocalStorage<ThemeColor>('app-theme-color', 'teal');
  const [font, setFont] = useLocalStorage<FontFamily>('app-font', 'inter');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  
  useEffect(() => {
    const root = document.documentElement;
    const selectedTheme = themes[themeColor];
    if (selectedTheme) {
        root.style.setProperty('--color-primary', selectedTheme.primary);
        root.style.setProperty('--color-secondary', selectedTheme.secondary);
        root.style.setProperty('--color-accent', selectedTheme.accent);
    }
  }, [themeColor]);

  useEffect(() => {
    const root = document.documentElement;
    const selectedFont = fonts[font];
    if (selectedFont) {
        root.style.setProperty('--font-family', selectedFont.family);
    }
  }, [font]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeColor, setThemeColor, font, setFont }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
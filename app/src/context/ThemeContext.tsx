import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('learnflux-theme') as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }

    const savedOfflineMode = localStorage.getItem('learnflux-offline-mode');
    if (savedOfflineMode) {
      setIsOfflineMode(savedOfflineMode === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('learnflux-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('learnflux-offline-mode', String(isOfflineMode));
  }, [isOfflineMode]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isOfflineMode, toggleOfflineMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

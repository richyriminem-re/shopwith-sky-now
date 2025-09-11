import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="neu-icon-button opacity-50" />;
  }

  const toggleTheme = () => {
    // Enhanced theme transition with Edge browser support
    const html = document.documentElement;
    
    // Add transition class
    html.classList.add('theme-transitioning');
    
    // Force repaint for Edge browser
    if (navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg/')) {
      html.style.transform = 'translateZ(0)';
      setTimeout(() => html.style.transform = '', 0);
    }
    
    setTheme(theme === 'dark' ? 'light' : 'dark');
    
    // Remove transition class after animation completes
    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 300);
  };

  return (
    <button
      onClick={toggleTheme}
      className="neu-icon-button group relative overflow-hidden md:mx-2"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Sun Icon */}
        <Sun 
          size={16} 
          className={`absolute transition-all duration-500 ease-in-out ${
            theme === 'dark' 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
          }`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          size={16} 
          className={`absolute transition-all duration-500 ease-in-out ${
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          }`} 
        />
      </div>
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-200/20 to-orange-200/20 dark:from-indigo-400/20 dark:to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle;
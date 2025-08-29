
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 hover:bg-accent text-foreground border border-border/50 hover:border-border transition-all duration-300"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-navy dark:text-steel-blue" />
      ) : (
        <Sun className="h-4 w-4 text-gold dark:text-ivory" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;

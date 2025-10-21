import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 flex items-center px-1 ${
        isDark
          ? 'bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg'
          : 'bg-gradient-to-r from-cyan-300 to-cyan-400 shadow-cyan-glow'
      }`}
      aria-label="Toggle theme"
    >
      <motion.div
        layout
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          isDark ? 'bg-gray-900' : 'bg-white'
        }`}
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-yellow-300" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-400" />
        )}
      </motion.div>
    </motion.button>
  );
}

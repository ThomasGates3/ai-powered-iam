import { motion } from 'framer-motion';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

interface ActionButtonsProps {
  policy: string | null;
  onShowNotification: (message: string) => void;
  isDark?: boolean;
}

export default function ActionButtons({ policy, onShowNotification, isDark }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!policy) return;

    try {
      const formatted = JSON.stringify(JSON.parse(policy), null, 2);
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      onShowNotification('Policy copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      onShowNotification('Failed to copy policy');
    }
  };

  const handleDownload = () => {
    if (!policy) return;

    try {
      const formatted = JSON.stringify(JSON.parse(policy), null, 2);
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'policy.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowNotification('Policy downloaded successfully!');
    } catch (error) {
      onShowNotification('Failed to download policy');
    }
  };

  return (
    <div className="flex gap-3">
      <motion.button
        onClick={handleCopy}
        disabled={!policy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex-1 py-3 px-4 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
          isDark
            ? 'bg-gray-800 border border-purple-600/50 hover:bg-gray-700 text-white'
            : 'bg-white border border-cyan-300 hover:bg-cyan-50 text-gray-900'
        }`}
      >
        {copied ? (
          <Check className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-cyan-600'}`} />
        ) : (
          <Copy className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-cyan-600'}`} />
        )}
        {copied ? 'Copied!' : 'Copy Policy'}
      </motion.button>

      <motion.button
        onClick={handleDownload}
        disabled={!policy}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex-1 py-3 px-4 text-white font-semibold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${
          isDark
            ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purple-500/30'
            : 'bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 shadow-cyan-glow'
        }`}
      >
        <Download className="w-5 h-5" />
        Download JSON
      </motion.button>
    </div>
  );
}

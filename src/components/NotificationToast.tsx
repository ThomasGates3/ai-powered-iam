import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
  isDark?: boolean;
}

export default function NotificationToast({ message, onClose, isDark }: NotificationToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className={`rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px] border transition-all duration-300 ${
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-cyan-200/30'
          }`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDark
                ? 'bg-green-600/20'
                : 'bg-green-100'
            }`}>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className={`flex-1 font-medium transition-colors duration-300 ${
              isDark ? 'text-gray-200' : 'text-gray-900'
            }`}>{message}</p>
            <button
              onClick={onClose}
              className={`flex-shrink-0 transition-colors duration-300 ${
                isDark
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  onClose: () => void;
}

export default function NotificationToast({ message, onClose }: NotificationToastProps) {
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-4 flex items-center gap-3 min-w-[300px]">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="flex-1 text-gray-200 font-medium">{message}</p>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

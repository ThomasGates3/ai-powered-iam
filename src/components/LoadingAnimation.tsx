import { motion } from 'framer-motion';

interface LoadingAnimationProps {
  isDark?: boolean;
}

export default function LoadingAnimation({ isDark }: LoadingAnimationProps) {
  return (
    <div className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 transition-colors duration-300 ${
      isDark ? 'bg-black/50' : 'bg-white/30'
    }`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-2xl p-8 shadow-2xl transition-all duration-300 border ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-cyan-200/30'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  isDark ? 'bg-purple-500' : 'bg-cyan-500'
                }`}
              />
            ))}
          </div>
          <p className={`font-medium transition-colors duration-300 ${
            isDark ? 'text-gray-300' : 'text-gray-900'
          }`}>Generating IAM Policy...</p>
          <p className={`text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-500' : 'text-gray-600'
          }`}>Using AI to create least-privilege access</p>
        </div>
      </motion.div>
    </div>
  );
}

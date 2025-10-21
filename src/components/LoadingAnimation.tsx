import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl"
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
                className="w-3 h-3 bg-blue-500 rounded-full"
              />
            ))}
          </div>
          <p className="text-gray-300 font-medium">Generating IAM Policy...</p>
          <p className="text-gray-500 text-sm">Using AI to create least-privilege access</p>
        </div>
      </motion.div>
    </div>
  );
}

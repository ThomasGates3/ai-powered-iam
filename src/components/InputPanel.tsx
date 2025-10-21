import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export default function InputPanel({ value, onChange, onGenerate, isLoading }: InputPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="space-y-3">
        <label htmlFor="policy-input" className="block text-lg font-semibold text-gray-200">
          Describe Your IAM Policy
        </label>
        <textarea
          id="policy-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Example: Grant S3 read access and DynamoDB write access for my application..."
          className="w-full h-40 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-200"
          disabled={isLoading}
        />
      </div>

      <motion.button
        onClick={onGenerate}
        disabled={isLoading || !value.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {isLoading ? 'Generating Policy...' : 'Generate Policy'}
      </motion.button>
    </motion.div>
  );
}

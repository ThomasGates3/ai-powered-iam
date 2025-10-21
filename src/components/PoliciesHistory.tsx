import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Policy {
  policy_id: string;
  timestamp: string;
  description: string;
  policy_json: string;
}

interface PoliciesHistoryProps {
  policies: Policy[];
  onDelete: (policyId: string) => void;
  isDark?: boolean;
}

export default function PoliciesHistory({ policies, onDelete, isDark }: PoliciesHistoryProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (policyId: string, policyJson: string) => {
    navigator.clipboard.writeText(policyJson);
    setCopied(policyId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (policies.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-6 transition-all duration-300 ${
        isDark
          ? 'bg-gray-800/60 border-purple-600/30'
          : 'bg-white border-cyan-200/30'
      }`}
    >
      <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
        isDark ? 'text-white' : 'text-gray-900'
      }`}>
        Generated Policies History
      </h3>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {policies.map((policy, index) => (
            <motion.div
              key={policy.policy_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              layout
              className={`p-4 rounded-lg border transition-all duration-300 ${
                isDark
                  ? 'bg-gray-700/40 border-purple-600/20 hover:border-purple-500/50'
                  : 'bg-slate-50 border-cyan-200/50 hover:border-cyan-400/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-purple-300' : 'text-cyan-600'
                  }`}>
                    {policy.description}
                  </p>
                  <p className={`text-xs transition-colors duration-300 mt-1 ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {formatDate(policy.timestamp)}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(policy.policy_id, policy.policy_json)}
                    className={`p-1.5 rounded transition-colors duration-200 ${
                      copied === policy.policy_id
                        ? isDark
                          ? 'text-green-400'
                          : 'text-green-600'
                        : isDark
                        ? 'text-gray-400 hover:text-purple-400'
                        : 'text-gray-400 hover:text-cyan-600'
                    }`}
                    title="Copy policy"
                  >
                    {copied === policy.policy_id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDelete(policy.policy_id)}
                    className={`p-1.5 rounded transition-colors duration-200 ${
                      isDark
                        ? 'text-gray-400 hover:text-red-400'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    title="Delete policy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

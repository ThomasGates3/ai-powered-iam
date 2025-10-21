import { motion } from 'framer-motion';
import { Shield, CheckCircle, Sparkles, Zap } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure',
    description: 'Least Privileged Based Access',
    lightColor: 'from-cyan-400 to-cyan-500',
    darkColor: 'from-purple-600 to-purple-700',
    lightGlow: 'shadow-cyan-glow',
    darkGlow: 'shadow-purple-500/50',
  },
  {
    icon: CheckCircle,
    title: 'Compliant',
    description: 'AWS Best Practices',
    lightColor: 'from-emerald-400 to-emerald-500',
    darkColor: 'from-emerald-600 to-emerald-700',
    lightGlow: 'shadow-emerald-500/50',
    darkGlow: 'shadow-emerald-600/50',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Advanced LLM Expertise',
    lightColor: 'from-amber-400 to-amber-500',
    darkColor: 'from-amber-600 to-amber-700',
    lightGlow: 'shadow-amber-500/50',
    darkGlow: 'shadow-amber-600/50',
  },
  {
    icon: Zap,
    title: 'Fast',
    description: 'Under 3 Seconds',
    lightColor: 'from-cyan-400 to-cyan-500',
    darkColor: 'from-purple-600 to-purple-700',
    lightGlow: 'shadow-cyan-glow',
    darkGlow: 'shadow-purple-500/50',
  },
];

interface FeatureGridProps {
  isDark?: boolean;
}

export default function FeatureGrid({ isDark }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="group relative"
        >
          <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 blur-xl bg-gradient-to-br ${
            isDark ? feature.darkColor : feature.lightColor
          } opacity-0 group-hover:opacity-20`} />

          <div className={`relative rounded-xl p-6 transition-all duration-300 ${
            isDark
              ? `bg-gray-800/60 border border-purple-600/30 ${feature.darkGlow} group-hover:border-purple-500/50`
              : `bg-white border border-cyan-200/30 ${feature.lightGlow} group-hover:border-cyan-400/50`
          }`}>
            <div className={`inline-flex p-3 bg-gradient-to-br rounded-lg mb-4 shadow-md ${
              isDark ? feature.darkColor : feature.lightColor
            }`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{feature.title}</h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

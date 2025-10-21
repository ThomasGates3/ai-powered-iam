import { motion } from 'framer-motion';
import { Shield, CheckCircle, Sparkles, Zap } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure',
    description: 'Least Privileged Based Access',
    color: 'from-cyan-400 to-cyan-500',
    glowColor: 'shadow-cyan-glow',
  },
  {
    icon: CheckCircle,
    title: 'Compliant',
    description: 'AWS Best Practices',
    color: 'from-emerald-400 to-emerald-500',
    glowColor: 'shadow-emerald-500/50',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Advanced LLM Expertise',
    color: 'from-amber-400 to-amber-500',
    glowColor: 'shadow-amber-500/50',
  },
  {
    icon: Zap,
    title: 'Fast',
    description: 'Under 3 Seconds',
    color: 'from-cyan-400 to-cyan-500',
    glowColor: 'shadow-cyan-glow',
  },
];

export default function FeatureGrid() {
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
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300 blur-xl`} />

          <div className={`relative bg-white border border-cyan-200/30 rounded-xl p-6 shadow-sm group-hover:shadow-md ${feature.glowColor} group-hover:border-cyan-400/50 transition-all duration-300`}>
            <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-lg mb-4 shadow-md`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

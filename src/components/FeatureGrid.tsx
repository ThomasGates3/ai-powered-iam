import { motion } from 'framer-motion';
import { Shield, CheckCircle, Sparkles, Zap } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure',
    description: 'Least Privileged Based Access',
    color: 'from-blue-500 to-cyan-500',
    glowColor: 'shadow-blue-500/50',
  },
  {
    icon: CheckCircle,
    title: 'Compliant',
    description: 'AWS Best Practices',
    color: 'from-green-500 to-emerald-500',
    glowColor: 'shadow-green-500/50',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered',
    description: 'Advanced LLM Expertise',
    color: 'from-orange-500 to-amber-500',
    glowColor: 'shadow-orange-500/50',
  },
  {
    icon: Zap,
    title: 'Fast',
    description: 'Under 3 Seconds',
    color: 'from-teal-500 to-cyan-500',
    glowColor: 'shadow-teal-500/50',
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
          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 rounded-xl transition-opacity duration-300 blur-xl`} />

          <div className={`relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg group-hover:shadow-xl ${feature.glowColor} group-hover:border-gray-600 transition-all duration-300`}>
            <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-lg mb-4 shadow-lg`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

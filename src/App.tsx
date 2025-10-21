import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import InputPanel from './components/InputPanel';
import FeatureGrid from './components/FeatureGrid';
import CodeEditor from './components/CodeEditor';
import ActionButtons from './components/ActionButtons';
import LoadingAnimation from './components/LoadingAnimation';
import NotificationToast from './components/NotificationToast';
import { generateIAMPolicy } from './utils/policyGenerator';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      const policy = await generateIAMPolicy(inputValue);
      setGeneratedPolicy(policy);
      showNotification('Policy Generated Successfully!');
    } catch (error) {
      showNotification('Failed to generate policy');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-100/30 via-transparent to-transparent" />

      <div className="relative min-h-screen flex flex-col">
        <header className="px-6 py-6 border-b border-cyan-200/40 backdrop-blur-sm bg-white/60">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg shadow-cyan-glow">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IAM Policy Generator</h1>
              <p className="text-sm text-cyan-600">AI-Powered Least Privilege Access</p>
            </div>
          </motion.div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-8"
              >
                <InputPanel
                  value={inputValue}
                  onChange={setInputValue}
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />

                <FeatureGrid />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col gap-4 min-h-[600px]"
              >
                <div className="flex-1">
                  <CodeEditor policy={generatedPolicy} isLoading={isLoading} />
                </div>

                <ActionButtons policy={generatedPolicy} onShowNotification={showNotification} />
              </motion.div>
            </div>
          </div>
        </main>

        <footer className="px-6 py-4 border-t border-cyan-200/40 backdrop-blur-sm bg-white/60">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
            Built with React, TypeScript, and Framer Motion
          </div>
        </footer>
      </div>

      {isLoading && <LoadingAnimation />}
      <NotificationToast message={notification} onClose={() => setNotification(null)} />
    </div>
  );
}

export default App;

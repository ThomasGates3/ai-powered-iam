import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

// Polyfill for crypto.randomUUID if not available
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  (crypto as any).randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}
import InputPanel from './components/InputPanel';
import FeatureGrid from './components/FeatureGrid';
import CodeEditor from './components/CodeEditor';
import ActionButtons from './components/ActionButtons';
import ThemeToggle from './components/ThemeToggle';
import PoliciesHistory from './components/PoliciesHistory';
import LoadingAnimation from './components/LoadingAnimation';
import NotificationToast from './components/NotificationToast';
import apiClient from './services/apiClient';

interface Policy {
  policy_id: string;
  timestamp: string;
  description: string;
  policy_json: string;
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  // Load policies from API on mount
  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const fetchedPolicies = await apiClient.getPolicies();
      setPolicies(fetchedPolicies);
    } catch (error) {
      console.error('Failed to load policies:', error);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  };

  const handleGenerate = async () => {
    if (!inputValue.trim()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.generatePolicy(inputValue);
      setGeneratedPolicy(response.policy_json);

      // Add to policies list
      const newPolicy: Policy = {
        policy_id: response.policy_id,
        timestamp: response.timestamp,
        description: response.description,
        policy_json: response.policy_json,
      };
      setPolicies([newPolicy, ...policies]);

      showNotification('Policy Generated Successfully!');
      setInputValue('');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to generate policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    try {
      await apiClient.deletePolicy(policyId);
      setPolicies(policies.filter(p => p.policy_id !== policyId));
      showNotification('Policy deleted successfully');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to delete policy');
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900'
        : 'bg-gradient-to-br from-slate-50 via-white to-cyan-50'
    }`}>
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] transition-all duration-300 ${
        isDark
          ? 'from-purple-900/30 via-transparent to-transparent'
          : 'from-cyan-100/30 via-transparent to-transparent'
      }`} />

      <div className="relative min-h-screen flex flex-col">
        <header className={`px-6 py-6 border-b transition-all duration-300 backdrop-blur-sm ${
          isDark
            ? 'border-purple-800/40 bg-gray-900/60'
            : 'border-cyan-200/40 bg-white/60'
        }`}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-all duration-300 shadow-lg ${
                isDark
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 shadow-purple-500/30'
                  : 'bg-gradient-to-br from-cyan-400 to-cyan-500 shadow-cyan-glow'
              }`}>
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>IAM Policy Generator</h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDark ? 'text-purple-400' : 'text-cyan-600'
                }`}>AI-Powered Least Privilege Access</p>
              </div>
            </div>
            <ThemeToggle isDark={isDark} onToggle={handleThemeToggle} />
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
                  isDark={isDark}
                />

                {generatedPolicy && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden"
                  >
                    <CodeEditor policy={generatedPolicy} isLoading={isLoading} isDark={isDark} />
                  </motion.div>
                )}

                <FeatureGrid isDark={isDark} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col gap-4 min-h-[600px] hidden lg:flex"
              >
                <div className="flex-1">
                  <CodeEditor policy={generatedPolicy} isLoading={isLoading} isDark={isDark} />
                </div>

                <ActionButtons policy={generatedPolicy} onShowNotification={showNotification} isDark={isDark} />
              </motion.div>
            </div>
          </div>
        </main>

        {/* Policies History Section - Above Footer */}
        {policies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-8 border-t transition-all duration-300"
            style={{
              borderColor: isDark ? 'rgba(126, 34, 206, 0.4)' : 'rgba(34, 197, 255, 0.4)',
            }}
          >
            <div className="max-w-7xl mx-auto">
              <PoliciesHistory
                policies={policies}
                onDelete={handleDeletePolicy}
                isDark={isDark}
              />
            </div>
          </motion.div>
        )}

        <footer className={`px-6 py-4 border-t transition-all duration-300 backdrop-blur-sm ${
          isDark
            ? 'border-purple-800/40 bg-gray-900/60'
            : 'border-cyan-200/40 bg-white/60'
        }`}>
          <div className={`max-w-7xl mx-auto text-center text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            © 2025 Thomas Gates III
          </div>
        </footer>
      </div>

      {isLoading && <LoadingAnimation isDark={isDark} />}
      <NotificationToast message={notification} onClose={() => setNotification(null)} isDark={isDark} />
    </div>
  );
}

export default App;

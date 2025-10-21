import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import InputPanel from './components/InputPanel';
import FeatureGrid from './components/FeatureGrid';
import CodeEditor from './components/CodeEditor';
import ActionButtons from './components/ActionButtons';
import ThemeToggle from './components/ThemeToggle';
import LoadingAnimation from './components/LoadingAnimation';
import NotificationToast from './components/NotificationToast';
import { generateIAMPolicy } from './utils/policyGenerator';

function App() {
  const [inputValue, setInputValue] = useState('');
  const [generatedPolicy, setGeneratedPolicy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Copy, Check, Send, AlertCircle, Loader2, Shield, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setCharCount(value.length);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "GeneratedPolicyStatement",
            Effect: "Allow",
            Action: [
              "s3:GetObject",
              "s3:ListBucket",
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ],
            Resource: [
              "arn:aws:s3:::bucket-name/*",
              "arn:aws:logs:*:*:log-group:/aws/lambda/*"
            ],
            Condition: {
              StringEquals: {
                "aws:SourceVpc": "vpc-12345678"
              }
            }
          }
        ]
      };
      setPolicy(JSON.stringify(mockPolicy, null, 2));
    } catch (err) {
      setError('Failed to generate policy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(policy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputLength = input.length;
  const maxLength = 500;
  const progress = (inputLength / maxLength) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark to-surface">
      {/* Background Blur Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-blue opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple opacity-5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50 backdrop-blur-sm bg-surface/30"
        >
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-gradient-to-br from-accent-blue to-accent-purple p-2.5 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-text-primary">IAM Policy Generator</h1>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <Sparkles className="w-5 h-5 text-accent-cyan opacity-70" />
                  </motion.div>
                </div>
                <p className="text-sm text-text-secondary mt-1">Generate secure, least-privilege policies in seconds</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-1/2 border-r border-border/50 flex flex-col p-8 bg-surface/40 backdrop-blur-xs overflow-hidden"
          >
            <form onSubmit={handleGenerate} className="h-full flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-text-primary">
                    Describe your access needs
                  </label>
                  <span className={`text-xs font-medium transition-colors ${
                    inputLength > maxLength * 0.8
                      ? 'text-red-400'
                      : inputLength > maxLength * 0.6
                      ? 'text-yellow-400'
                      : 'text-text-secondary'
                  }`}>
                    {inputLength}/{maxLength}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-border rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-accent-blue to-accent-cyan"
                    transition={{ type: 'spring', stiffness: 100 }}
                  />
                </div>

                <textarea
                  value={input}
                  onChange={handleInputChange}
                  maxLength={maxLength}
                  placeholder="e.g., Lambda function needs read-only access to S3 bucket 'data-lake' and write logs to CloudWatch. Restrict to VPC endpoints only."
                  className="w-full h-56 bg-surface border border-border/70 rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent resize-none font-mono text-sm leading-relaxed transition-all duration-200 hover:border-border"
                />
              </div>

              {/* Generate Button */}
              <motion.button
                type="submit"
                disabled={!input.trim() || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="self-start px-6 py-2.5 bg-gradient-to-r from-accent-blue to-accent-purple hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 group shadow-lg hover:shadow-xl hover:shadow-accent-blue/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    <span>Generate Policy</span>
                  </>
                )}
              </motion.button>

              <div className="flex-1" />

              {/* Info Cards */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-surface-alt border border-accent-blue/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm mb-1">Least-Privilege Policy</h3>
                      <p className="text-xs text-text-secondary">Specific actions, scoped resources, and condition keys included</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-surface-alt border border-accent-cyan/20 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm mb-1">AI-Generated</h3>
                      <p className="text-xs text-text-secondary">Powered by advanced LLM with AWS expertise</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </form>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-1/2 flex flex-col p-8 bg-surface-alt/20 backdrop-blur-xs overflow-hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold text-text-primary">Generated Policy</label>
                <p className="text-xs text-text-secondary mt-1">AWS IAM Policy (JSON)</p>
              </div>
              <AnimatePresence>
                {policy && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 rounded-lg text-sm font-medium text-accent-blue transition-all duration-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Editor Container */}
            <div className="flex-1 bg-surface border border-border/30 rounded-xl overflow-hidden shadow-xl">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center flex-col gap-4"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative"
                    >
                      <Loader2 className="w-8 h-8 text-accent-blue" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-text-primary">Generating policy...</p>
                      <p className="text-xs text-text-secondary mt-1">Using AI to create least-privilege access</p>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center p-8"
                  >
                    <div className="text-center">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-text-primary font-medium">{error}</p>
                    </div>
                  </motion.div>
                ) : policy ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <Editor
                      height="100%"
                      language="json"
                      value={policy}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
                        scrollBeyondLastLine: false,
                        padding: { top: 16, bottom: 16 },
                        lineNumbers: 'on',
                        formatOnPaste: true,
                        wordWrap: 'on',
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center text-center flex-col gap-4"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-blue to-accent-purple opacity-10 rounded-full blur-xl" />
                      <Zap className="w-16 h-16 text-text-secondary/30 relative" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Ready to generate</p>
                      <p className="text-xs text-text-secondary mt-1">Describe your access needs to get started</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Stats */}
            <AnimatePresence>
              {policy && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center justify-between text-xs text-text-secondary bg-surface-alt/50 rounded-lg px-4 py-3 border border-border/30"
                >
                  <div className="flex gap-6">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-blue" />
                      Statements: {JSON.parse(policy).Statement?.length || 0}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent-cyan" />
                      Size: {(policy.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <span className="text-accent-blue font-medium">AWS IAM Policy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default App;

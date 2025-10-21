import { useState } from 'react';
import { Zap, Copy, Check } from 'lucide-react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      // Placeholder for API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "ExampleStatement",
            Effect: "Allow",
            Action: ["s3:GetObject"],
            Resource: ["arn:aws:s3:::bucket-name/*"]
          }
        ]
      };
      setPolicy(JSON.stringify(mockPolicy, null, 2));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(policy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">IAM Policy Generator</h1>
              <p className="text-sm text-white/60">Generate secure, least-privilege IAM policies in seconds</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-88px)]">
        {/* Input Panel */}
        <div className="w-1/2 border-r border-white/10 flex flex-col p-8">
          <form onSubmit={handleGenerate} className="h-full flex flex-col">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-3 text-white/90">
                Describe your access needs
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., Lambda function needs read-only access to S3 bucket 'data-lake' and write logs to CloudWatch"
                className="w-full h-64 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="self-start px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 group"
            >
              <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {loading ? 'Generating...' : 'Generate Policy'}
            </button>

            <div className="flex-1" />

            {/* Info Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-white mb-2">Tips:</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Be specific about services (S3, Lambda, DynamoDB, etc.)</li>
                <li>• Include resource names or ARNs when possible</li>
                <li>• Mention any tags or conditions (e.g., environment=production)</li>
                <li>• Always generated with least-privilege principle</li>
              </ul>
            </div>
          </form>
        </div>

        {/* Output Panel */}
        <div className="w-1/2 flex flex-col p-8 bg-black/50">
          <div className="mb-4 flex items-center justify-between">
            <label className="block text-sm font-semibold text-white/90">
              Generated Policy
            </label>
            {policy && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            {policy ? (
              <Editor
                height="100%"
                language="json"
                value={policy}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Your generated policy will appear here</p>
                </div>
              </div>
            )}
          </div>

          {policy && (
            <div className="mt-4 text-xs text-white/50 flex gap-4">
              <span>Statements: 1</span>
              <span>|</span>
              <span>Characters: {policy.length}</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;

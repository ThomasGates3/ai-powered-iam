import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CodeEditorProps {
  policy: string | null;
  isLoading: boolean;
  isDark?: boolean;
}

export default function CodeEditor({ policy, isLoading, isDark }: CodeEditorProps) {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (policy && !isLoading) {
      setIsTyping(true);
      setDisplayedCode('');

      const formatted = JSON.stringify(JSON.parse(policy), null, 2);
      const lines = formatted.split('\n');
      let currentLine = 0;

      const interval = setInterval(() => {
        if (currentLine < lines.length) {
          setDisplayedCode(prev => prev + (currentLine > 0 ? '\n' : '') + lines[currentLine]);
          currentLine++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 20);

      return () => clearInterval(interval);
    } else if (!policy) {
      setDisplayedCode('');
      setIsTyping(false);
    }
  }, [policy, isLoading]);

  const renderCodeWithSyntax = (code: string, isDark: boolean = false) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      let processedLine = line;

      if (isDark) {
        processedLine = processedLine.replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:');
        processedLine = processedLine.replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>');
        processedLine = processedLine.replace(/: (\d+)/g, ': <span class="text-amber-400">$1</span>');
        processedLine = processedLine.replace(/: (true|false)/g, ': <span class="text-amber-400">$1</span>');
        processedLine = processedLine.replace(/(\[|\]|\{|\})/g, '<span class="text-gray-500">$1</span>');
      } else {
        processedLine = processedLine.replace(/"([^"]+)":/g, '<span class="text-cyan-600">"$1"</span>:');
        processedLine = processedLine.replace(/: "([^"]+)"/g, ': <span class="text-emerald-600">"$1"</span>');
        processedLine = processedLine.replace(/: (\d+)/g, ': <span class="text-amber-600">$1</span>');
        processedLine = processedLine.replace(/: (true|false)/g, ': <span class="text-amber-600">$1</span>');
        processedLine = processedLine.replace(/(\[|\]|\{|\})/g, '<span class="text-gray-400">$1</span>');
      }

      return (
        <div key={index} className="flex">
          <span className={`select-none w-10 flex-shrink-0 text-right pr-4 transition-colors duration-300 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {index + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: processedLine }} />
        </div>
      );
    });
  };

  return (
    <div className={`h-full rounded-lg border shadow-md overflow-hidden flex flex-col transition-all duration-300 ${
      isDark
        ? 'bg-gray-900 border-purple-600/30'
        : 'bg-white border-cyan-200/30'
    }`}>
      <div className={`border-b px-4 py-3 flex items-center gap-2 transition-all duration-300 ${
        isDark
          ? 'bg-gray-800/60 border-purple-600/30'
          : 'bg-slate-50 border-cyan-200/30'
      }`}>
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className={`ml-3 text-sm font-mono transition-colors duration-300 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>policy.json</span>
      </div>

      <div className={`flex-1 overflow-auto p-6 transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-slate-50'
      }`}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`font-mono text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-600' : 'text-gray-500'
              }`}
            >
              Generating policy...
            </motion.div>
          </div>
        ) : displayedCode ? (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-sm font-mono leading-relaxed transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {renderCodeWithSyntax(displayedCode, isDark)}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`inline-block w-2 h-4 ml-1 ${
                  isDark ? 'bg-purple-500' : 'bg-cyan-500'
                }`}
              />
            )}
          </motion.pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className={`text-4xl transition-colors duration-300 ${
                isDark ? 'text-gray-700' : 'text-gray-400'
              }`}>{'{ }'}</div>
              <p className={`font-mono text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-600' : 'text-gray-500'
              }`}>
                Your generated IAM policy will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

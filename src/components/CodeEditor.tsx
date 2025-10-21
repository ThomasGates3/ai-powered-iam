import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CodeEditorProps {
  policy: string | null;
  isLoading: boolean;
}

export default function CodeEditor({ policy, isLoading }: CodeEditorProps) {
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

  const renderCodeWithSyntax = (code: string) => {
    const lines = code.split('\n');
    return lines.map((line, index) => {
      let processedLine = line;

      processedLine = processedLine.replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:');
      processedLine = processedLine.replace(/: "([^"]+)"/g, ': <span class="text-green-400">"$1"</span>');
      processedLine = processedLine.replace(/: (\d+)/g, ': <span class="text-orange-400">$1</span>');
      processedLine = processedLine.replace(/: (true|false)/g, ': <span class="text-orange-400">$1</span>');
      processedLine = processedLine.replace(/(\[|\]|\{|\})/g, '<span class="text-gray-400">$1</span>');

      return (
        <div key={index} className="flex">
          <span className="text-gray-600 select-none w-10 flex-shrink-0 text-right pr-4">
            {index + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: processedLine }} />
        </div>
      );
    });
  };

  return (
    <div className="h-full bg-[#1e1e1e] rounded-lg border border-gray-800 shadow-2xl overflow-hidden flex flex-col">
      <div className="bg-[#2d2d2d] border-b border-gray-800 px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-3 text-sm text-gray-400 font-mono">policy.json</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-500 font-mono text-sm"
            >
              Generating policy...
            </motion.div>
          </div>
        ) : displayedCode ? (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-mono text-gray-300 leading-relaxed"
          >
            {renderCodeWithSyntax(displayedCode)}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-2 h-4 bg-blue-500 ml-1"
              />
            )}
          </motion.pre>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="text-gray-600 text-4xl">{'{ }'}</div>
              <p className="text-gray-500 font-mono text-sm">
                Your generated IAM policy will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { type Message } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import type { Components } from 'react-markdown';

function CopyButton({ codeText }: { codeText: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 不支持剪贴板 API 时静默失败
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-zinc-300/80 dark:bg-zinc-700/80 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {copied ? '已复制' : '复制'}
    </button>
  );
}

interface ChatMessageProps {
  message: Message;
}

const markdownComponents: Components = {
  // 代码块高亮 + 复制
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    const codeText = String(children).replace(/\n$/, '');
    return (
      <div className="relative group">
        <pre className="bg-zinc-200/70 dark:bg-zinc-800/70 rounded-lg p-4 my-3 overflow-x-auto">
          <code className={`${className} text-sm font-mono leading-relaxed`} {...props}>
            {children}
          </code>
        </pre>
        <CopyButton codeText={codeText} />
      </div>
    );
  },
  // 表格样式
  table: ({ children }) => (
    <div className="overflow-x-auto my-3">
      <table className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-600 text-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-zinc-300 dark:border-zinc-600 px-3 py-2">
      {children}
    </td>
  ),
  // 列表样式
  ul: ({ children }) => (
    <ul className="list-disc pl-6 my-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 my-2 space-y-1">{children}</ol>
  ),
  // 段落间距
  p: ({ children }) => (
    <p className="my-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  // 标题样式
  h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [expandedThinking, setExpandedThinking] = useState<string | null>(null);
  const toggleThinking = (id: string) => {
    setExpandedThinking(expandedThinking === id ? null : id);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-blue-100 dark:bg-blue-900' 
          : 'bg-green-100 dark:bg-green-900'
      }`}>
        <span className="text-sm">
          {isUser ? '👤' : '🤖'}
        </span>
      </div>
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div className={`px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
        }`}>
          <div className="text-sm leading-relaxed [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            {isUser ? (
              <>
                <span className="whitespace-pre-wrap">{message.content}</span>
              </>
            ) : (
              <>
                {message.thinking && (
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                    <button
                      onClick={() => toggleThinking(message.id)}
                      className="flex items-center gap-1 w-full text-left font-medium"
                    >
                      <span className={`transition-transform duration-200 ${expandedThinking === message.id ? 'rotate-90' : ''}`}>▶</span>
                      🤔 思考过程
                    </button>
                    {expandedThinking === message.id && (
                      <pre className="whitespace-pre-wrap text-xs mt-2">{message.thinking}</pre>
                    )}
                  </div>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={markdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </>
            )}
          </div>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 px-2">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

'use client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { type Message } from '@/lib/store';
import { formatTime } from '@/lib/utils';
import type { Components } from 'react-markdown';

/** 预处理 AI 回复内容，确保所有数学公式被正确识别 */
function preprocessMath(content: string): string {
  // 2) 将 [ LaTeX 内容 ]（含 \、^、_、{、}）转成独立一行的 $$ ... $$
  //    注意: 这需要放在前面，避免与已有 $$ 冲突
  content = content.replace(/\[([^\[\]]+)\]/g, (match, inner) => {
    if (/\\[a-zA-Z]+|[\\^{}_]/.test(inner)) {
      return `\n\n$$${inner.trim()}$$\n\n`;
    }
    return match;
  });

  // 3) 将行内混在文字中的 $$...$$（非独占一行）也移到独立一行
  content = content.replace(
    /([^\n])\s*\$\$([\s\S]*?)\$\$\s*/g,
    (_, before, inner) => {
      // 如果 before 是换行则不动，否则加换行分离
      if (before === '\n' || before === '') return _;
      return `${before}\n\n$$${inner.trim()}$$\n\n`;
    }
  );

  return content;
}

interface ChatMessageProps {
  message: Message;
}

const markdownComponents: Components = {
  // 代码块高亮
  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-zinc-200/70 dark:bg-zinc-800/70 rounded-lg p-4 my-3 overflow-x-auto">
        <code className={`${className} text-sm font-mono leading-relaxed`} {...props}>
          {children}
        </code>
      </pre>
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
              <span className="whitespace-pre-wrap">{message.content}</span>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {preprocessMath(message.content)}
              </ReactMarkdown>
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

'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore, type Message } from '@/lib/store';
import { useTranslations } from '@/lib/i18n';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useTheme } from '@/hooks/useTheme';

export default function Home() {
  useTheme();
  const lang = useChatStore(s => s.language);
  const t = useTranslations(lang);
  const { messages, isLoading, sendMessage, clearCurrentChat, error, stopGenerating } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 初始化数据
  useEffect(() => {
    useChatStore.getState().initialize();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;
    setInput('');
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  const handleClear = () => {
    clearCurrentChat();
    setInput('');
  };

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col h-full">
        <Header onClear={handleClear} />
        
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl">🤖</div>
              <h2 className="text-2xl font-semibold">Public Chat AI</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                {t('landingDescription')}
              </p>
              <div className="text-sm text-zinc-400 dark:text-zinc-500">
                {t('landingDataSaved')}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{t('requestFailed')}</p>
                  <p className="mt-1 whitespace-pre-wrap break-words">{error.split('────────────────────────────────────────')[0].trim()}</p>
                  {error.includes('─'.repeat(40)) && (
                    <>
                      <button
                        onClick={(e) => {
                          const detail = e.currentTarget.nextElementSibling;
                          if (detail) {
                            detail.classList.toggle('hidden');
                          }
                        }}
                        className="mt-2 text-xs underline hover:text-red-800 dark:hover:text-red-300"
                      >
                        查看详细日志 ▾
                      </button>
                      <pre className="hidden mt-2 p-3 bg-red-100 dark:bg-red-950/50 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                        {error.split('─'.repeat(40))[1]?.trim()}
                      </pre>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <button
                  onClick={() => window.location.reload()}
                  className="underline hover:text-red-800 dark:hover:text-red-300"
                >
                  刷新重试
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(error)}
                  className="underline hover:text-red-800 dark:hover:text-red-300"
                >
                  复制错误
                </button>
              </div>
            </div>
          )}
        </main>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
            onStop={() => stopGenerating()}
          />
          <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mt-2">
            对话记录保存在本地 · 无需登录 · 免费使用
          </p>
        </div>
      </div>
    </div>
  );
}

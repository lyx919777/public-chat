'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore, type Message } from '@/lib/store';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useTheme } from '@/hooks/useTheme';

export default function Home() {
  useTheme();
  const { messages, isLoading, sendMessage, clearCurrentChat, isSidebarOpen } = useChatStore();
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
    await sendMessage(content);
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
      <div 
        className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:ml-72' : ''
        }`}
      >
        <Header onClear={handleClear} />
        
        <main className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="text-6xl">🤖</div>
              <h2 className="text-2xl font-semibold">Public Chat AI</h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
                一个无需认证的公共 AI 聊天服务。输入你的问题，AI 会立即为你解答。
              </p>
              <div className="text-sm text-zinc-400 dark:text-zinc-500">
                对话记录保存在本地浏览器中
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
        </main>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading}
          />
          <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 mt-2">
            对话记录保存在本地 · 无需登录 · 免费使用
          </p>
        </div>
      </div>
    </div>
  );
}

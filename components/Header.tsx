'use client';

import { Moon, Sun, Trash2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface HeaderProps {
  onClear: () => void;
}

export function Header({ onClear }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl">💬</div>
        <div>
          <h1 className="font-semibold text-lg">Public Chat</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">AI 智能对话</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="切换主题"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          ) : (
            <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          )}
        </button>
        
        <button
          onClick={onClear}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="清空对话"
        >
          <Trash2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>
    </header>
  );
}

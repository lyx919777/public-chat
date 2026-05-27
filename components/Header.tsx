'use client';

import { Moon, Sun, Trash2, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/lib/store';

interface HeaderProps {
  onClear: () => void;
}

export function Header({ onClear }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, currentConversation } = useChatStore();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleSidebar()}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors md:hidden"
          aria-label="打开侧边栏"
        >
          <Menu className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>
        <div className="text-2xl">💬</div>
        <div>
          <h1 className="font-semibold text-lg">Public Chat</h1>
          {currentConversation && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]">
              {currentConversation.title}
            </p>
          )}
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

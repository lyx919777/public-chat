'use client';

import { Moon, Sun, Trash2, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useChatStore } from '@/lib/store';
import { useTranslations } from '@/lib/i18n';

interface HeaderProps {
  onClear: () => void;
}

export function Header({ onClear }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { currentConversation, availableModels, currentModel, setCurrentConversationModel } = useChatStore();
  const lang = useChatStore(s => s.language);
  const t = useTranslations(lang);
  const setLanguage = useChatStore(s => s.setLanguage);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
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
        {/* 模型选择器 */}
        {availableModels.length > 0 && (
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-700 dark:text-zinc-300"
            >
              <span className="max-w-[100px] truncate">{currentModel || t('selectModel')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 py-1">
                {availableModels.map((model) => (
                  <button
                    key={model}
                    onClick={() => {
                      setCurrentConversationModel(model);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${
                      model === currentModel
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {model}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={t('toggleTheme')}
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
          aria-label={t('clearChat')}
        >
          <Trash2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
        </button>

        <button
          onClick={() => setLanguage(lang === 'zh-CN' ? 'en' : 'zh-CN')}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-medium text-zinc-600 dark:text-zinc-400"
          aria-label={t('switchLang')}
        >
          {t('switchLang')}
        </button>
      </div>
    </header>
  );
}

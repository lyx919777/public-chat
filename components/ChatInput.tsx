'use client';

import { Send, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useChatStore } from '@/lib/store';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (content: string) => void;
  disabled: boolean;
  onStop?: () => void;
}

export function ChatInput({ value, onChange, onSubmit, disabled, onStop }: ChatInputProps) {
  const lang = useChatStore(s => s.language);
  const t = useTranslations(lang);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSubmit(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder')}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        {disabled ? (
          <button
            type="button"
            onClick={onStop}
            className="p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors flex-shrink-0"
          >
            <Square className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white transition-colors disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}

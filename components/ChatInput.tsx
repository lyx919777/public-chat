'use client';

import { Send, Paperclip, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (content: string, images?: string[]) => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
    // 清空 input 以便再次选择相同文件
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && (value.trim() || images.length > 0)) {
      onSubmit(value, images.length > 0 ? images : undefined);
      setImages([]);
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
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt={`预览 ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-zinc-300 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行)"
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="absolute right-2 bottom-2.5 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="submit"
          disabled={disabled || (!value.trim() && images.length === 0)}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white transition-colors disabled:cursor-not-allowed flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}

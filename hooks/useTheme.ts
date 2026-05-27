'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

let themeStore: { theme: Theme; listeners: Set<() => void> } | null = null;

function getThemeStore() {
  if (!themeStore) {
    // 服务端渲染时不访问 window，使用默认主题
    const defaultTheme: Theme = 'light';
    const stored = typeof window !== 'undefined' 
      ? (localStorage.getItem('theme') as Theme) 
      : null;
    const prefersDark = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-color-scheme: dark)').matches 
      : false;
    themeStore = {
      theme: stored || (prefersDark ? 'dark' : defaultTheme),
      listeners: new Set(),
    };
  }
  return themeStore;
}

export function useTheme() {
  const store = getThemeStore();
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    };

    applyTheme(store.theme);

    const listener = () => forceUpdate(n => n + 1);
    store.listeners.add(listener);

    return () => {
      store.listeners.delete(listener);
    };
  }, []);

  return {
    theme: store.theme,
    toggleTheme: () => {
      store.theme = store.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', store.theme);
      document.documentElement.classList.toggle('dark', store.theme === 'dark');
      store.listeners.forEach(l => l());
    },
  };
}

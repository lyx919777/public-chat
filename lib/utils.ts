import { getTranslations } from './i18n';
import { useChatStore } from './store';

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
  
  const lang = useChatStore.getState().language;
  const t = getTranslations(lang);
  
  const timeStr = date.toLocaleTimeString(lang === 'zh-CN' ? 'zh-CN' : 'en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  if (isToday) {
    return lang === 'zh-CN' ? `${t('today')} ${timeStr}` : timeStr;
  }
  
  if (isYesterday) {
    return lang === 'zh-CN' ? `${t('yesterday')} ${timeStr}` : `Yesterday ${timeStr}`;
  }
  
  if (lang === 'zh-CN') {
    return `${date.getMonth() + 1}${t('month')}${date.getDate()}${t('day')} ${timeStr}`;
  }
  return `${date.getMonth() + 1}/${date.getDate()} ${timeStr}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const lang = useChatStore.getState().language;
  const t = getTranslations(lang);
  if (lang === 'zh-CN') {
    return `${date.getFullYear()}${t('year')}${date.getMonth() + 1}${t('month')}${date.getDate()}${t('day')}`;
  }
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

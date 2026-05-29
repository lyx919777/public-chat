export type Language = 'zh-CN' | 'en';

type Dict = Record<string, string | ((...args: string[]) => string)>;

const translations: Record<Language, Dict> = {
  'zh-CN': {
    // Header
    selectModel: '选择模型',
    toggleTheme: '切换主题',
    clearChat: '清空对话',
    switchLang: 'English',

    // ChatInput
    inputPlaceholder: '输入消息... (Shift+Enter 换行)',

    // ChatMessage
    copy: '复制',
    copied: '已复制',
    thinkingLabel: '🤔 思考过程',
    tpsLabel: (tps: string) => `⚡ ${tps} tok/s`,

    // Sidebar
    chatHistory: '对话历史',
    newChat: '新建对话',
    confirmDelete: '确定要删除这个对话吗？',
    noConversations: '暂无对话',
    clickNewChatToStart: '点击"新建对话"开始聊天',
    rename: '重命名',
    delete: '删除',
    dataSavedLocally: '对话记录保存在本地浏览器中',

    // Page
    landingTitle: 'Public Chat AI',
    landingDescription: '一个无需认证的公共 AI 聊天服务。输入你的问题，AI 会立即为你解答。',
    landingDataSaved: '对话记录保存在本地浏览器中',
    requestFailed: '请求失败',
    viewDetails: '查看详细日志 ▾',
    refreshRetry: '刷新重试',
    copyError: '复制错误',
    footerText: '对话记录保存在本地 · 无需登录 · 免费使用',

    // Utils
    today: '今天',
    yesterday: '昨天',
    month: '月',
    day: '日',
    year: '年',
  },
  en: {
    // Header
    selectModel: 'Select model',
    toggleTheme: 'Toggle theme',
    clearChat: 'Clear chat',
    switchLang: '中文',

    // ChatInput
    inputPlaceholder: 'Type a message... (Shift+Enter for new line)',

    // ChatMessage
    copy: 'Copy',
    copied: 'Copied',
    thinkingLabel: '🤔 Thinking',
    tpsLabel: (tps: string) => `⚡ ${tps} tok/s`,

    // Sidebar
    chatHistory: 'Chat History',
    newChat: 'New Chat',
    confirmDelete: 'Are you sure you want to delete this conversation?',
    noConversations: 'No conversations',
    clickNewChatToStart: 'Click "New Chat" to start',
    rename: 'Rename',
    delete: 'Delete',
    dataSavedLocally: 'Data saved locally in your browser',

    // Page
    landingTitle: 'Public Chat AI',
    landingDescription: 'A public AI chat service with no authentication required. Ask anything and get instant answers.',
    landingDataSaved: 'Conversations are saved locally in your browser',
    requestFailed: 'Request Failed',
    viewDetails: 'View details ▾',
    refreshRetry: 'Refresh & Retry',
    copyError: 'Copy Error',
    footerText: 'Data saved locally · No login · Free to use',

    // Utils
    today: '',
    yesterday: '',
    month: '/',
    day: '',
    year: '/',
  },
};

export function useTranslations(lang: Language) {
  const dict = translations[lang];
  return (key: string, ...args: string[]): string => {
    const val = dict[key];
    if (val === undefined) return key;
    if (typeof val === 'function') return (val as (...a: string[]) => string)(...args);
    return val;
  };
}

export function getTranslations(lang: Language) {
  return (key: string, ...args: string[]): string => {
    const val = translations[lang][key];
    if (val === undefined) return key;
    if (typeof val === 'function') return (val as (...a: string[]) => string)(...args);
    return val;
  };
}

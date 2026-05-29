import { create } from 'zustand';
import { db, type Conversation, type Message as DBMessage } from '@/lib/db';

const abortControllers = new Map<string, AbortController>();

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  thinking?: string;
  tps?: number;
}

interface ChatStore {
  // 当前对话
  currentConversation: Conversation | null;
  // 所有对话列表
  conversations: Conversation[];
  // 当前对话的消息（从 messagesByConversation 同步）
  messages: Message[];
  // 当前对话的加载状态（从 loadingByConversation 同步）
  isLoading: boolean;
  // 当前对话的错误信息（从 errorByConversation 同步）
  error: string | null;

  // === 多对话并行 ===
  // 所有对话的消息（按 conversationId 索引）
  messagesByConversation: Record<string, Message[]>;
  // 所有对话的加载状态
  loadingByConversation: Record<string, boolean>;
  // 所有对话的错误信息
  errorByConversation: Record<string, string | null>;
  // 正在流式输出的对话 ID 列表
  streamingConversations: string[];

  // === 多模型 ===
  // 可用模型列表（从环境变量解析）
  availableModels: string[];
  // 当前选中的模型（在 Header 中显示）
  currentModel: string;
  // 按对话记忆的模型选择
  setCurrentConversationModel: (model: string) => void;

  // === 国际化 ===
  language: 'zh-CN' | 'en';
  setLanguage: (lang: 'zh-CN' | 'en') => void;

  // 初始化 - 加载对话列表和默认对话
  initialize: () => Promise<void>;

  // 创建新对话
  createNewConversation: () => Promise<Conversation>;

  // 切换对话
  selectConversation: (conversationId: string) => Promise<void>;

  // 更新对话标题
  renameConversation: (conversationId: string, title: string) => Promise<void>;

  // 删除对话
  deleteConversation: (conversationId: string) => Promise<void>;

  // 发送消息
  sendMessage: (content: string, images?: string[]) => Promise<void>;

  // 清除当前对话
  clearCurrentChat: () => void;

  // 停止生成
  stopGenerating: (conversationId?: string) => void;
}

// 将 DBMessage 转换为 Message
const toMessage = (msg: DBMessage): Message => ({
  id: msg.id,
  role: msg.role,
  content: msg.content,
  timestamp: msg.timestamp,
  thinking: msg.thinking,
  tps: msg.tps,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  currentConversation: null,
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,
  messagesByConversation: {},
  loadingByConversation: {},
  errorByConversation: {},
  streamingConversations: [],
  availableModels: [],
  currentModel: '',
  language: 'zh-CN',

  initialize: async () => {
    try {
      // 恢复语言设置
      const savedLang = localStorage.getItem('language');
      if (savedLang === 'en' || savedLang === 'zh-CN') {
        set({ language: savedLang });
      }

      // 加载对话列表
      const conversations = await db.getConversations();
      set({ conversations });

      // 从服务端获取可用模型
      try {
        const res = await fetch('/api/config');
        const config = await res.json();
        const models: string[] = config.models || [];
        set({ availableModels: models, currentModel: models[0] || '' });
      } catch (e) {
        console.error('获取模型列表失败:', e);
      }

      // 如果有对话，加载最新的；否则创建新对话
      if (conversations.length > 0) {
        const latest = conversations[0];
        await get().selectConversation(latest.id);
      } else {
        await get().createNewConversation();
      }
    } catch (error) {
      console.error('初始化失败:', error);
      set({ error: '初始化失败' });
    }
  },

  createNewConversation: async () => {
    try {
      const { currentModel } = get();
      const conversation = await db.createConversation('新对话');
      // 保存选中的模型到对话
      if (currentModel) {
        conversation.model = currentModel;
        await db.updateConversation(conversation);
      }
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversation.id]: [],
        },
        messages: [],
        isLoading: false,
        error: null,
      }));
      return conversation;
    } catch (error) {
      console.error('创建对话失败:', error);
      throw error;
    }
  },

  selectConversation: async (conversationId: string) => {
    try {
      const { conversations, messagesByConversation } = get();
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      // 如果该对话的消息不在内存中，从 DB 加载
      if (!messagesByConversation[conversationId]) {
        const dbMessages = await db.getMessagesByConversation(conversationId);
        const messages = dbMessages.map(toMessage);
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: messages,
          },
        }));
      }

      // 同步当前视图 + 恢复模型选择
      const model = conversation.model || get().availableModels[0] || '';
      set((state) => ({
        currentConversation: conversation,
        messages: state.messagesByConversation[conversationId] || [],
        isLoading: state.loadingByConversation[conversationId] || false,
        error: state.errorByConversation[conversationId] || null,
        currentModel: model,
      }));
    } catch (error) {
      console.error('切换对话失败:', error);
    }
  },

  renameConversation: async (conversationId: string, title: string) => {
    try {
      const conversations = get().conversations;
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      conversation.title = title;
      await db.updateConversation(conversation);

      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? conversation : c
        ),
      }));
    } catch (error) {
      console.error('重命名失败:', error);
    }
  },

  deleteConversation: async (conversationId: string) => {
    try {
      await db.deleteConversation(conversationId);

      set((state) => {
        const newConversations = state.conversations.filter(
          (c) => c.id !== conversationId
        );
        const isCurrent = state.currentConversation?.id === conversationId;

        // 清理 per-conversation 数据
        const newMsgMap = { ...state.messagesByConversation };
        const newLoadingMap = { ...state.loadingByConversation };
        const newErrorMap = { ...state.errorByConversation };
        delete newMsgMap[conversationId];
        delete newLoadingMap[conversationId];
        delete newErrorMap[conversationId];

        return {
          conversations: newConversations,
          currentConversation: isCurrent ? null : state.currentConversation,
          messages: isCurrent ? [] : state.messages,
          messagesByConversation: newMsgMap,
          loadingByConversation: newLoadingMap,
          errorByConversation: newErrorMap,
          streamingConversations: state.streamingConversations.filter((id) => id !== conversationId),
        };
      });

      // 如果删除的是当前对话，创建新对话
      if (get().currentConversation === null) {
        await get().createNewConversation();
      }
    } catch (error) {
      console.error('删除对话失败:', error);
    }
  },

  setCurrentConversationModel: (model: string) => {
    const { currentConversation, availableModels } = get();
    if (!availableModels.includes(model)) return;
    set({ currentModel: model });
    // 保存到当前对话
    if (currentConversation) {
      const updated = { ...currentConversation, model };
      db.updateConversation(updated).catch(console.error);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === currentConversation.id ? { ...c, model } : c
        ),
        currentConversation: updated,
      }));
    }
  },

  setLanguage: (lang: 'zh-CN' | 'en') => {
    set({ language: lang });
    localStorage.setItem('language', lang);
  },

  sendMessage: async (content: string) => {
    const { currentConversation } = get();
    if (!currentConversation) {
      await get().createNewConversation();
    }

    const conversation = get().currentConversation;
    if (!conversation) return;
    const convId = conversation.id;

    const userMessage: DBMessage = {
      id: crypto.randomUUID(),
      conversationId: convId,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // 保存到数据库
    await db.addMessage(userMessage);

    // 更新状态（按 conversationId）
    const userMsg = toMessage(userMessage);
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [convId]: [...(state.messagesByConversation[convId] || []), userMsg],
      },
      loadingByConversation: {
        ...state.loadingByConversation,
        [convId]: true,
      },
      errorByConversation: {
        ...state.errorByConversation,
        [convId]: null,
      },
      // 同步当前视图（如果是当前对话）
      ...(state.currentConversation?.id === convId
        ? {
            messages: [...(state.messagesByConversation[convId] || []), userMsg],
            isLoading: true,
            error: null,
          }
        : {}),
      streamingConversations: !state.streamingConversations.includes(convId)
        ? [...state.streamingConversations, convId]
        : state.streamingConversations,
    }));

    // 如果对话标题是默认的"新对话"，用第一条消息更新标题
    if (conversation.title === '新对话' && content.trim()) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      await get().renameConversation(conversation.id, title);
    }

    try {
      // 获取该对话的消息列表作为上下文
      const convMessages = get().messagesByConversation[convId] || [];
      const abortController = new AbortController();
      abortControllers.set(convId, abortController);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
        body: JSON.stringify({
          messages: convMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          model: conversation.model || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const statusText = `[${response.status}]`;
        const brief = errorData.error || `API 请求失败 ${statusText}`;
        let fullMsg = brief;
        if (errorData.details) {
          fullMsg += `\n\n${'─'.repeat(40)}\n${errorData.details}`;
        }
        throw new Error(fullMsg);
      }

      // 读取流式 SSE 响应
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      // 先创建一个占位消息，后续逐步更新内容
      const assistantMessageId = crypto.randomUUID();
      const placeholderMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      set((state) => {
        const newMsgs = [...(state.messagesByConversation[convId] || []), placeholderMessage];
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [convId]: newMsgs,
          },
          ...(state.currentConversation?.id === convId ? { messages: newMsgs } : {}),
        };
      });

      let accumulatedContent = '';
      let accumulatedThinking = '';
      let tokenCount = 0;
      let firstTokenTime = 0;
      const buffer: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer.push(chunk);

        // 解析 SSE 行
        const lines = buffer.join('').split('\n');
        buffer.length = 0;

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              const reasoning = parsed.choices?.[0]?.delta?.reasoning_content;
              if (delta) {
                if (firstTokenTime === 0) {
                  firstTokenTime = Date.now();
                }
                accumulatedContent += delta;
                tokenCount++;
              }
              if (reasoning) {
                accumulatedThinking += reasoning;
              }
              if (delta || reasoning) {
                // 每收到一段增量就更新 UI
                const updatedMsg = {
                  ...placeholderMessage,
                  content: accumulatedContent,
                  thinking: accumulatedThinking || undefined,
                };
                set((state) => {
                  const convMsgs = state.messagesByConversation[convId] || [];
                  const newConvMsgs = convMsgs.map((msg) =>
                    msg.id === assistantMessageId ? updatedMsg : msg
                  );
                  return {
                    messagesByConversation: {
                      ...state.messagesByConversation,
                      [convId]: newConvMsgs,
                    },
                    ...(state.currentConversation?.id === convId
                      ? { messages: newConvMsgs }
                      : {}),
                  };
                });
              }
            } catch {
              // 跳过无法解析的行
            }
          }
        }
        // 保留最后一个可能不完整的行
        const lastLine = lines[lines.length - 1].trim();
        if (lastLine.length > 0) {
          buffer.push(lastLine);
        }
      }

      abortControllers.delete(convId);

      // 计算 TPS
      let tps: number | undefined;
      if (firstTokenTime > 0 && tokenCount > 0) {
        const elapsedMs = Date.now() - firstTokenTime;
        if (elapsedMs > 0) {
          tps = Math.round((tokenCount / elapsedMs) * 1000 * 10) / 10;
        }
      }

      // 流结束后，检查 content 中是否有 ```thinking...``` 标签，提取并剥离
      const T3 = '```';
      const thinkPattern = new RegExp(`${T3}thinking\\n([\\s\\S]*?)${T3}`, 'g');
      const thinkMatch = thinkPattern.exec(accumulatedContent);
      let finalThinking = accumulatedThinking || undefined;
      let finalContent = accumulatedContent;
      if (thinkMatch) {
        finalThinking = (finalThinking ? finalThinking + '\n' : '') + thinkMatch[1].trim();
        finalContent = accumulatedContent.replace(thinkPattern, '').trim();
      }

      // 保存完整消息到数据库
      const assistantMessage: DBMessage = {
        id: assistantMessageId,
        conversationId: convId,
        role: 'assistant',
        content: finalContent,
        timestamp: Date.now(),
        thinking: finalThinking,
        tps,
      };
      await db.addMessage(assistantMessage);

      // 更新 UI 为最终内容
      const finalUpdatedMsg = {
        ...placeholderMessage,
        content: finalContent,
        thinking: finalThinking,
        tps,
      };
      set((state) => {
        const convMsgs = state.messagesByConversation[convId] || [];
        const newConvMsgs = convMsgs.map((msg) =>
          msg.id === assistantMessageId ? finalUpdatedMsg : msg
        );
        const isCurrent = state.currentConversation?.id === convId;
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [convId]: newConvMsgs,
          },
          loadingByConversation: {
            ...state.loadingByConversation,
            [convId]: false,
          },
          streamingConversations: state.streamingConversations.filter((id) => id !== convId),
          ...(isCurrent
            ? { messages: newConvMsgs, isLoading: false }
            : {}),
        };
      });
    } catch (error) {
      abortControllers.delete(convId);
      // 用户主动停止，不显示错误
      if ((error as Error)?.name === 'AbortError') {
        // 恢复 UI 状态（不显示错误）
        set((state) => ({
          loadingByConversation: {
            ...state.loadingByConversation,
            [convId]: false,
          },
          streamingConversations: state.streamingConversations.filter((id) => id !== convId),
          ...(state.currentConversation?.id === convId
            ? { isLoading: false }
            : {}),
        }));
        return;
      }
      const msg = error instanceof Error ? error.message : String(error);
      console.error('发送消息失败:', msg);
      set((state) => ({
        loadingByConversation: {
          ...state.loadingByConversation,
          [convId]: false,
        },
        errorByConversation: {
          ...state.errorByConversation,
          [convId]: msg,
        },
        streamingConversations: state.streamingConversations.filter((id) => id !== convId),
        ...(state.currentConversation?.id === convId
          ? { isLoading: false, error: msg }
          : {}),
      }));
    }
  },

  clearCurrentChat: async () => {
    const { currentConversation } = get();
    if (!currentConversation) return;
    const convId = currentConversation.id;
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [convId]: [],
      },
      messages: [],
      error: null,
      errorByConversation: {
        ...state.errorByConversation,
        [convId]: null,
      },
    }));
  },

  // 停止生成
  stopGenerating: (conversationId?: string) => {
    const id = conversationId || get().currentConversation?.id;
    if (!id) return;
    const controller = abortControllers.get(id);
    if (controller) {
      controller.abort();
      abortControllers.delete(id);
    }
    // 恢复 UI 状态
    set((state) => ({
      loadingByConversation: { ...state.loadingByConversation, [id]: false },
      streamingConversations: state.streamingConversations.filter((c) => c !== id),
      ...(state.currentConversation?.id === id ? { isLoading: false } : {}),
    }));
  },
}));

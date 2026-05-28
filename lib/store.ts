import { create } from 'zustand';
import { db, type Conversation, type Message as DBMessage } from '@/lib/db';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatStore {
  // 当前对话
  currentConversation: Conversation | null;
  // 所有对话列表
  conversations: Conversation[];
  // 当前对话的消息
  messages: Message[];
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;
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
  sendMessage: (content: string) => Promise<void>;

  // 清除当前对话
  clearCurrentChat: () => void;
}

// 将 DBMessage 转换为 Message
const toMessage = (msg: DBMessage): Message => ({
  id: msg.id,
  role: msg.role,
  content: msg.content,
  timestamp: msg.timestamp,
});

export const useChatStore = create<ChatStore>((set, get) => ({
  currentConversation: null,
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      // 加载对话列表
      const conversations = await db.getConversations();
      set({ conversations });

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
      const conversation = await db.createConversation('新对话');
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
      }));
      return conversation;
    } catch (error) {
      console.error('创建对话失败:', error);
      throw error;
    }
  },

  selectConversation: async (conversationId: string) => {
    try {
      const conversations = get().conversations;
      const conversation = conversations.find((c) => c.id === conversationId);
      if (!conversation) return;

      // 加载该对话的消息
      const dbMessages = await db.getMessagesByConversation(conversationId);
      const messages = dbMessages.map(toMessage);

      set({
        currentConversation: conversation,
        messages,
      });
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
        const currentConversation =
          state.currentConversation?.id === conversationId
            ? null
            : state.currentConversation;

        return {
          conversations: newConversations,
          currentConversation,
          messages:
            state.currentConversation?.id === conversationId ? [] : state.messages,
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

  sendMessage: async (content: string) => {
    const { currentConversation } = get();
    if (!currentConversation) {
      // 如果没有当前对话，创建一个
      await get().createNewConversation();
    }

    const conversation = get().currentConversation;
    if (!conversation) return;

    const userMessage: DBMessage = {
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // 保存到数据库
    await db.addMessage(userMessage);

    // 更新状态
    set((state) => ({
      messages: [...state.messages, toMessage(userMessage)],
      isLoading: true,
      error: null,
    }));

    // 如果对话标题是默认的"新对话"，用第一条消息更新标题
    if (conversation.title === '新对话' && content.trim()) {
      const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
      await get().renameConversation(conversation.id, title);
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: get().messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API 请求失败 (${response.status})`);
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
      set((state) => ({
        messages: [...state.messages, placeholderMessage],
      }));

      let accumulatedContent = '';
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
              if (delta) {
                accumulatedContent += delta;
                // 每收到一段增量就更新 UI
                set((state) => ({
                  messages: state.messages.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ),
                }));
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

      // 流结束，保存完整消息到数据库
      const assistantMessage: DBMessage = {
        id: assistantMessageId,
        conversationId: conversation.id,
        role: 'assistant',
        content: accumulatedContent,
        timestamp: Date.now(),
      };
      await db.addMessage(assistantMessage);

      set({ isLoading: false });
    } catch (error) {
      set((state) => ({
        isLoading: false,
        error: error instanceof Error ? error.message : '未知错误',
      }));
    }
  },

  clearCurrentChat: async () => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    // 删除当前对话的所有消息
    const messages = await db.getMessagesByConversation(currentConversation.id);
    for (const msg of messages) {
      await db.deleteMessage(msg.id);
    }

    set({ messages: [], error: null });
  },
}));

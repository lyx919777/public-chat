// IndexedDB 存储层 - 用于本地保存对话历史
const DB_NAME = 'public-chat-db';
const DB_VERSION = 1;
const STORE_CONVERSATIONS = 'conversations';
const STORE_MESSAGES = 'messages';

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  tps?: number;
  timestamp: number;
}

class DB {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 对话存储
        if (!db.objectStoreNames.contains(STORE_CONVERSATIONS)) {
          const conversationStore = db.createObjectStore(STORE_CONVERSATIONS, {
            keyPath: 'id',
          });
          conversationStore.createIndex('updatedAt', 'updatedAt', {
            unique: false,
          });
        }

        // 消息存储
        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const messageStore = db.createObjectStore(STORE_MESSAGES, {
            keyPath: 'id',
          });
          messageStore.createIndex('conversationId', 'conversationId', {
            unique: false,
          });
          messageStore.createIndex('timestamp', 'timestamp', {
            unique: false,
          });
        }
      };
    });
  }

  async createConversation(title: string): Promise<Conversation> {
    const db = await this.init();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title: title || '新对话',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONVERSATIONS, 'readwrite');
      const store = tx.objectStore(STORE_CONVERSATIONS);
      const request = store.add(conversation);
      request.onsuccess = () => resolve(conversation);
      request.onerror = () => reject(request.error);
    });
  }

  async updateConversation(conversation: Conversation): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONVERSATIONS, 'readwrite');
      const store = tx.objectStore(STORE_CONVERSATIONS);
      const request = store.put(conversation);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const db = await this.init();

    // 先删除相关消息
    const messages = await this.getMessagesByConversation(conversationId);
    for (const msg of messages) {
      await this.deleteMessage(msg.id);
    }

    // 再删除对话
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONVERSATIONS, 'readwrite');
      const store = tx.objectStore(STORE_CONVERSATIONS);
      const request = store.delete(conversationId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getConversations(): Promise<Conversation[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONVERSATIONS, 'readonly');
      const store = tx.objectStore(STORE_CONVERSATIONS);
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev');
      const results: Conversation[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addMessage(message: Message): Promise<void> {
    const db = await this.init();

    // 更新对话的 updatedAt
    const conversations = await this.getConversations();
    const conversation = conversations.find((c) => c.id === message.conversationId);
    if (conversation) {
      conversation.updatedAt = Date.now();
      await this.updateConversation(conversation);
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = tx.objectStore(STORE_MESSAGES);
      const request = store.add(message);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readonly');
      const store = tx.objectStore(STORE_MESSAGES);
      const index = store.index('conversationId');
      const request = index.openCursor(IDBKeyRange.only(conversationId));
      const results: Message[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          // 按时间排序
          results.sort((a, b) => a.timestamp - b.timestamp);
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteMessage(messageId: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readwrite');
      const store = tx.objectStore(STORE_MESSAGES);
      const request = store.delete(messageId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(
        [STORE_CONVERSATIONS, STORE_MESSAGES],
        'readwrite'
      );

      tx.objectStore(STORE_CONVERSATIONS).clear();
      tx.objectStore(STORE_MESSAGES).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new DB();

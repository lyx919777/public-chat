# Public Chat - AI 智能对话

一个无需认证的公共 AI 聊天网站，支持 OpenAI API 接入，可部署到 Vercel。

## 功能特性

- 🤖 无需登录认证，直接使用
- 💬 支持流式对话（基于 Vercel AI SDK）
- 🌓 明暗主题切换
- 📱 响应式设计，适配移动端
- 🔒 隐私保护，对话内容不保存
- 🚀 一键部署到 Vercel

## 技术栈

- **Next.js 16** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS
- **Vercel AI SDK** - AI 流式处理
- **Zustand** - 状态管理

## 环境变量配置

在 Vercel 或本地 `.env.local` 文件中配置：

```env
# OpenAI API 配置（必填）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，自定义 API 地址（用于代理或兼容 API）
OPENAI_MODEL=gpt-4o-mini  # 可选，默认 gpt-4o-mini
OPENAI_SYSTEM_PROMPT=你是一个友好、专业的 AI 助手。请用简洁明了的中文回答用户的问题。  # 可选

# 自定义配置（可选）
NEXT_PUBLIC_APP_NAME=Public Chat
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 部署到 Vercel

1. 点击 [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/public-chat&env=OPENAI_API_KEY,OPENAI_MODEL,OPENAI_SYSTEM_PROMPT)
2. 连接你的 GitHub 仓库
3. 配置环境变量
4. 点击 Deploy

## 项目结构

```
public-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI 聊天 API
│   ├── globals.css           # 全局样式
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 主页面
├── components/
│   ├── ChatInput.tsx         # 输入框组件
│   ├── ChatMessage.tsx       # 消息组件
│   └── Header.tsx            # 头部组件
├── hooks/
│   └── useTheme.ts           # 主题切换 Hook
├── lib/
│   ├── store.ts              # Zustand 状态管理
│   └── utils.ts              # 工具函数
└── public/                   # 静态资源
```

## 安全考虑

- 所有 API 调用通过后端路由，不暴露 API 密钥
- 使用 Edge Runtime 提高性能
- 无用户认证，适合公开访问

## 许可证

MIT

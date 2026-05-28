# Public Chat - AI Chat

An open-source AI chat website with no authentication required. Supports OpenAI API integration and one-click deployment to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lyx919777/public-chat&env=OPENAI_API_KEY,OPENAI_BASE_URL,OPENAI_MODEL)

---

## Features

- 🤖 No login required, use directly
- 💬 Multi-turn conversation with history
- 🌓 Dark / Light theme toggle
- 📱 Responsive design, mobile-friendly
- 💾 Local conversation storage (IndexedDB)
- 🚀 One-click deploy to Vercel
- ⚡ Edge Runtime, fast response

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **IndexedDB** - Local data persistence

## Environment Variables

Configure in Vercel or local `.env.local` file:

```env
# OpenAI API Configuration (required)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional
OPENAI_BASE_URL=https://api.openai.com/v1   # Custom API endpoint (proxy or compatible API)
OPENAI_MODEL=gpt-4o-mini                     # Model name, default: gpt-4o-mini
OPENAI_SYSTEM_PROMPT=You are a helpful, friendly AI assistant.  # System prompt

# Customization
NEXT_PUBLIC_APP_NAME=Public Chat             # Website name
```

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deploy to Vercel

1. Click the **Deploy** button above or import your GitHub repository
2. Configure environment variables (`OPENAI_API_KEY` is required)
3. Click Deploy

## Project Structure

```
public-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # AI Chat API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── ChatInput.tsx         # Input component
│   ├── ChatMessage.tsx       # Message component
│   ├── Header.tsx            # Header component
│   ├── SearchDialog.tsx      # Conversation search dialog
│   └── Sidebar.tsx           # Sidebar
├── hooks/
│   └── useTheme.ts           # Theme toggle hook
├── lib/
│   ├── db.ts                 # IndexedDB database
│   ├── store.ts              # Zustand state management
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## Security

- All API calls go through backend routes, API keys are never exposed
- Conversation data is stored only in the browser locally
- Edge Runtime for better performance
- No user authentication, suitable for public access

## License

MIT

---

## 中文 / Chinese

# Public Chat - AI 智能对话

一个无需认证的公共 AI 聊天网站，支持 OpenAI API 接入，可部署到 Vercel。

### 功能特性

- 🤖 无需登录认证，直接使用
- 💬 多轮对话，历史记录保存
- 🌓 明暗主题切换
- 📱 响应式设计，适配移动端
- 💾 本地存储对话历史（IndexedDB）
- 🚀 一键部署到 Vercel
- ⚡ Edge Runtime，极速响应

### 环境变量配置

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # 必填
OPENAI_BASE_URL=https://api.openai.com/v1            # 可选，自定义 API 地址
OPENAI_MODEL=gpt-4o-mini                             # 可选，模型名称
OPENAI_SYSTEM_PROMPT=你是一个友好的 AI 助手。        # 可选，系统提示词
NEXT_PUBLIC_APP_NAME=Public Chat                     # 可选，网站名称
```

### 本地开发

```bash
npm install
npm run dev
```

### 部署

点击上方 Deploy 按钮或导入 GitHub 仓库，配置 `OPENAI_API_KEY` 即可部署。

---

## Français / French

# Public Chat - Chat IA

Un site de chat IA open source sans authentification. Compatible avec l'API OpenAI, déployable en un clic sur Vercel.

### Fonctionnalités

- 🤖 Aucune connexion requise
- 💬 Conversations multi-tours avec historique
- 🌓 Thème clair / sombre
- 📱 Design responsive
- 💾 Stockage local des conversations (IndexedDB)
- 🚀 Déploiement en un clic sur Vercel
- ⚡ Edge Runtime, réponse rapide

### Variables d'environnement

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   # Requis
OPENAI_BASE_URL=https://api.openai.com/v1            # Optionnel
OPENAI_MODEL=gpt-4o-mini                             # Optionnel
OPENAI_SYSTEM_PROMPT=Vous êtes un assistant IA amical.  # Optionnel
NEXT_PUBLIC_APP_NAME=Public Chat                     # Optionnel
```

### Développement local

```bash
npm install
npm run dev
```

### Déploiement

Cliquez sur le bouton Deploy ci-dessus ou importez votre dépôt GitHub, puis configurez `OPENAI_API_KEY`.

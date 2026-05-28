# Public Chat - AI 智能对话

[English](README.md) | [Français](README.fr.md)

---

一个无需认证的公共 AI 聊天网站，支持 OpenAI API 接入，可部署到 Vercel。

## 功能特性

- 🤖 无需登录认证，直接使用
- 💬 多轮对话，历史记录保存
- 🌓 明暗主题切换
- 📱 响应式设计，适配移动端
- 💾 本地存储对话历史（IndexedDB）
- 🚀 一键部署到 Vercel
- ⚡ Edge Runtime，极速响应

## 技术栈

- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 原子化 CSS
- **Zustand** - 状态管理
- **IndexedDB** - 本地数据持久化

## 环境变量配置

在 Vercel 或本地 `.env.local` 文件中配置：

```env
# OpenAI API 配置（必填）
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 可选配置
OPENAI_BASE_URL=https://api.openai.com/v1   # 自定义 API 地址（用于代理或兼容 API）
OPENAI_MODEL=gpt-4o-mini                     # 模型名称，默认 gpt-4o-mini
OPENAI_SYSTEM_PROMPT=你是一个友好、专业的 AI 助手。请用简洁的中文回答。  # 系统提示词

# 自定义配置
NEXT_PUBLIC_APP_NAME=Public Chat             # 网站名称
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

1. 点击 [README.md](README.md) 顶部的 **Deploy** 按钮或导入你的 GitHub 仓库
2. 配置环境变量（`OPENAI_API_KEY` 为必填项）
3. 点击 Deploy 即可

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
│   ├── Header.tsx            # 头部组件
│   ├── SearchDialog.tsx      # 搜索对话弹窗
│   └── Sidebar.tsx           # 侧边栏
├── hooks/
│   └── useTheme.ts           # 主题切换 Hook
├── lib/
│   ├── db.ts                 # IndexedDB 数据库
│   ├── store.ts              # Zustand 状态管理
│   └── utils.ts              # 工具函数
└── public/                   # 静态资源
```

## 安全考虑

- 所有 API 调用通过后端路由，不暴露 API 密钥
- 对话数据仅存储在浏览器本地
- 使用 Edge Runtime 提高性能
- 无用户认证，适合公开访问

## 许可证

MIT

---

> 由 [AtomCode](https://atomgit.com) + [CodingPlan](https://atomgit.com) 构建 · AI 智能体 · 2025 年 3 月

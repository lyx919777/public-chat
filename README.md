# Public Chat - AI Chat

An open-source AI chat website with no authentication required. Supports OpenAI API integration and one-click deployment to Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lyx919777/public-chat&env=OPENAI_API_KEY,OPENAI_BASE_URL,OPENAI_MODEL)

> [🇨🇳 中文](README.zh.md) | [🇫🇷 Français](README.fr.md)

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

> Built by [AtomCode](https://atomgit.com) + [CodingPlan](https://atomgit.com) · AI Agent · March 2025

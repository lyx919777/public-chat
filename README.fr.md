# Public Chat - Chat IA

[🇨🇳 中文](README.zh.md) | [English](README.md)

---

Un site de chat IA open source sans authentification. Compatible avec l'API OpenAI, déployable en un clic sur Vercel.

## Fonctionnalités

- 🤖 Aucune connexion requise, utilisation immédiate
- 💬 Conversations multi-tours avec historique
- 🌓 Thème clair / sombre
- 📱 Design responsive, adapté aux mobiles
- 💾 Stockage local des conversations (IndexedDB)
- 🚀 Déploiement en un clic sur Vercel
- ⚡ Edge Runtime, réponse rapide

## Stack Technique

- **Next.js 15** - Framework React
- **TypeScript** - Sécurité des types
- **Tailwind CSS** - CSS utilitaire
- **Zustand** - Gestion d'état
- **IndexedDB** - Persistance locale des données

## Variables d'environnement

Configurez dans Vercel ou le fichier local `.env.local` :

```env
# Configuration OpenAI API (requis)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optionnel
OPENAI_BASE_URL=https://api.openai.com/v1   # Endpoint API personnalisé (proxy ou API compatible)
OPENAI_MODEL=gpt-4o-mini                     # Nom du modèle, défaut: gpt-4o-mini
OPENAI_SYSTEM_PROMPT=Vous êtes un assistant IA amical et serviable.  # Prompt système

# Personnalisation
NEXT_PUBLIC_APP_NAME=Public Chat             # Nom du site
```

## Développement local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Démarrer le serveur de production
npm start
```

## Déploiement sur Vercel

1. Cliquez sur le bouton **Deploy** en haut du [README.md](README.md) ou importez votre dépôt GitHub
2. Configurez les variables d'environnement (`OPENAI_API_KEY` est requis)
3. Cliquez sur Deploy

## Structure du projet

```
public-chat/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # Point d'accès API du chat
│   ├── globals.css           # Styles globaux
│   ├── layout.tsx            # Layout racine
│   └── page.tsx              # Page principale
├── components/
│   ├── ChatInput.tsx         # Composant de saisie
│   ├── ChatMessage.tsx       # Composant de message
│   ├── Header.tsx            # Composant d'en-tête
│   ├── SearchDialog.tsx      # Boîte de dialogue de recherche
│   └── Sidebar.tsx           # Barre latérale
├── hooks/
│   └── useTheme.ts           # Hook de thème
├── lib/
│   ├── db.ts                 # Base de données IndexedDB
│   ├── store.ts              # Gestion d'état Zustand
│   └── utils.ts              # Fonctions utilitaires
└── public/                   # Ressources statiques
```

## Sécurité

- Tous les appels API passent par les routes backend, les clés API ne sont jamais exposées
- Les conversations sont stockées uniquement localement dans le navigateur
- Edge Runtime pour de meilleures performances
- Pas d'authentification, adapté à un accès public

## Licence

MIT

---

> Construit par [AtomCode](https://atomgit.com) + [CodingPlan](https://atomgit.com) · Agent IA · Mars 2025

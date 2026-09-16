# 🎧 VibeHai

### A modern, immersive music streaming experience built for your vibe.

VibeHai is a modern music streaming web application inspired by the experience of today's popular music platforms.

It combines a sleek dark interface, real music discovery, persistent personal libraries, playlists, and a full-featured audio player into a focused and responsive web experience.

> **Discover music. Build your library. Play your vibe.**

---

## ✨ Highlights

* 🎵 **Real music discovery** powered by a JioSaavn-compatible API
* 🔎 **Instant music search** for songs, artists, and albums
* ▶️ **Full audio playback** using the browser's native HTML5 Audio API
* ⏭️ **Queue-based playback** with next / previous controls
* 🎚️ **Seek, volume and mute controls**
* ❤️ **Liked Songs** with persistent local storage
* 📚 **Personal Library** for playlists, songs, albums and artists
* 🎶 **Custom playlist creation**
* 🗑️ **Playlist management** including rename and delete
* 💾 **Local persistence** — personal data stays in the browser
* 📱 **Responsive layout** designed for desktop and mobile
* ✨ **Smooth motion and micro-interactions**
* 🌌 **Immersive dark UI** with gradient accents and ambient visuals
* ♿ **Keyboard-friendly focus states and reduced-motion support**

---

## 🖼️ Experience

VibeHai is designed around a music-first experience rather than a traditional dashboard.

### Home

Discover curated sections such as:

* Quick Picks
* Made For You
* Trending Now
* Fresh Vibes
* Pick Your Mood
* Recently Played

The home experience combines curated content with live music data to make discovery feel dynamic.

### Search

Search for music directly from the application.

Results are fetched from the configured music API, normalized into a consistent internal song format, and presented through reusable music cards.

### Library

Your personal music space includes:

* Playlists
* Songs
* Albums
* Artists
* Sorting controls
* Playlist creation and management

### Liked Songs

Save tracks you enjoy and access them later from a dedicated collection.

You can:

* Like / unlike songs
* Play an individual track
* Play all liked songs
* Continue using your saved collection after refreshing the page

---

## 🎵 Audio Player

VibeHai includes a persistent music player powered by the browser's native HTML5 Audio API.

The player supports:

* Play / pause
* Next track
* Previous track
* Automatic next-track playback
* Playback queue
* Progress tracking
* Seeking
* Volume control
* Mute / unmute
* Playback error handling

The player is managed through a dedicated React context so playback state can be shared across the application.

---

## 💾 Local-First Personalization

VibeHai does not require an account for personal library features.

Liked songs and playlists are stored using the browser's `localStorage`.

This means your personal library can persist between sessions without requiring a traditional backend database.

Stored data includes:

```text
Liked Songs
Playlists
```

> Your local library is tied to the browser/device where it was created.

---

## 🧠 Architecture

VibeHai uses a component-based React architecture with dedicated contexts for application state.

```text
src/
├── components/
│   ├── layouts/
│   ├── music/
│   └── player/
│
├── context/
│   ├── PlayerContext.jsx
│   ├── PlaylistContext.jsx
│   └── LibraryContext.jsx
│
├── data/
├── hooks/
├── pages/
│   ├── Home.jsx
│   ├── Search.jsx
│   ├── Library.jsx
│   └── LikedSongs.jsx
│
├── services/
│   └── jiosaavn.js
│
├── utils/
│   ├── normalizeSong.js
│   └── storage.js
│
├── App.jsx
├── main.jsx
└── index.css
```

### State Architecture

| Context           | Responsibility                         |
| ----------------- | -------------------------------------- |
| `PlayerContext`   | Audio playback, queue and player state |
| `PlaylistContext` | Playlist creation and management       |
| `LibraryContext`  | Liked songs and favorites              |

Small wrapper hooks provide convenient access to these contexts throughout the application.

---

## 🛠️ Tech Stack

### Frontend

* **React 19**
* **Vite 8**
* **JavaScript (ES Modules)**
* **React Router 7**

### Styling

* **Tailwind CSS 4**
* Custom CSS design tokens
* Responsive layouts
* CSS gradients and ambient effects

### UI & Motion

* **Lucide React** — icons
* **Framer Motion** — animations and transitions

### Audio

* **HTML5 Audio API**

### Data & Persistence

* JioSaavn-compatible music API
* Browser `localStorage`

The current package configuration uses React 19, Vite 8, Tailwind CSS 4, React Router 7, Framer Motion and Lucide React.

---

## 🔌 Music Data

VibeHai uses a configurable music API endpoint for search.

The default endpoint is:

```text
https://saavnapi-nine.vercel.app
```

The application can also use a custom endpoint through:

```env
VITE_JIOSAAVN_API=your-api-endpoint
```

Search requests are made through the application's service layer and normalized into a consistent song structure before reaching the UI.

### Song Model

Internally, music data is normalized into fields such as:

```text
id
title
artist
album
cover
audioUrl
duration
genre
year
liked
```

This keeps the UI independent from the exact response structure of the external API.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

* Node.js 18+
* npm

### Installation

```bash
git clone https://github.com/ashutoshpalhare/VibeHai.git

cd VibeHai

npm install
```

### Start Development Server

```bash
npm run dev
```

Vite will start the development server and provide the local URL in your terminal.

---

## 📦 Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root if you want to configure a custom music API:

```env
VITE_JIOSAAVN_API=https://your-api-endpoint
```

If the variable is not provided, VibeHai falls back to its configured default API endpoint.

---

## 🎨 Design System

VibeHai follows a dark, immersive visual language built around:

* Near-black surfaces
* Violet accents
* Cyan highlights
* Magenta gradients
* Soft borders
* Glass-like surfaces
* Ambient background effects
* Large typography
* Rounded interactive components

The design system is built with reusable CSS variables and utility classes rather than relying entirely on one-off styles.

Typography uses:

* **DM Sans** for primary interface text
* **Space Grotesk** for display typography

---

## 📱 Responsive Experience

The interface is designed to adapt across:

* Desktop
* Laptop
* Tablet
* Mobile

The application includes dedicated desktop/mobile navigation patterns and responsive music layouts.

The UI also respects the user's `prefers-reduced-motion` setting to reduce animation for users who request less motion.

---

## 🔐 Privacy & Data

VibeHai does not currently require:

* User accounts
* Authentication
* A traditional application database

Personal library data such as liked songs and playlists is stored locally in the browser using `localStorage`.

Music discovery and playback may communicate with the configured external music service.

---

## 🗺️ Current Routes

| Route      | Description            |
| ---------- | ---------------------- |
| `/`        | Home / music discovery |
| `/search`  | Search music           |
| `/library` | Personal library       |
| `/liked`   | Liked songs            |

Routing is handled using React Router.

---

## 🚧 Project Status

VibeHai is an actively evolving frontend project.

The current focus is on improving:

* Music discovery
* Playback experience
* Library management
* Playlist workflows
* Responsive UX
* Visual polish
* Reliability and edge-case handling

Future improvements may include deeper personalization, richer playlist experiences, improved discovery flows, and additional music-platform functionality.

---

## 🤝 Contributing

Contributions, suggestions and improvements are welcome.

### Contribution workflow

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Run the available checks

```bash
npm run lint
npm run build
```

5. Commit your changes

```bash
git commit -m "feat: add your feature"
```

6. Push your branch

```bash
git push origin feature/your-feature
```

7. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ashutosh Palhare**

Built with React, modern web technologies, and a passion for creating polished developer projects.

* GitHub: [@ashutoshpalhare](https://github.com/ashutoshpalhare)

---

## ⭐ Support

If you find VibeHai interesting or useful:

* ⭐ Star the repository
* 🐛 Report bugs
* 💡 Suggest improvements
* 🔧 Contribute improvements
* 📢 Share the project

---

<div align="center">

### 🎧 Find your vibe. Press play. Repeat.

**VibeHai** — Music, reimagined for the modern web.

</div>

# 🎵 VibeHai

> **A modern, local-first music streaming experience built with React, TypeScript, and Vite.**

VibeHai is a modern Spotify-inspired music player focused on a clean listening experience, powerful queue management, persistent preferences, and a responsive interface.

It combines a polished React UI with a flexible JioSaavn-compatible API layer, client-side persistence, advanced playback controls, and PWA capabilities — while keeping the project simple enough to understand and extend.

---

## ✨ Features

### 🎧 Music Discovery

* Search songs, albums, artists, and playlists
* Discover curated music shelves
* Album, artist, and playlist detail pages
* Dedicated discovery experience
* Responsive media cards and song lists

### ▶️ Advanced Music Player

* Play / pause
* Previous / next track
* Seekable progress bar
* Volume control and mute
* Shuffle
* Repeat: Off / All / One
* Queue management
* Play next
* Add to queue
* Remove and reorder queue items
* Sleep timer
* Recently played tracks
* Persistent playback preferences

### 🔀 Smart Queue

* Start playback from any song
* Shuffle while keeping the current song first
* Restore the original queue after shuffle
* Queue persistence
* Queue source tracking
* Protection against repeated playback failures

### 📱 Modern Experience

* Responsive desktop and mobile UI
* Dark/light theme support
* Smooth animations and transitions
* Toast notifications
* Keyboard shortcuts
* Loading, error, and empty states
* Media Session API integration for supported browsers

### 💾 Local Persistence

VibeHai stores user preferences and relevant playback state locally using browser storage.

This includes things such as:

* Library data
* Queue
* Playback preferences
* Volume/mute state
* Shuffle/repeat state
* Recently played information
* Theme preferences

No account is required to use the application.

### 📲 PWA Support

VibeHai includes Progressive Web App infrastructure with:

* Web app manifest
* Service worker
* Application icons
* Browser installation support where supported

---

## 🛠️ Tech Stack

| Technology        | Purpose                           |
| ----------------- | --------------------------------- |
| React             | UI framework                      |
| TypeScript        | Type-safe application development |
| Vite              | Development and build tooling     |
| Tailwind CSS      | Styling and responsive UI         |
| Framer Motion     | Animations and transitions        |
| React Router      | Application routing               |
| Web Storage API   | Local persistence                 |
| Media Session API | Browser/device playback controls  |
| Service Worker    | PWA functionality                 |

---

## 🧠 Architecture

VibeHai follows a component-based React architecture with clear separation between UI, application state, API communication, and utilities.

```text
src/
├── components/
│   ├── layout/
│   ├── media/
│   └── player/
│
├── context/
│   ├── LibraryContext.tsx
│   ├── PlayerContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
│
├── hooks/
├── lib/
│   ├── format.ts
│   ├── saavn.ts
│   ├── storage.ts
│   └── types.ts
│
├── pages/
├── pwa/
├── utils/
│
├── App.tsx
├── main.tsx
└── index.css
```

### Core application layers

**PlayerContext**

Centralizes playback state and behavior including queue management, shuffle/repeat, volume, playback errors, sleep timer, persistence, and Media Session integration.

**LibraryContext**

Handles user library state and locally persisted library interactions.

**`lib/saavn.ts`**

Provides the API integration layer with response normalization, source handling, request timeouts, and API host fallback behavior.

**Storage layer**

Keeps persistent browser state isolated from UI components.

**Reusable components**

Media cards, song rows, shelves, player controls, queue panels, modals, and layout components are designed to be reused across pages.

---

## 🔌 API & Playback

VibeHai uses **JioSaavn-compatible API services** for music metadata, search, and playback sources.

The API layer includes:

* Multiple API host fallbacks
* Request timeout handling
* Response normalization
* Song, image, and audio source normalization
* Search aggregation
* Playback source fallback
* Error and failure handling

### 🙏 API Credit

VibeHai relies on community-maintained, unofficial JioSaavn API implementations and publicly available API deployments, including:

JioSaavn API by Sumit Kolhe — https://github.com/sumitkolhe/jiosaavn-api
JioSaavnAPI by cyberboysumanjay — https://github.com/cyberboysumanjay/JioSaavnAPI

These projects are independent of VibeHai and are used as external API sources. API endpoints, availability, response formats, and playback sources may change or become unavailable without notice.

VibeHai does not claim ownership of these APIs or the underlying JioSaavn service.
---

## 🔐 Privacy & Data

VibeHai does not require:

* Account creation
* Login
* A personal backend
* A database

Application preferences and local library/playback state are stored in the browser where applicable.

Music metadata and playback sources are retrieved through external API services.

---

## 🚀 Getting Started

### Requirements

* Node.js
* npm

### Installation

```bash
git clone https://github.com/ashutoshpalhare/VibeHai.git
cd VibeHai
npm install
```

### Start development server

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

### Production build

```bash
npm run build
```

---

## 📁 Project Structure

```text
VibeHai/
├── docs/
│   └── index.html
├── public/
│   ├── icons/
│   │   ├── Flex.jpeg
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── maskable-512.png
│   ├── favicon.svg
│   ├── icons.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   └── gen-icons.cjs
├── src/
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── FooterCredit.tsx
│   │   │   ├── Nav.tsx
│   │   │   └── TopBar.tsx
│   │   ├── media/
│   │   │   ├── AddToPlaylistModal.tsx
│   │   │   ├── AsyncShelf.tsx
│   │   │   ├── CreatePlaylistModal.tsx
│   │   │   ├── DetailHero.tsx
│   │   │   ├── MediaCard.tsx
│   │   │   ├── Shelf.tsx
│   │   │   ├── SongList.tsx
│   │   │   └── SongRow.tsx
│   │   ├── player/
│   │   │   ├── NowPlaying.tsx
│   │   │   ├── PlayerBar.tsx
│   │   │   ├── QueuePanel.tsx
│   │   │   ├── SeekBar.tsx
│   │   │   └── SleepTimerMenu.tsx
│   │   └── ui/
│   │       ├── Icons.tsx
│   │       ├── index.tsx
│   │       └── Menu.tsx
│   ├── context/
│   │   ├── LibraryContext.tsx
│   │   ├── PlayerContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   ├── hooks/
│   │   ├── useAsync.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── lib/
│   │   ├── format.ts
│   │   ├── saavn.ts
│   │   ├── storage.ts
│   │   └── types.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── Collections.tsx
│   │   ├── Details.tsx
│   │   ├── Discover.tsx
│   │   ├── Home.tsx
│   │   ├── Library.tsx
│   │   ├── Misc.tsx
│   │   ├── Profile.tsx
│   │   ├── Search.tsx
│   │   └── Settings.tsx
│   ├── pwa/
│   │   └── register.ts
│   ├── utils/
│   │   └── cn.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
└── vite.config.ts

```

---

## 🎯 Why VibeHai?

VibeHai was built as more than a basic music-player UI.

The project focuses on real application problems such as:

* Managing complex player state
* Maintaining a persistent playback queue
* Handling unreliable external APIs
* Falling back between playback sources
* Synchronizing browser media controls
* Preserving state between sessions
* Building responsive reusable UI components
* Handling loading, empty, and failure states
* Keeping a growing React application maintainable

---

## 🧪 Current Status

VibeHai is actively maintained as a personal development project.

The current codebase has undergone a major architecture cleanup, including removal of obsolete legacy implementations and stabilization of the API and player layers.

---

## 🗺️ Future Ideas

Potential future improvements include:

* More advanced recommendation logic
* Better offline/PWA capabilities
* More granular player preferences
* Additional keyboard controls
* Improved API resilience
* Expanded accessibility coverage
* More music discovery experiences

---

## 👨‍💻 Author

**Ashutosh Palhare**

GitHub:
https://github.com/ashutoshpalhare

---

## 📄 License

This project is licensed under the **MIT License**.

See [`LICENSE`](./LICENSE) for details.

---

## ⚠️ Disclaimer

VibeHai is a personal/open-source project created for learning and development purposes.

Music metadata and playback functionality depend on external third-party services. VibeHai does not claim ownership of third-party music, artwork, metadata, or other copyrighted content accessed through those services.

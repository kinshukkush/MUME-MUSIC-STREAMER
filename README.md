# 🎵 Mume — Music Player

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**A feature-rich React Native (Expo) music streaming app powered by the JioSaavn API**

[Download APK](#-download--installation) • [Features](#-features) • [Build APK](#-building-the-apk) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Developer](#-developer)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

- 🎵 **Real-time Search** — Songs, artists, albums & playlists
- 🏠 **Dynamic Home** — Suggested, Songs, Artists, Albums tabs with pagination
- ▶️ **Advanced Player** — Album art, seek bar, shuffle, repeat, lyrics panel
- 🎛️ **Mini Player** — Persistent, synced bar always visible above tabs
- 📋 **Smart Queue** — Add, view, reorder, and remove songs

</td>
<td width="50%">

- ❤️ **Favourites** — Persist liked songs locally with AsyncStorage
- 📂 **Custom Playlists** — Create and manage personal playlists
- 📥 **Offline Downloads** — Save songs for offline listening in the Downloads playlist
- 🌙 **Theme Modes** — Dark / Light / System theme support
- 🔀 **Smart Playback** — Shuffle & Repeat (off / all / one)

</td>
</tr>
</table>

---

## � Download & Installation

### Option 1: Download APK (Recommended for Users)

**Download the latest APK directly from GitHub Releases:**

[![Download APK](https://img.shields.io/badge/Download-APK-F5A623?style=for-the-badge&logo=android&logoColor=white)](https://github.com/kinshukkush/MUME-MUSIC-STREAMER/releases/latest)

1. Go to the [Releases page](https://github.com/kinshukkush/MUME-MUSIC-STREAMER/releases/latest)
2. Download the latest `.apk` file
3. Install on your Android device
4. Enjoy! 🎵

> **Note:** You may need to enable "Install from Unknown Sources" in your Android settings

---

### Option 2: Run from Source (For Developers)

#### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | >= 18.x |
| npm/yarn | Latest |
| Expo CLI | Latest |
| Expo Go | iOS/Android |

#### Installation Steps

```bash
# Clone the repository
git clone https://github.com/kinshukkush/MUME-MUSIC-STREAMER.git

# Navigate to project directory
cd MUME-MUSIC-STREAMER

# Install dependencies
npm install

# Start the development server
npx expo start
```

📱 Scan the QR code with **Expo Go** on your phone to run the app.

---

## 📥 Using Downloads Feature

The app includes an **offline downloads feature** for listening without internet:

1. **Download a song:** Tap the download icon on any song card
2. **View downloads:** Go to the **Playlists** tab → Tap **Downloads** (appears at the top)
3. **Play offline:** All downloaded songs can be played from the Downloads playlist
4. **Manage downloads:** Long-press on a song in Downloads to remove it

> **Note:** Downloaded songs are stored locally on your device using `expo-file-system`

---

## 📦 Building the APK

### Using EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for Android (APK)
eas build --platform android --profile preview

# Build for Android (AAB for Play Store)
eas build --platform android --profile production
```

> **Note:** The APK will be available in your EAS dashboard. Download and share it!

### Using Classic Build

```bash
# Build APK using Expo classic build
npx expo build:android --type apk
```

---


### Creating a Release with APK

1. Build your APK using EAS Build or Classic Build
2. Go to your GitHub repository
3. Click on **Releases** → **Create a new release**
4. Tag version: `v1.0.0`
5. Release title: `Mume Music Player v1.0.0`
6. Upload your APK file
7. Publish release

> **Tip:** The APK download badge in README will automatically point to the latest release!

---

### 🏗️ Architecture
```


src/
├── navigation/       # Root stack + bottom tab navigators
│   ├── RootNavigator.tsx
│   └── BottomTabNavigator.tsx
├── screens/          # All screen components
│   ├── SplashScreen.tsx
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── PlayerScreen.tsx
│   ├── SearchScreen.tsx
│   ├── QueueScreen.tsx
│   ├── FavoritesScreen.tsx
│   ├── PlaylistsScreen.tsx
│   ├── SettingsScreen.tsx
│   └── ArtistDetailScreen.tsx
├── components/       # Reusable UI components
│   ├── MiniPlayer.tsx
│   ├── SongCard.tsx
│   ├── ArtistCard.tsx
│   ├── AlbumCard.tsx
│   └── SkeletonLoader.tsx
├── store/            # Zustand state management
│   ├── playerStore.ts     (audio engine)
│   ├── favoritesStore.ts
│   └── downloadsStore.ts
├── services/         # API layer
│   └── api.ts        (JioSaavn wrapper)
└── theme/            # Design system
    ├── colors.ts
    └── ThemeContext.tsx
```

### State Management

**Zustand** stores manage all global state:

| Store | Purpose |
|---|---|
| `playerStore` | Current song, queue, playback, shuffle, repeat |
| `favoritesStore` | Liked songs (persisted via AsyncStorage) |
| `downloadsStore` | Offline songs (persisted via AsyncStorage) |

### 🎵 Audio Engine

- **expo-av** with `staysActiveInBackground: true` enables:
  - Background playback (app minimized or screen off)
  - `AVAudioSession` configuration for silent mode on iOS
  - Seamless audio streaming with progress tracking

---

## 🌐 API

**Base URL:** `https://saavn.sumit.co`  
**Authentication:** No API key required

| Endpoint | Purpose |
|---|---|
| `GET /api/search/songs` | Search songs |
| `GET /api/search/artists` | Search artists |
| `GET /api/search/albums` | Search albums |
| `GET /api/songs/{id}` | Get song details |
| `GET /api/artists/{id}` | Get artist info |
| `GET /api/artists/{id}/songs` | Get artist's songs |

---
🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| 🎯 Framework | Expo SDK 54 (React Native) |
| 💻 Language | TypeScript |
| 🧭 Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| 🗃️ State Management | Zustand |
| 💾 Storage | AsyncStorage |
| 🎵 Audio | expo-av |
| 🌐 HTTP Client | Axios |
| 🎨 Icons | react-native-svg |
| 🌈 Gradients | expo-linear-gradient |
| 🎚️ Seek Bar | @react-native-community/slider |
| 📥 Downloads | expo-file-system |

---

## 🤔
## Trade-offs & Decisions

| Decision | Rationale |
|----------|-----------|
| 🎵 **expo-av** over react-native-track-player | Works seamlessly in Expo Go without custom native build, enabling faster development and testing iterations |
| 💾 **AsyncStorage** over MMKV | Fully managed by Expo without custom native setup; MMKV requires EAS/dev-build configuration |
| 🗃️ **Zustand** over Redux Toolkit | Minimal boilerplate, cleaner integration with async audio callbacks, and better TypeScript support |
| 🧭 **React Navigation** over Expo Router | Project requirements specifically mandate React Navigation v6 for navigation architecture |

---

## 👨‍💻 Developer

<div align="center">

### **Kinshuk Saxena**

Full Stack Developer | React Native Enthusiast | Music Lover

[![GitHub](https://img.shields.io/badge/GitHub-kinshukkush-181717?style=for-the-badge&logo=github)](https://github.com/kinshukkush)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-kinshuk--saxena-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/kinshuk-saxena-/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit_Website-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://portfolio-frontend-mu-snowy.vercel.app/)
[![Email](https://img.shields.io/badge/Email-kinshuksaxena3%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:kinshuksaxena3@gmail.com)
[![Phone](https://img.shields.io/badge/Phone-%2B91%209057538521-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](tel:+919057538521)

</div>

---

<div align="center">

**Made with ❤️ and 🎵 by Kinshuk Saxena**

⭐ Star this repo if you like it!

</div>

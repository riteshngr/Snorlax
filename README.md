# PokeVault — Pokémon Gacha Simulator & Marketplace

## Team Name
Snorlax

## Team Members
- Nilanjan Chavan (GitHub: @nilanjanchavan)
- Ritesh Nagar (GitHub: @riteshngr)
- Yashitha Chalicheemala (GitHub: @yashithac618)
- Nishant Jadaun (GitHub: @nishantjadaun26)
- Palak Dasauni (GitHub: @dasaunipalak)

# Repo link
https://github.com/riteshngr/Snorlax

## Idea Chosen
Custom: **PokeVault — Pokémon Card Gacha Simulator with Real-Time Marketplace**

## Problem Statement
Trading card games are exciting, but physical card packs are expensive and inaccessible for many fans. PokeVault brings the thrill of opening Pokémon card packs to the web — complete with cinematic animations, a virtual economy, rare card pulls, evolution mechanics, and a real-time auction marketplace where users can trade cards with others.

## Tech Stack
- **React 19** — UI framework
- **Vite 8** — Lightning-fast build tool
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Cinematic animations & transitions
- **Firebase Auth** — User authentication (email/password)
- **Firebase Firestore** — Real-time database for profiles, inventory, auctions & shop
- **PokeAPI** — Pokémon data source (sprites, stats, types)
- **Vercel** — Deployment & hosting

## Implementation Details

### Architecture
The app follows a **context-driven architecture** with two global providers:
- **AuthContext** — Manages Firebase authentication state, login/logout/delete flows
- **UserDataContext** — Real-time Firestore listeners for user profile, inventory, and shop state

### Key Features
- **🎴 Gacha Pack Opening** — Cinematic card pack tearing animation revealing 5 random Pokémon cards with rarity-based pulls (Common → Mythical)
- **💰 Virtual Economy** — Users start with 1,500 credits and earn more by selling cards
- **📦 The Vault (Inventory)** — Full card collection management with sorting by rarity/type, individual & bulk sell, and expanded card inspection
- **🏪 Stone Shop** — Purchase evolution stones with auto-restocking inventory and rarity tiers
- **🔄 Evolution System** — Use evolution stones to evolve Pokémon in your collection (e.g., Pikachu → Raichu with Thunder Stone)
- **🏛️ Real-Time Marketplace** — Auction system with live bidding, race-condition-safe transactions, and seller listings
- **🌤️ Weather Widget** — Dynamic weather display
- **✨ Premium UI** — Pokeball splash screen, 3D card flips, click spark effects, glassmorphism, and micro-animations throughout

### State Management
- All data flows through **real-time Firestore `onSnapshot` listeners**, so changes reflect instantly across all open sessions
- **Firestore transactions** are used for all financial operations (buying, selling, bidding) to prevent race conditions
- Inventory and profile data are kept in sync with **batch writes**

### Algorithms
- **Card Rarity System** — Based on Pokémon base stat totals: Common (≤300), Uncommon (301–400), Rare (401–475), Epic (476–535), Legendary (536–600), Mythical (600+)
- **Shop Restock** — Timed auto-restock with weighted rarity distribution (60% Common, 25% Rare, 12% Legendary, 3% Mythical)

## How to Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/riteshngr/Snorlax.git

# 2. Navigate into the project
cd Snorlax

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

The app will be running at `http://localhost:5173`

## Live Demo
🔗 **[https://snorlax-weld.vercel.app](https://snorlax-weld.vercel.app)**

## Screenshots / Demo

🎬 **Demo Video**: [https://youtu.be/oafwAICI6n8](https://youtu.be/oafwAICI6n8)

# Snorlax Gacha & Dashboard Project

Welcome to the Snorlax project! This application is a Pokemon-themed Gacha system integrated into a high-end dashboard. This README provides a map of the codebase for developers and contributors.

## 🚀 Technology Stack
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Data Source**: PokeAPI

## 📂 Project Structure: What is Where?

### 🏗️ Core & Entry Points
- **[main.jsx](src/main.jsx)**: The starting point of the application. It mounts the React tree to the HTML root.
- **[App.jsx](src/App.jsx)**: The central orchestrator. It controls the cinematic flow, starting with the Pokeball Splash and then revealing the Dashboard.
- **[index.css](src/index.css)**: Global styles, design tokens, and custom keyframe animations (like the pack tearing effect).

### 🖥️ Layout & Navigation
- **[DashboardLayout.jsx](src/components/layout/DashboardLayout.jsx)**: The main UI structure. It contains the navigation tabs (Recipes, Market, Inventory) and the logic for sliding panels. It also hosts the central Gacha zone.

### 🃏 Gacha & Card System
- **[PokeballSplash.jsx](src/components/gacha/PokeballSplash.jsx)**: The cinematic entrance. Handles the Pokeball opening animation and the initial app reveal.
- **[CardPack.jsx](src/components/CardPack.jsx)**: The interactive Pokemon pack. Includes the metallic design, shaking animation, and "Open" logic.
- **[PackOpening.jsx](src/components/PackOpening.jsx)**: The logic hub for gacha reveals. It fetches 5 random Pokemon, runs the "tear" animation, and fans out the cards. It also manages the interactive stack (z-index) of cards.
- **[PokemonCard.jsx](src/components/PokemonCard.jsx)**: The UI for individual cards. Features a 3D flip effect, type-based gradients, and rarity badges.
- **[AttackRow.jsx](src/components/AttackRow.jsx)**: A small sub-component for rendering attack stats within a card.

### 🛒 Features & Pages
- **[Marketplace.jsx](src/pages/Marketplace.jsx)**: A complex trading UI with filters, search, and featured listings.

### ⚙️ Utilities & Services
- **[pokemon.js](src/services/pokemon.js)**: The service layer that communicates with PokeAPI to fetch random monster data.
- **[cardGenerator.js](src/utils/cardGenerator.js)**: The algorithm that determines card stats, moves, and rarity based on the Pokemon's base stats.
- **[typeColors.js](src/utils/typeColors.js)**: Central repository for all type-specific colors, gradients, and glow effects (Fire, Water, Dragon, etc.).

## 🛠️ Key Logic Notations
- **Z-Index Hierarchy**: 
    - Panels/Modals: `z-[60]`
    - Active Card: `z-[50]`
    - Regular Cards: `z-[30]`
    - Dashboard Tabs: `z-[10]`
- **State Flow**: The `DashboardLayout` passes its navigation state to the `PackOpening` component to ensure the card stack resets whenever a user switches tabs.


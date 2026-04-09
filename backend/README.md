# PokeVault — Backend (Firebase)

## Setup

1. Go to [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Enable **Authentication → Email/Password** sign-in method.
3. Enable **Cloud Firestore** (start in test mode for development).
4. Copy your Firebase config from **Project Settings → General → Your Apps → Web App**.
5. Create a `.env` file in the project root (`Snorlax/.env`) with your credentials:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

6. Deploy `firestore.rules` via Firebase Console → Firestore → Rules for production.

## Architecture

- **No traditional backend server** — Firebase is a Backend-as-a-Service (BaaS).
- `firebaseConfig.js` initializes the Firebase app and exports `auth` and `db`.
- All auth and database operations happen client-side via the Firebase SDK.
- Real-time auction updates use Firestore `onSnapshot` listeners.
- Race-condition-safe bidding uses Firestore `runTransaction`.

# Verso Mobile - React Native (Expo)

The native iOS app for Verso - the AI Coach for sales professionals. Built with Expo SDK 52, React Native 0.76, Clerk auth, and NativeWind (Tailwind CSS for React Native).

## Architecture

```
┌---------------------┐
-   Verso Mobile       -  ← This repo (Expo / React Native)
-   (iOS + Android)    -
-   ----------------   -
-   - AI Coach chat    -
-   - Daily check-ins  -
-   - Insights & trends-
-   - Push notifs      -
-   - Offline mode     -
└--------┬------------┘
         - REST API (HTTPS)
         ▼
┌---------------------┐
-   Verso Backend      -  ← Existing Next.js app
-   (Vercel)           -
-   ----------------   -
-   /api/reframe       -  ← AI Coach engine
-   /api/checkin       -  ← Daily check-ins
-   /api/coaching      -  ← Coaching tips
-   /api/diagnostic    -  ← Sales archetype
-   /api/user/profile  -  ← User data
-   /api/streak        -  ← Streak tracking
└---------------------┘
```

## Prerequisites

- **Node.js** 18+
- **npm** or **bun**
- **Xcode 16+** (for iOS builds - macOS only)
- **CocoaPods** (`sudo gem install cocoapods`)
- **Apple Developer Account** ($99/year - [enroll here](https://developer.apple.com/programs/))
- **EAS CLI** (`npm install -g eas-cli`)

## Quick Start

### 1. Install dependencies

```bash
cd verso-mobile
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_API_URL=https://optimism-engine.vercel.app
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Start the dev server

```bash
npm start
```

Press `i` to open in iOS Simulator (requires Xcode).

## Project Structure

```
verso-mobile/
├-- app/                        # Expo Router (file-based navigation)
-   ├-- _layout.tsx             # Root: Clerk + ReactQuery + SafeArea
-   ├-- sign-in.tsx             # Clerk sign-in screen
-   └-- (tabs)/                 # Bottom tab navigator
-       ├-- _layout.tsx         # Tab bar config
-       ├-- index.tsx           # Home (greeting + check-in CTA + tips)
-       ├-- coach.tsx           # AI Coach chat (hero feature)
-       ├-- insights.tsx        # Trends, averages, archetype
-       └-- profile.tsx         # User info, subscription, settings
├-- components/                 # Reusable UI components
-   ├-- ChatMessageBubble.tsx   # Renders user/assistant messages
-   ├-- ChatInput.tsx           # Text input + send button
-   ├-- QuickPrompts.tsx        # Situation-based prompt chips
-   ├-- TypingIndicator.tsx     # Animated dots while AI thinks
-   ├-- CheckInModal.tsx        # Daily check-in flow
-   ├-- CheckInTrendChart.tsx   # SVG line chart
-   ├-- ImpactTagSummary.tsx    # Tag frequency bars
-   ├-- CoachingTipCard.tsx     # Coaching tip display
-   └-- ErrorBoundary.tsx       # Crash catcher
├-- lib/
-   ├-- api.ts                  # API client (fetch wrapper + auth)
-   ├-- clerk.ts                # Clerk token cache (SecureStore)
-   ├-- db.ts                   # SQLite offline storage
-   ├-- store.ts                # Zustand stores (chat state)
-   ├-- hooks.ts                # React Query hooks
-   └-- types.ts                # TypeScript types
├-- app.json                    # Expo config
├-- package.json
└-- tailwind.config.js          # NativeWind theme
```

## Key Features

### AI Coach Chat (`/coach`)
- Conversational AI that knows your sales archetype
- Calls `/api/reframe` on the backend (multi-provider: Mistral → Anthropic → OpenAI)
- Structured responses: acknowledgment → thought pattern → reframe → question
- Quick prompts for common situations (pre-call, post-rejection, burnout)
- Crisis detection with resource alerts
- Offline: messages stored in SQLite, synced when online

### Daily Check-in (`Home` → `Check-in modal`)
- 3 metrics: mood, energy, confidence (1-5 scale)
- Impact tags (win, rejection, tough client, etc.)
- Pattern insight generated based on archetype
- Streak tracking
- Offline queue: saved locally, synced when online

### Insights (`/insights`)
- 7-day averages for mood, energy, confidence
- Trend line chart (SVG)
- Impact tag frequency
- Archetype card with score breakdown
- Recent check-in history

### Profile (`/profile`)
- User info (from Clerk)
- Subscription status (Free vs Pro)
- Full Sales Wellbeing Map results (strengths, risks, recommendations)
- Settings: notifications, privacy, terms, support
- Sign out

## Offline Support

- **Messages**: Stored in SQLite (`verso.db`), hydrated on app launch
- **Check-ins**: Queued in SQLite when offline, synced on reconnect
- **Auth**: Clerk token cached in SecureStore (Keychain on iOS)

## Building for App Store

### Step 1: Configure EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Step 2: Set up signing credentials

```bash
eas credentials
# Follow prompts to create or import:
# - Distribution certificate
# - Provisioning profile
```

### Step 3: Build for App Store

```bash
# Build the iOS app (creates .ipa)
eas build --platform ios --profile production

# This takes ~10-15 minutes on EAS cloud
```

### Step 4: Submit to App Store Connect

```bash
# Submit directly to App Store Connect
eas submit --platform ios

# Or manually upload via:
# 1. Download the .ipa from EAS
# 2. Open Transporter.app
# 3. Drag .ipa → upload
```

### Step 5: App Store Connect setup

In [App Store Connect](https://appstoreconnect.apple.com):

1. **App Information**
   - Name: `Verso: AI Coach for Sales`
   - Primary Language: English
   - Bundle ID: `com.verso.app`
   - SKU: `verso2026`

2. **Pricing & Availability**
   - Price: Free (with in-app purchase for Pro)
   - Availability: All countries

3. **App Privacy** (required)
   - Data collected: Email, Name, Usage Data, Diagnostic Results
   - Data used: App functionality, Analytics
   - NOT linked to user identity: none

4. **App Review Information**
   - Demo account: (provide a test account)
   - Notes: "This app provides AI coaching for sales professionals. The AI is not a substitute for professional mental health care."

### Step 6: In-App Purchase (for £20/mo Pro)

If using RevenueCat:
```bash
npm install react-native-purchases
```

Set up in App Store Connect:
- Products: `verso_pro_monthly` (£19.99/mo), `verso_pro_yearly` (£199.99/yr)
- Subscription group: "Verso Pro"

### Step 7: Screenshots & Metadata

Required screenshots (6.7" iPhone - iPhone 15 Pro):
1. Home screen with greeting
2. AI Coach chat (mid-conversation)
3. Daily check-in modal
4. Insights with trend chart
5. Profile with archetype
6. (Optional) Coaching tip card

App Store metadata:
- **Subtitle** (30 chars): "AI coaching for sales minds"
- **Description** (4000 chars): Focus on outcomes - mental resilience, pattern awareness, personalized coaching
- **Keywords** (100 chars): sales,coach,ai,wellbeing,mental,performance,mindset,resilience,burnout,motivation
- **Categories**: Business (primary), Health & Fitness (secondary)

### Step 8: Submit for Review

```bash
# In App Store Connect, select your build → "Submit for Review"
```

**Review timeline**: 24-48 hours typical, up to 7-10 days worst case.

## Common Rejection Reasons (and how to avoid)

| Issue | Fix |
|-------|-----|
| Missing privacy policy | Add URL in App Store Connect → App Privacy |
| AI not clearly labeled | Add disclaimer in app + review notes |
| Subscription not clear | Show price clearly before purchase |
| Crashes on launch | Test on real device before submitting |
| Missing Apple Sign In | If you offer social login, you MUST offer Sign in with Apple |

## Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run in iOS Simulator |
| `npm run android` | Run in Android Emulator |
| `npm run typecheck` | TypeScript type check |
| `eas build --platform ios` | Build for App Store |
| `eas submit --platform ios` | Submit to App Store Connect |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Backend API URL (e.g., `https://optimism-engine.vercel.app`) |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |

## Tech Stack

- **Framework**: Expo SDK 52, React Native 0.76
- **Navigation**: Expo Router v4 (file-based)
- **Auth**: Clerk (`@clerk/clerk-expo`)
- **Styling**: NativeWind (Tailwind CSS for RN)
- **State**: Zustand + React Query
- **Offline**: expo-sqlite + AsyncStorage
- **Icons**: @expo/vector-icons (Ionicons)
- **Animations**: react-native-reanimated 3

## Backend API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/reframe` | POST | AI Coach chat (the engine) |
| `/api/checkin` | GET/POST | Fetch/create daily check-ins |
| `/api/coaching` | GET | Coaching tips by situation |
| `/api/diagnostic` | GET | Sales archetype results |
| `/api/user/profile` | GET | User profile data |
| `/api/streak` | GET | Streak info |
| `/api/sessions` | GET | Conversation history |

## Next Steps (Phase 2)

- [ ] Push notifications (daily check-in reminders)
- [ ] Voice input (iOS Speech framework)
- [ ] RevenueCat integration for £20/mo Pro
- [ ] Biometric auth (Face ID)
- [ ] Weekly synthesis (background job on backend)
- [ ] Haptic feedback patterns
- [ ] Dark mode
- [ ] Localization (UK English first)

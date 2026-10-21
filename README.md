# AI Translate

Real-time multilingual **speech-to-text** web app. Speak in Hindi, English or a mix (Hinglish) and the words appear **as you talk**. Save transcriptions and manage them on a history dashboard with full CRUD.

- **Live app:** https://ai-translate-mu.vercel.app
- **Live API:** https://ai-translate-api-mwbj.onrender.com/api/health
- **Backend repo (Express API):** https://github.com/anildeveloper26/AI-Translate-api
- Built for the Procucev AI Tech Hiring Assignment.

## Features

- **Real-time transcription with Gemini Live** (`gemini-3.5-transcribe-live`):
  - microphone audio is captured with an AudioWorklet as 16 kHz PCM and streamed over a WebSocket;
  - partial words show up live (grey), then the final text replaces them.
- **Multilingual:** handles Hindi + English code-mixing, plus other Indian languages.
- **Secure by design:** the browser connects to Gemini with a **short-lived ephemeral token** issued by the Express API. The API key never reaches the client.
- **Fallback engine:** the browser's built-in Web Speech API (Chrome/Edge), switchable in the UI.
- **Transcription history** (PostgreSQL via the Express API):
  - create on save, list with search (`?q=` in the URL), detail page, inline edit, delete;
  - text-to-speech playback of any entry.
- Responsive, dark-mode friendly UI.

## Tech stack

| Concern | Tech |
|---|---|
| Framework | **TanStack Start** (React 19, SSR, Vite) |
| Routing | **TanStack Router**: file-based routes, typed params (`/history/$id`), validated search params (`/history?q=`), route loaders |
| Data | **TanStack Query**: query-options factories, loader prefetch (`ensureQueryData`) with SSR hydration, mutations with cache invalidation |
| Styling | Tailwind CSS v4 |
| Speech | Gemini Live API (`@google/genai`), Web Speech API fallback |
| Backend | Express 5 + PostgreSQL (separate repo) |

## Routes

| Path | Description |
|---|---|
| `/` | Recorder (live transcription) + recent transcriptions |
| `/history?q=` | Full history with debounced, URL-synced search |
| `/history/$id` | Transcription detail (play, delete) |

## Run locally

Start the backend first (see the API repo), then:

```bash
npm install
cp .env.example .env    # VITE_API_URL=http://localhost:4000
npm run dev             # http://localhost:5173
```

Allow microphone access when prompted.

## Deploy (Vercel)

Import this repo into Vercel (the framework preset is TanStack Start) and set `VITE_API_URL` to the deployed API URL. On the API, set `CORS_ORIGIN` to this site's URL.

## Project structure

```
src/
  routes/                         # TanStack Router file routes: config only (loaders, params, search)
    __root.tsx                    # html shell + layout
    index.tsx                     # /            → HomePage
    history.index.tsx             # /history?q=  → HistoryPage
    history.$id.tsx               # /history/$id → TranscriptionDetailPage
  features/                       # feature modules (UI + logic)
    home/pages/HomePage.tsx
    recorder/
      components/Recorder.tsx     # engine switch, language, timer, live transcript, save
      hooks/useGeminiLive.ts      # Gemini Live session over WebSocket
      hooks/useBrowserSpeech.ts   # Web Speech API fallback
      lib/pcm.ts                  # AudioWorklet 16 kHz PCM capture
    transcriptions/
      queries.ts                  # TanStack Query keys + queryOptions
      mutations.ts                # create / update / delete mutations
      components/TranscriptionRow.tsx
      pages/HistoryPage.tsx
      pages/TranscriptionDetailPage.tsx
  api/                            # typed REST client for the Express API
    client.ts
    transcriptions.ts
    live.ts
  components/layout/              # Navbar, Footer, NotFound
  config/env.ts                   # VITE_API_URL
  constants/languages.ts
  types/transcription.ts
  utils/                          # format.ts, speech.ts
```

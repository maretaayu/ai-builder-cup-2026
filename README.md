# Teman Ada

> *Teman Ada* means "a friend who is there". It is a playful mental-health companion for young children. Kids name an animal friend, tell it their "heart weather" through icons, calm down with breathing and stories, and can quietly signal a trusted adult. Parents and teachers get real-time signals, weekly trends and per-child learning progress, plus an AI Copilot grounded in a first-aid guidance corpus.
>
> Built for **Google Cloud AI Builder Cup 2026** on Cloud Run, Firebase (Auth, Firestore, Hosting) and the Gemini API.

**Live demo:** https://withada.web.app

Tagline: *Always there, in every kind of weather.*

---

## The problem

Many children do not yet have the words for their feelings, and the adults around them often find out too late. Mental-health experts are scarce, so first support usually falls to parents and teachers who have little training in how to respond.

## The solution

Teman Ada has two connected sides.

**For children** (no reading required, icons and voice)

| Feature | What it does |
|---|---|
| Adopt a friend | Pick a rhino, a lory bird or a sea turtle, then give it a name |
| Heart weather | Choose sunny, cloudy, rainy or stormy, then where the body feels it |
| Balloon breathing | A calming exercise, then a check on whether it feels better |
| Guess the feeling | A game about recognising expressions |
| Stories | Short stories with healthy and less-healthy choices |
| Magic Story | A new AI-written story starring the child's friend |
| Ask your friend | Pick-a-question answers about feelings, written by AI |
| Ask to talk | Sends a signal to an adult the child trusts |
| Star tree | Stars earned from every activity |

**For parents and teachers** (the Support Room)

| Feature | What it does |
|---|---|
| Children | One unique code per child, in the child's name; a list of connected children; per-child learning progress (stars, activities completed, last active) |
| Signals | Real-time signals with a level (safe, needs attention, urgent) and a suggested first step |
| Ask the Copilot | Answers from a guidance corpus, with source citations and referral paths |
| Trends | A 7-day heart-weather summary with an AI-written recap |

## How it works

```
Adult signs in → adds a child (name) → gets a unique 6-character code
        → child enters the code on their own device → child is registered automatically
        → child plays; stars and activities sync
        → adult sees progress and receives signals in real time
```

## AI use and safeguards

AI (Gemini) works behind the scenes or for adults. **There is no free-form chat between the AI and a child.**

- **Ask your friend and Magic Story:** questions and themes are picked from fixed lists, never typed freely. The friend's name is sanitised before it reaches a prompt.
- **Signal triage:** Gemini classifies the child's icon choices into an attention level using structured JSON output. The highest level goes to the adult and is never answered by the AI to the child.
- **Caregiver Copilot:** answers from the guidance corpus, must cite its sources, never diagnoses and never names medication. **Emergencies are always answered from fixed guidance, never by the model.**
- **Fallbacks:** if Gemini is unavailable or out of quota, the app uses basic answers and the next model in the chain.
- **Rate limiting** per IP on every AI endpoint, and the API key lives only on the server.

## Architecture

```
Browser (child / adult)
   │
   ▼
Firebase Hosting (withada.web.app)  ──rewrite──▶  Cloud Run (Next.js + API routes)
   │                                                      │
   │ anonymous auth (child) / account (adult)             ▼
   ▼                                              Gemini API (structured text, TTS)
Cloud Firestore (real-time) ◀── role-based security rules
```

- **Cloud Run:** runs Next.js and 7 API routes (`cerita`, `tanya-boni`, `copilot`, `triase`, `ringkasan`, `suara`, `status`).
- **Firebase Hosting:** the `withada.web.app` front door, forwarding every request to Cloud Run.
- **Firebase Auth:** email, Google and anonymous sign-in (child devices, no child email).
- **Cloud Firestore:** rooms, signals, check-ins and progress, in real time.
- **Gemini API:** structured text (with a fallback model chain) and speech.

### Data model

```
users/{uid}                    profile: role, name, roomCode, roomName
rooms/{code}                   1 child = 1 room: ownerUid, name (child), created
  anggota/{child uid}          friend name, species, stars, progres{activity: n}, aktifTs
  signals/{id}                 to, weather, body, level, status, reason, advice, ai, anakUid
  checkins/{id}                weather, body, level, anakUid, ts
```

### Data security

The full rules are in `firestore.rules`. In short:

- A random 6-character room code (no look-alike characters such as 0/O or 1/I) is the key a child's device uses to join.
- Only the room owner can read a child's signals, check-ins and progress.
- An owner cannot hand a room to another account. A child can only write their own data, with restricted fields and types.
- An adult can only list the rooms they own.

## Tech stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Firebase (Auth, Firestore, Hosting), Gemini API, Google Cloud Run, Cloud Build, Artifact Registry.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev                  # http://localhost:3000
```

Without Firebase configuration the app still runs in **local mode** (data stays in the browser). Without `GEMINI_API_KEY`, AI features fall back to basic answers.

### Environment variables

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini key (server only) |
| `GEMINI_TEXT_MODELS` | Text model chain, tried in order |
| `GEMINI_TTS_ENABLED`, `GEMINI_TTS_MODEL`, `NEXT_PUBLIC_SUARA_AWAN` | Gemini speech (optional, off by default) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (public identifiers) |
| `NEXT_PUBLIC_FIREBASE_EMULATOR` | Set to `1` to use the Firebase Emulator |

Firebase Emulator: `firebase emulators:start --only auth,firestore`.

## Deploy to Google Cloud

`NEXT_PUBLIC_*` values are baked in at build time, so they are passed as build arguments through `cloudbuild.yaml`.

```bash
# 1. Build and push the image
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_IMAGE=REGION-docker.pkg.dev/PROJECT/app/teman-ada:TAG,_FB_API_KEY=...,_FB_AUTH_DOMAIN=...,_FB_PROJECT_ID=...,_FB_STORAGE_BUCKET=...,_FB_SENDER_ID=...,_FB_APP_ID=...,_SUARA_AWAN=0

# 2. Deploy to Cloud Run (runtime env: GEMINI_*)
gcloud run deploy teman-ada --image REGION-docker.pkg.dev/PROJECT/app/teman-ada:TAG \
  --region asia-southeast1 --allow-unauthenticated --env-vars-file env.yaml

# 3. Hosting forwards to Cloud Run (see firebase.json)
firebase deploy --only hosting
```

After deploying, add the hosting domain under **Authentication, Settings, Authorized domains** in the Firebase project you use, so Google sign-in works.

## Project structure

```
app/            pages (child home, weather, breathing, guess, stories, support room, join, sign-in) and app/api/*
components/     UI components, landing page, Children tab, progress sync
lib/            local store, Firebase, rooms (Firestore), session, Gemini, Copilot corpus, triage
public/img/     character illustrations (WebP)
firestore.rules Firestore security rules
Dockerfile, cloudbuild.yaml, firebase.json   build and deploy configuration
```

## Limitations and notes

- A prototype for Google Cloud AI Builder Cup 2026. **It is not a diagnostic tool and not a substitute for professional help.**
- The guidance corpus is a draft and has not been validated by professionals. Emergency hotline numbers must be verified before use.
- Illustrations were created with AI assistance.
- The problem statistics on the landing page are quoted from the team's proposal (citing I-NAMHS 2022) and should be checked against the original source.
- There is no way yet to delete or rename a child. The 6-character room code can be guessed by brute force (low risk, since an empty room reveals nothing).
- The UI is available in Indonesian and English.

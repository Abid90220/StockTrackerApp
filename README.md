# TradeInsight AI

TradeInsight AI is a stock-market dashboard built with Next.js. It combines live TradingView market widgets, a searchable stock directory, local demo authentication, MongoDB-backed email subscriber capture, and a scheduled AI-generated market news digest.

Live demo: https://stocktrackerapp-kappa.vercel.app

## Features

- Market dashboard with TradingView market overview, heatmap, top stories, and market quotes widgets.
- Search page for common US-listed stocks with quick links to Yahoo Finance and TradingView.
- Sign-up and sign-in flows for demo users, stored in browser local storage.
- Subscriber API that saves sign-up preferences to MongoDB.
- Daily digest API that fetches Finnhub market news, summarizes it with Gemini, and sends email through Resend.
- Vercel Cron configuration for scheduled digest delivery.
- Responsive dark UI with custom TradeInsight AI branding.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- MongoDB Atlas and Mongoose
- Gemini API
- Finnhub API
- Resend
- Vercel

## Project Structure

```text
app/
  (auth)/                  Sign-in and sign-up pages
  (root)/                  Dashboard and stock search pages
  api/daily-stock-news/    Protected scheduled digest endpoint
  api/email-subscribers/   Subscriber capture endpoint
components/                Shared UI, forms, header, TradingView widgets
database/                  MongoDB connection and subscriber model
hooks/                     TradingView widget loader hook
lib/                       Auth helpers, constants, email digest workflow
types/                     Global TypeScript types
```

## Environment Variables

Create `.env.local` for local development. The file is intentionally ignored by git.

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority&appName=<app-name>
GEMINI_API_KEY=<your-gemini-api-key>
GEMINI_MODEL=gemini-2.5-flash
FINNHUB_API_KEY=<your-finnhub-api-key>
RESEND_API_KEY=<your-resend-api-key>
DAILY_DIGEST_FROM=TradeInsight AI <onboarding@resend.dev>
CRON_SECRET=<long-random-secret>
```

Notes:

- `MONGODB_URI` is required for subscriber capture and digest recipients.
- `GEMINI_API_KEY`, `FINNHUB_API_KEY`, and `RESEND_API_KEY` are required for real digest generation and delivery.
- `GEMINI_MODEL` is optional because the app defaults to `gemini-2.5-flash`.
- `DAILY_DIGEST_FROM` can use `onboarding@resend.dev` for testing. A verified domain is required for production email sending to a wider audience.
- `CRON_SECRET` protects the daily digest endpoint in production.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Quality Checks

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

## API Routes

### `POST /api/email-subscribers`

Stores a sign-up user's email and investment preferences in MongoDB for daily digest delivery.

### `GET /api/daily-stock-news`

Protected endpoint used by Vercel Cron. In production it requires one of:

- `Authorization: Bearer <CRON_SECRET>`
- `x-cron-secret: <CRON_SECRET>`
- `?secret=<CRON_SECRET>`

The endpoint fetches market news from Finnhub, asks Gemini to produce a short briefing, renders an HTML email, and sends it through Resend.

## Deployment

The project is configured for Vercel.

```bash
npx vercel --prod
```

`vercel.json` schedules the digest endpoint at `0 12 * * *`.

## Current Limitations

- Authentication is demo-only and stored in local storage. A production version should use a server-backed auth provider such as NextAuth, Clerk, Auth.js, or a custom session system.
- Stock search currently uses a curated local list instead of a live symbol search provider.
- Resend's `onboarding@resend.dev` sender is suitable for testing. Sending to real users at scale requires a verified domain.
- The app is a portfolio/interview project and not financial advice.

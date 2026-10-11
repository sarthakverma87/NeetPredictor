# NEET 2025 College Predictor

Live, mobile-first government MBBS predictor with lead capture. Built for the NEETprep Associate, CEO's Office take-home.

## Stack

- Vite + React + Tailwind CSS
- Prediction runs in the browser from the two provided datasets
- Google Sheets + Apps Script for leads, events and a funnel snapshot
- Optional GA4 (`VITE_GA_MEASUREMENT_ID`)

## How to run

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL on your phone or Chrome device mode.

```bash
npm run verify   # checks the assignment's 600 / AIR 1300 example
npm run build
npm run preview
```

## Where leads are stored

Every valid submit writes one row to the **Leads** tab:

`timestamp, name, phone, score, category, state, predicted_rank` plus duplicate-phone, score band, device and bucket counts.

UTMs live on the **Events** tab only (`timestamp, event, utm_source, utm_medium, utm_campaign, device`). The **Funnel** tab is four rows: `page_view`, `form_start`, `form_submit`, `result_view`.

Until `VITE_SHEETS_WEBHOOK_URL` is set, payloads stay in `localStorage` so the UI still works.

### Connect Google Sheets

1. Create a Google Sheet.
2. **Extensions → Apps Script** and paste `apps-script/Code.gs`.
3. **Deploy → New deployment → Web app**
   - Execute as: *Me*
   - Who has access: *Anyone*
4. Put the web app URL in `.env`:

```bash
VITE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

5. Restart `npm run dev` or redeploy.

Admin view (phones masked):  
`<WEB_APP_URL>?view=admin&key=neet-admin-2026`

Localhost submissions are marked `is_test = TRUE`. Add `?test=1` on the live URL for your own checks.

## UTM links

Replace the host after you deploy:

```
https://YOUR-URL/?utm_source=whatsapp_group&utm_medium=social&utm_campaign=predictor_v1
https://YOUR-URL/?utm_source=instagram_story&utm_medium=social&utm_campaign=predictor_v1
https://YOUR-URL/?utm_source=linkedin&utm_medium=social&utm_campaign=predictor_v1
```

Share these with real people. Do not fake leads.

## Deploy

[Vercel](https://vercel.com) or [Netlify](https://www.netlify.com): import the GitHub repo, add `VITE_SHEETS_WEBHOOK_URL`, deploy the root folder.

## Prediction logic

1. Linear interpolation on `neet_2025_score_to_rank.json`.
2. Compare estimated AIR with the category closing rank (General maps to `UR`).
3. **Safe** ≤ 85% of close · **Moderate** 85–100% · **Reach** 100–115% · above 115% hidden.
4. Max 10 colleges per bucket, sorted by closing rank, home-state badge.

## How AI was used

Claude/Cursor (Grok) helped scaffold the Vite app, write the interpolation/bucket helpers, the Apps Script webhook, and first-pass UI copy. I specified the assignment rules, Google Sheets storage, conversion flow (results only after the phone form), and reviewed the worked example against the JSON.

## Out of scope

User accounts, payments, state-quota counselling, private/deemed colleges, BDS/AYUSH.

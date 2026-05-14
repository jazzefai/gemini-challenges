# Gemini Challenges

5 Gemini experiments for educators, with anonymous response collection and a CSV download link.

---

## Deploy to Vercel in ~10 minutes

### 1. Push this repo to GitHub

```bash
cd gemini-challenges
git init
git add .
git commit -m "initial"
# create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/gemini-challenges.git
git push -u origin main
```

### 2. Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Leave all build settings as-is
4. Click **Deploy** — don't add env vars yet, do that next

---

## Set up response storage (Vercel KV)

Vercel KV is Vercel's built-in key-value store. Free tier is plenty for this.

### Step 1 — Create a KV store

1. In your Vercel project dashboard → **Storage** tab → **Create Database**
2. Choose **KV** → give it any name → Create
3. Click **Connect to Project** → select your project → Connect

Vercel automatically adds the required environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) to your project. No manual copying needed.

### Step 2 — Set a download secret

In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `DOWNLOAD_SECRET` | Any password you choose — keep this private |

Redeploy (or trigger a new deploy) after adding the variable.

---

## Download your responses as CSV

Once the site is live, you can download all responses at any time:

```
https://your-project.vercel.app/api/download?secret=YOUR_PASSWORD
```

Opening that URL in a browser triggers an immediate CSV download (`gemini-responses.csv`). The file opens in Excel, Numbers, or Google Sheets.

The CSV has four columns: `Timestamp`, `Experiment`, `Title`, `Response`.

Keep the URL private — anyone with it can download the responses.

---

## Embed in Notion

1. Deploy to Vercel and copy your public URL (e.g. `https://gemini-challenges.vercel.app`)
2. In any Notion page, type `/embed`
3. Paste the URL
4. Resize the embed block to full width
5. Set the height to at least 800px

Notion's iframe sandbox allows form submissions and external links — everything will work.

---

## What gets collected

Each submission records:

| Field | Example |
|-------|---------|
| Timestamp | `2026-05-14T18:40:00.000Z` |
| Experiment | `Experiment 01` |
| Title | `Fake trend — Make it invent something that doesn't exist...` |
| Response | _(free text from the user)_ |

No user ID, no IP address, no identifying information is collected or stored.

---

## Swap the response method later

All form submissions go to `/api/submit`. To switch backends, replace that file's logic:

- **Google Sheets**: Use the `googleapis` package with a service account (see the `googleapis` npm docs)
- **Airtable**: POST to the Airtable REST API with an API key and base ID
- **Formspree**: Remove `api/submit.js` entirely and point the `fetch` in `index.html` at your Formspree endpoint

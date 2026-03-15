# Myelino Affiliate Dashboard

Internal tool for the Myelino affiliate team to submit, review, and manage video submissions.

---

## Local development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Environment variables

Create a `.env` file at the project root (copy from `.env.example`):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Never commit `.env` — it is gitignored.

---

## Deploying to GitHub Pages

### First-time setup

**1. Create a GitHub repository** and push the project:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

**2. If your repo name differs from `myelino-affiliate-dashboard`**, update the `base` field in `vite.config.js` to match:

```js
base: '/<your-repo-name>/',
```

**3. Set environment variables for the build.**
GitHub Pages serves a static bundle — Vite bakes `VITE_*` variables in at build time. You have two options:

- **Local deploy (simplest):** ensure your `.env` file is present, then run `npm run deploy` from your machine. Vite reads `.env` during the build step.
- **CI deploy:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets under **Settings → Secrets and variables → Actions**, then trigger the build from a workflow.

**4. Enable GitHub Pages** in the repository:
Go to **Settings → Pages → Source** and set the branch to `gh-pages`, folder `/` (root).

### Deploying

```bash
npm run deploy
```

This runs two steps automatically:

| Step | Command | What it does |
|---|---|---|
| `predeploy` | `npm run build` | Compiles the app into `dist/` |
| `deploy` | `gh-pages -d dist` | Pushes `dist/` to the `gh-pages` branch |

GitHub Pages then serves the `gh-pages` branch. Your live URL will be:

```
https://<your-username>.github.io/<repo-name>/
```

Allow 1–2 minutes for the first publish to go live after the `gh-pages` branch is pushed.

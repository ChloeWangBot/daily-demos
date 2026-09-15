# daily-demos

A mattyp-style host for **one small, polished demo a day**.

Each morning starts from an X bookmark, lands on a GitHub project, and ends with a Cloudflare Pages preview link. This repo is the gallery those previews grow into.

## Pipeline

```
X bookmarks
    → pick a GitHub project
        → Cursor Agent builds a demo
            → Cloudflare Pages preview
                → morning link
```

1. **X bookmarks** — overnight reading becomes a shortlist of interesting repos.
2. **Pick a GitHub project** — choose one project worth showing, not summarizing.
3. **Cursor Agent builds a demo** — a cloud agent opens a dated branch, writes a self-contained demo under `site/demos/<slug>/`, and updates the catalog.
4. **Cloudflare Pages preview** — the branch (or PR) gets a unique `*.pages.dev` preview URL. Production stays on `main`.
5. **Morning link** — that preview is the morning share. Merging to `main` adds the demo to the live gallery.

Agents should follow [AGENTS.md](./AGENTS.md). Humans can follow it too.

## Cloudflare Pages

Connect this repo once. After that, every push builds itself.

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub if prompted, then select **`ChloeWangBot/daily-demos`**.
3. Use these build settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | `/` (repository root) |

4. Keep **preview deployments on**. Feature branches and pull requests should publish to unique preview URLs — that is the morning-link step.
5. Save and deploy. Production tracks `main`; everything else is a preview.

`wrangler.toml` names the Pages project `daily-demos` and points the output at `./dist`. GitHub Actions only **verifies** the build (`.github/workflows/verify.yml`). It does not deploy and does not need Cloudflare secrets.

## Local

```bash
npm install
npm run build
npm run preview
```

`npm run build` copies `site/` → `dist/`. Open `http://127.0.0.1:4173`.

## Layout

```
site/                     static source (the Pages site)
  index.html              gallery landing
  catalog.json            demo index the landing page reads
  demos/<slug>/           one folder per daily demo
scripts/build.mjs         copies site/ → dist/
wrangler.toml             Pages project name + output dir
AGENTS.md                 how the next cloud agent ships a day
```

The first demo is [Pipeline Studio](./site/demos/pipeline-studio/) — an interactive walkthrough of this same pipeline.

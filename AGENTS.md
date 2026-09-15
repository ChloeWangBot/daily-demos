# Agent guide

This repo is a static daily-demos host. Future cloud agents add **one demo per day**, then stop.

## What you are shipping

A self-contained, interactive demo that belongs in the morning gallery. Not a blog post. Not a README rewrite. Not a deploy script that needs secrets.

## Branch

```
daily/YYYY-MM-DD-slug
```

Examples: `daily/2026-09-16-waveform-kit`, `daily/2026-09-17-token-meter`.

- Branch from the latest `main`.
- `slug` is lowercase kebab-case, short, and unique under `site/demos/`.
- Do not commit on `main` unless the operator explicitly asks you to.

## Files

Put the demo here:

```
site/demos/<slug>/
  index.html      required
  styles.css      optional, preferred over a giant inline <style>
  app.js          optional, preferred over a giant inline <script>
```

Rules:

- Keep the demo self-contained under that folder. Shared tokens live in `site/styles/` if you need them; do not invent a new design system.
- Use relative asset paths (`./styles.css`, `./app.js`) so the demo works at `/demos/<slug>/`.
- No build step inside the demo folder. The host build is a copy: `site/` → `dist/`.
- No secrets, API keys, Cloudflare tokens, or `.dev.vars`.
- No network calls that require credentials. Public, cacheable assets are fine.
- Make it interactive and finished — a person should be able to click around for a minute and understand the idea.

## Catalog

Update `site/catalog.json`. Newest demo first.

```json
{
  "slug": "your-slug",
  "title": "Readable title",
  "date": "2026-09-16",
  "summary": "One sentence that says what someone can do.",
  "tags": ["tag-one", "tag-two"],
  "source": {
    "github": "https://github.com/org/repo",
    "note": "Why this bookmark became a demo"
  }
}
```

`slug` must match the folder name. `date` is the demo day (`YYYY-MM-DD`). Leave existing entries intact.

## Build

From the repo root:

```bash
npm install
npm run build
```

`npm run build` must exit 0. Confirm `dist/index.html` and `dist/demos/<slug>/index.html` exist. Use `npm run preview` if you need to click through locally.

GitHub Actions (`.github/workflows/verify.yml`) runs this same build. It does not deploy.

## Preview and morning link

Cloudflare Pages is already connected to `ChloeWangBot/daily-demos`:

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Preview deployments: on

Push the `daily/YYYY-MM-DD-slug` branch (open a PR if that is the house process). The preview URL **is** the morning link. Do not add Wrangler deploy steps or Cloudflare secrets to CI.

## Definition of done

- [ ] Branch name matches `daily/YYYY-MM-DD-slug`
- [ ] Demo lives under `site/demos/<slug>/`
- [ ] `site/catalog.json` lists the new demo first
- [ ] Landing page will show the new card after a catalog update (no extra wiring)
- [ ] `npm run build` passes
- [ ] No secrets committed

## Out of scope

Do not re-scaffold the host, rename the Pages project, change `wrangler.toml` output, or expand `verify.yml` into a deploy workflow.

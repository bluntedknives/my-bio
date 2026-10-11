# my-bio — repository notes

## What it is
A personal "bio link" built with Next.js 16 (App Router, webpack) + React 19 + Tailwind v4.
Single-page (`app/page.tsx`) with tabbed sections: BIO, PROJECTS, SOCIALS, TERMINAL.

## Commands
- `npm install`
- `npm run dev` — dev server. Run with `PORT=12000 npm run dev`.
- `npm run build` / `npm start`

## Dev-server gotcha
When viewing through a proxy host (e.g. the OpenHands work-1/work-2 hosts), the host MUST be
listed in `allowedDevOrigins` in `next.config.js`, or Next blocks cross-origin dev resources
(HMR + fonts) and the client components never hydrate (page stuck on "Initializing Client").

## Key architecture
- `app/page.tsx` — main page markup (client component). Renders header, tabs, BIO/PROJECTS/SOCIALS/TERMINAL.
- `components/MusicPlayer.tsx` — audio player + WebAudio analyser driving an audio-reactive visualizer.
  Emits `bio:audio-reactive` custom events (bass/energy/pulse) consumed by `DitheringBackground`.
- `components/DitheringBackground.tsx` — `@paper-design/shaders-react` dithering shader background, audio-reactive.
- `components/Lockscreen.tsx` — click-to-enter overlay; dispatches `bio:unlock` which starts music.
- `components/Projects.tsx`, `CryptoModal.tsx`, `InteractiveTerminal.tsx`, `ViewCounter.tsx`,
  `DiscordStatus.tsx`, `TypingEffect.tsx`, `StatusPoller.tsx` — feature components.
- `app/api/music/route.ts` — scans `public/music/music/SoundCloud.app_Leaks` for mp3 + reads ID3 tags.
- `app/api/discord-user|views|status` — Discord (Lanyard), view counter (Supabase), visitor logging.
- `app/globals.css` — Tailwind v4 `@import` + custom `.console-*`, `.tui-*`, `.void-*` classes.

## Design reference
Redesign targets the cosmin.gg / guns.lol "scroll bio" look: a single centered column
(~440px) that scrolls the whole page — avatar header, typed bio, always-mounted music
player, then projects / socials / wallets / terminal stacked as sections, with a footer
(pills + view counter). Muted `/55` opacity text, hairline borders, sans body + mono
details. The music player MUST stay mounted at all times (it is the app's single
AudioContext owner); do not put it behind a tab/conditional.

## Gotchas
- `styled-jsx` is NOT installed, so `<style jsx>` in components silently drops CSS. Use real CSS classes.
- `components/ClientEffects.tsx` is unused by `page.tsx` (page imports what it needs directly).
- `.gitignore` ignores `.env*`; no env file ships with the repo.

## Git remotes & pushing
Push over HTTPS, not SSH. The sandbox's paramiko-based SSH transport is capped at ~60 KB/s and
stalls on large pushes (the music blobs are ~170 MB); HTTPS finishes in seconds.
`origin` is `https://github.com/bluntedknives/my-bio.git`.

### GitHub credentials (durable — set up once)
- `gh` CLI is authenticated as `bluntedknives` (`~/.config/gh/hosts.yml`); prefer `gh api` / `gh pr`.
- Global git identity: `bluntedknives <bluntedknives@users.noreply.github.com>`.
- Global credential helper: `~/.local/bin/git-credential-github.sh` (mode 700). It reads the
  token from `$GITHUB_TOKEN` first, then falls back to `/workspace/project/.env` (key `github`).
- Never place the helper in `/tmp`: that directory is wiped between sessions, which silently
  breaks pushes with `could not read Username for 'https://github.com'`.
- Most robust: register the PAT as an OpenHands secret named `GITHUB_TOKEN` so it is injected
  automatically and the `.env` fallback becomes unnecessary.

## Running the dev server "forever"
`/workspace/serve-my-bio.sh` is a restart-on-exit wrapper that runs `npm run dev -- --port 12000`
and is relaunched by an idempotent guard appended to `~/.bashrc`. Logs: `/tmp/my-bio-server.log`.
The server is reachable on port 12000 (work-1 host).

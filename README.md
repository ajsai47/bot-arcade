# Comet Catcher (bot-arcade)

A tiny browser game owned by a Devin Bot. The Bot's only instruction:

> **Own this toy game and make it better every hour.**

It play-tests the game, files tickets on its board, runs parallel Devin sessions on them, merges their PRs and posts a daily report in [`reports/`](reports/).

## Play

```sh
npx serve .        # or: python3 -m http.server
```

Open `http://localhost:3000` (arrow keys / A-D). Add `?demo=1` to watch it play itself.

## Test

```sh
npm test           # Playwright smoke test: loads the game in demo mode and checks it scores
```

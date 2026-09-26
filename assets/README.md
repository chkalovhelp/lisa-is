# Media assets for lisa-is.com

Drop your real files here with **exactly these names** — the site picks them up automatically.
Nothing here is generated: until a file exists, the site shows a styled placeholder with the file name.

| File | Where it appears | Status |
|---|---|---|
| `assets/hero.jpg` | Screen 1 — hero photo (also the social/Open Graph preview) | ✅ uploaded |
| `assets/lisa-move.mp4` | PROOF — "see her move" video (portrait 720×1280) | ✅ uploaded |
| `assets/poster.jpg` | Poster frame for the video | ✅ uploaded |
| `assets/lisa-2.jpg` | Proof gallery — tile 1 (tall, ~4:5) | ⬜ waiting |
| `assets/lisa-3.jpg` | Proof gallery — tile 2 (square, ~1:1) | ⬜ waiting |
| `assets/lisa-4.jpg` | Proof gallery — tile 3 (portrait, ~3:4) | ⬜ waiting |
| `assets/lisa-5.jpg` | Proof gallery — tile 4 (wide, ~16:10) | ⬜ waiting |
| `assets/lisa-6.jpg` | Proof gallery — tile 5 (full-width, ~21:9) | ⬜ waiting |

## Video

The site plays `assets/lisa-move.mp4`, muted-autoplay on scroll, with native controls so a
visitor can unmute. It is lazy-loaded: nothing is fetched until the PROOF section is approached.
The poster frame is shown first, so the section never looks empty.

To swap the video later, replace `assets/lisa-move.mp4` (and optionally `poster.jpg`) —
no code change needed. Recommended: H.264 MP4 with `-movflags +faststart`, under ~10 MB.

## Tips

- Keep photos reasonably sized (long edge ≤ 2000 px, JPEG quality ~82) — Pages serves them as-is.
- No stock images, no AI illustrations, no renders: the whole point of PROOF is that these are real.

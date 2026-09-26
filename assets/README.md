# Media assets for lisa-is.com

Real files only — the site picks them up automatically.
Nothing here is generated: no AI images, no stock, no renders.

| File | Where it appears | Status |
|---|---|---|
| `assets/hero.jpg` | Screen 1 — hero photo (also the Open Graph preview) | ✅ uploaded (853×1280) |
| `assets/lisa-move.mp4` | PROOF — "see her move" video (720×1280, 15 s) | ✅ uploaded |
| `assets/poster.jpg` | Poster frame for the video (real frame, `-ss 1.5`) | ✅ uploaded |
| `assets/lisa-2.jpg` | Proof gallery — tile 1 (3:4) | ✅ uploaded (960×1280) |
| `assets/lisa-3.jpg` | Proof gallery — tile 2 (3:4) | ✅ uploaded (960×1280) |
| `assets/lisa-4.jpg` | Proof gallery — tile 3 (3:4) | ✅ uploaded (960×1280) |
| `assets/lisa-5.jpg` | Proof gallery — tile 4 (3:4) | ✅ uploaded (960×1280) |
| `assets/lisa-6.jpg` | Proof gallery — tile 5 (3:4) | ✅ uploaded (720×1280) |
| `assets/lisa-7.jpg` | Proof gallery — tile 6 (3:4) | ✅ uploaded (960×1280) |

Original files (untouched) are kept outside the deploy in `_source_originals/`.

## Video

The site plays `assets/lisa-move.mp4`, muted-autoplay on scroll, with native controls so a
visitor can unmute. It is lazy-loaded: nothing is fetched until the PROOF section is approached.
The poster frame is shown first, so the section never looks empty.

To swap the video later, replace `assets/lisa-move.mp4` (and optionally `poster.jpg`) —
no code change needed. Recommended: H.264 MP4 with `-movflags +faststart`, under ~10 MB.

## Tips

- Keep photos reasonably sized (long edge ≤ 2000 px, JPEG quality ~82) — Pages serves them as-is.
- No stock images, no AI illustrations, no renders: the whole point of PROOF is that these are real.

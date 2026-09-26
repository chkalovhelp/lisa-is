# Media assets for lisa-is.com

Drop your real files here with **exactly these names** — the site picks them up automatically.
Nothing here is generated: until a file exists, the site shows a styled placeholder with the file name.

| File | Where it appears | Notes |
|---|---|---|
| `assets/hero.jpg` | Screen 1 — hero, 2/3 of the viewport | Your main photo. Also used as the social preview (Open Graph) image. Portrait orientation works best (e.g. 1200×1500). |
| `assets/lisa-2.jpg` | Proof gallery — tile 1 (tall) | Portrait, e.g. 1200×1500 |
| `assets/lisa-3.jpg` | Proof gallery — tile 2 (square) | e.g. 1200×1200 |
| `assets/lisa-4.jpg` | Proof gallery — tile 3 (portrait) | e.g. 1200×1600 |
| `assets/lisa-5.jpg` | Proof gallery — tile 4 (wide) | e.g. 1600×1000 |
| `assets/lisa-6.jpg` | Proof gallery — tile 5 (full-width) | e.g. 2000×857 |
| `assets/poster.jpg` | Video poster frame | A still from the video, 16:9, e.g. 1600×900 |

## Video

The site plays `lisa-intro.mp4` from the repository root (already present).
To use a different file, either replace `lisa-intro.mp4`, or edit the `data-src` / `poster`
attributes of `<video id="lisaVideo">` in `index.html`.

Recommended: H.264 MP4, 1080p, audio, under ~15 MB. Poster + lazy loading are already wired,
so the video is not downloaded until the visitor scrolls to the PROOF section.

## Tips

- Keep photos reasonably sized (long edge ≤ 2000 px, JPEG quality ~82) — Pages serves them as-is.
- No stock images, no AI illustrations, no renders: the whole point of PROOF is that these are real.

# WordPress.org directory assets

These images are the **plugin directory assets** shown on the WordPress.org
plugin page and in the Plugins screen. They are **NOT** part of the plugin ZIP —
do not bundle them inside `tacksuite-chat/`.

## Where they go

WordPress.org plugins use SVN. These files go in the repository's top-level
`assets/` folder, a sibling of `trunk/`:

```
<svn-root>/
├── assets/          ← put these files here
│   ├── icon-128x128.png
│   ├── icon-256x256.png
│   └── icon.svg
├── trunk/           ← the plugin itself (contents of tacksuite-chat/)
└── tags/
```

After copying, commit only the `assets/` folder:

```bash
svn add assets/*
svn ci -m "Add plugin icon"
```

(If you deploy via the 10up "WordPress Plugin Deploy" GitHub Action, point its
`ASSETS_DIR` at this folder instead.)

## Files included

| File | Size | Purpose |
|---|---|---|
| `icon-128x128.png` | 128×128 | Plugin icon (standard) |
| `icon-256x256.png` | 256×256 | Plugin icon (retina) |
| `icon.svg` | vector | Plugin icon (scalable; WordPress.org renders it when present) |
| `banner-772x250.png` | 772×250 | Header banner (standard) |
| `banner-1544x500.png` | 1544×500 | Header banner (retina) |

Sources: `icon.svg` / `logo.svg` from the TackSuite brand assets. The banners are
the vector `logo.svg` wordmark rendered crisply and centered on a white canvas at
the exact banner dimensions (no upscaling blur, no distortion).

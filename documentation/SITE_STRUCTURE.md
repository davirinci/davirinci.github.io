# Site Structure Map

This document maps where each part of the site lives and where new files should be added.

## Top-Level Layout

```text
/
├─ index.html                # Home page
├─ shop.html                 # Shop landing page
├─ contact.html              # Contact page
├─ navbar.html               # Shared navigation iframe content
├─ css/
│  └─ styles.css             # Global styles and theme variables
├─ js/
│  ├─ gallery.js             # Gallery filtering + modal behavior
│  ├─ justified-layout.js    # Poster gallery row-packing layout
│  ├─ theme.js               # Theme switching logic
│  └─ disable-contextmenu.js # Right-click/drag restrictions
├─ images/
│  └─ banner.jpeg            # Shared hero/banner asset(s)
├─ shop/
│  ├─ bookmarks.html         # Bookmarks gallery page
│  ├─ posters.html           # Posters/Postcards gallery page
│  ├─ stickers.html          # Stickers gallery page
│  └─ images/
│     ├─ bookmarks/          # Bookmark image assets
│     ├─ posters/            # Poster/Postcard image assets
│     └─ stickers/           # Sticker image assets
├─ works/                    # Portfolio/work pages (non-shop)
├─ build.js                  # Regenerates gallery HTML from image folders
├─ package.json              # Scripts + dependencies
└─ documentation/            # Project docs and contributor guides
```

## What Goes Where

- New standalone site page: add at repo root (example: `about.html`) if it is a main-nav page.
- New shop gallery page: add under `shop/` (example: `shop/prints.html`).
- Global styling: update `css/styles.css`.
- Page-specific behavior: add or update files in `js/`, then include them in the relevant HTML page.
- Shared assets used across pages: place in `images/`.
- Gallery-specific assets: place in `shop/images/<gallery-name>/`.

## Adding A New Gallery (Recommended Pattern)

1. Create a page in `shop/` (copy structure from `shop/stickers.html` or `shop/posters.html`).
2. Create image folder at `shop/images/<new-gallery>/`.
3. Add images using the naming rules in `documentation/NAMING_CONVENTIONS.md`.
4. Update `build.js` to include processing for the new gallery type.
5. Run `node build.js` to generate filters/tile metadata.
6. Verify layout behavior in browser and adjust CSS if needed.

## Adding A Non-Gallery Page

1. Create the HTML file at root (or in a dedicated folder if section-specific).
2. Include shared navbar iframe and core stylesheet.
3. Reuse existing CSS variables/themes in `css/styles.css`.
4. Add a dedicated JS file only if page logic is unique.
5. Link page from `navbar.html` (and any relevant landing pages).

## File Placement Rules

- Do not put page HTML inside `images/` or `js/`.
- Keep all gallery raw assets under `shop/images/`.
- Keep build/developer docs in `documentation/`.
- Keep reusable site logic centralized (avoid duplicating scripts inline in multiple pages).

## Quick References

- Build pipeline: `documentation/BUILD_PROCESS.md`
- Naming rules: `documentation/NAMING_CONVENTIONS.md`
- Image prep: `documentation/IMAGE_FORMATTING.md`
- Poster layout algo: `documentation/JUSTIFIED_LAYOUT.md`
- Dev standards: `documentation/DEVELOPMENT_GUIDELINES.md`

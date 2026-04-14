# AGENTS.md

Master implementation context for this repository.

Purpose:

- Give developers and AI coding tools enough context to add pages/features without prior chat history.
- Define exact implementation contracts used by this site.
- Force this file to stay up to date as the site evolves.

## 1) Project Snapshot

- Site type: static portfolio/shop (GitHub Pages compatible).
- Build language: Node.js script (`build.js`) for gallery regeneration.
- Global styling: `css/styles.css`.
- Global scripts: `js/theme.js`, `js/disable-contextmenu.js`.
- Gallery scripts: `js/gallery.js` and `js/justified-layout.js` (posters only).

Main pages:

- `index.html`
- `shop.html`
- `showcase.html`
- `contact.html`
- `footer.html`

Showcase pages:

- `works/photography.html`
- `works/client-projects.html`
- `works/process-experiments.html`
- `works/photos/photos-1.html`
- `works/photos/photos-2.html`
- `works/photos/photos-3.html`

Showcase assets:

- `works/images/photos-1/`
- `works/images/photos-2/`
- `works/images/photos-3/`

Gallery pages:

- `shop/stickers.html`
- `shop/bookmarks.html`
- `shop/posters.html`

Gallery assets:

- `shop/images/stickers/`
- `shop/images/bookmarks/`
- `shop/images/posters/`

## 2) Non-Negotiable Conventions

1. Theme preload script must be in `<head>` before CSS on all page HTML files:

```html
<script>
  const saved = localStorage.getItem("theme");
  if (saved && ["royal", "deep", "dark", "light"].includes(saved)) {
    document.documentElement.setAttribute("data-theme", saved);
  }
</script>
```

2. Standard scripts for normal pages:

```html
<script src="js/disable-contextmenu.js"></script>
<script src="js/theme.js"></script>
```

For pages in `shop/`, use `../js/...` paths.

3. Shared navbar is rendered via iframe:

```html
<iframe
  src="/navbar.html"
  id="navbar"
  title="Navigation"
  style="height: 48px"
></iframe>
```

4. Shared footer is rendered via iframe on all pages:

```html
<iframe
  src="/footer.html"
  id="footer"
  title="Footer"
  style="height: 260px"
></iframe>
```

Footer iframe behavior:

- `#footer` uses the same iframe styling pattern as `#navbar` (block, full-width, borderless).
- Footer height is adaptive via `postMessage` from `footer.html` and resize handling in `js/theme.js`.

5. Do not manually hand-edit generated gallery tile blocks if avoidable; prefer changing source images and running `node build.js`.

6. Filter UX contract currently in generated galleries:

- Search input has no `h3` heading above it.
- OC toggle has no `h3` heading above it.
- OC toggle label text is exactly `Original Content Only`.

## 3) CSS/Theme Contract

Theme variables live at top of `css/styles.css`:

- `:root` (royal)
- `:root[data-theme="deep"]`
- `:root[data-theme="dark"]`
- `:root[data-theme="light"]`

Important variables used broadly:

- `--bg`, `--text`, `--nav-bg`, `--nav-text`
- `--tile-bg`, `--tile-shadow`
- `--btn-*`

Current tile behavior:

- Square gallery uses 5 columns on large screens (`min-width: 1200px`).
- Square gallery uses minimum 2 columns on small screens (`max-width: 600px`).
- Square tile images use `object-fit: contain` to preserve transparency and full image bounds.
- Square tile shadows are intentionally removed to preserve transparency visibility.

When changing gallery visuals, verify both:

- `css/styles.css` selectors for `.square-gallery`, `.square-tile`, `.portrait-gallery`, `.portrait-tile`
- Any build-generated classes still match these selectors.

## 4) Gallery Runtime Contract (`js/gallery.js`)

Entry point:

- `initializeGallery(gallerySelector, config)`

Behavior:

- If pre-rendered tiles exist (`button[data-index]`), it only wires lightbox behavior.
- If tiles do not exist, it can generate from `config.images` / sequential pattern / explicit file list.
- Gallery order randomization is runtime-only (client-side) and does not require rebuilding HTML.

Filters:

- `initializeGalleryFilters()` binds:
  - `.filter-btn` click
  - `#oc-toggle` change
  - `#gallery-search` input
- `applyGalleryFilters()` filters by:
  - `data-type`
  - `data-topic`
  - `data-oc`
  - `data-search-terms`

Lightbox requirements in HTML:

- `.lightbox` container
- `.lightbox__carousel`
- close/prev/next buttons
- slide structure with center/adjacent slide classes
- optional controls: zoom, transition mode, slideshow
- page must load `js/gallery.js` and call `initializeGallery(...)` after tiles are present

Important failure mode:

- If gallery tiles render but click-to-open does nothing, first verify the page still has lightbox DOM, then verify `js/gallery.js` is included and `initializeGallery` is called.

If you create a new gallery page and want lightbox support, use the same lightbox DOM structure from existing gallery pages.

Randomization controls:

- A `Randomize Now` button is injected above initialized galleries.
- A `Randomize on Reload` toggle is injected above initialized galleries.
- `Randomize on Reload` defaults to off and persists per page/gallery in `localStorage`.

## 5) Posters Layout Contract (`js/justified-layout.js`)

This script only targets:

```css
.portrait-gallery[aria-label="Print thumbnails"]
```

It relies on each visible poster tile containing:

- `data-width`
- `data-height`

Generated by `build.js` for posters.

If poster layout breaks, first check that those data attributes are present and numeric.

## 6) Build Contract (`build.js`)

Build command:

- `node build.js` or `npm run build`

What build updates:

- `shop/bookmarks.html`
- `shop/stickers.html`
- `shop/posters.html`
- `works/photos/photos-1.html`
- `works/photos/photos-2.html`
- `works/photos/photos-3.html`

Filename parsing assumptions:

- Format: `{type}-{topic}-{rest}.webp`
- `-oc` token can be anywhere in filename and is interpreted as Original Content flag.
- Topic supports `the-*` special handling for display label generation.

Generated filter block is centralized in:

- `generateFilterHtml(types, topics)`

Critical: if you change filter markup in pages, also update `generateFilterHtml` or build will overwrite it.

Known implementation note:

- Bookmark tile generation currently includes `data-width`, `data-height`, and `data-orientation` fields that may be `undefined` because dimensions are not computed there. This is harmless for bookmark rendering but should be cleaned up if strict metadata quality is required.

- Photography gallery generation reads from `works/images/photos-1/`, `works/images/photos-2/`, and `works/images/photos-3/` and rewrites the matching `works/photos/photos-*.html` pages with bordered-off tiles and image metadata.
- Photography pages must keep their lightbox block and gallery initialization scripts outside the build-replaced tile region so image click behavior is preserved after `node build.js`.

## 7) Add A New Page (Standard Template)

Use this base:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title – Various Thingamjigs</title>
    <script>
      const saved = localStorage.getItem("theme");
      if (saved && ["royal", "deep", "dark", "light"].includes(saved)) {
        document.documentElement.setAttribute("data-theme", saved);
      }
    </script>
    <link rel="stylesheet" href="css/styles.css" />
  </head>
  <body>
    <header id="mainHeader">
      <div class="container">
        <h1>Various Thingamjigs</h1>
      </div>
    </header>

    <iframe
      src="/navbar.html"
      id="navbar"
      title="Navigation"
      style="height: 48px"
    ></iframe>

    <main class="container">
      <!-- page content -->
    </main>

    <iframe
      src="/footer.html"
      id="footer"
      title="Footer"
      style="height: 260px"
    ></iframe>

    <script src="js/disable-contextmenu.js"></script>
    <script src="js/theme.js"></script>
  </body>
</html>
```

For pages under `shop/`, convert relative paths:

- CSS: `../css/styles.css`
- JS: `../js/...`

## 8) Add A New Gallery Category

Checklist:

1. Create folder `shop/images/<category>/`.
2. Create page `shop/<category>.html` by copying structure from stickers/bookmarks/posters.
3. Ensure page includes filters container, gallery container, and lightbox markup.
4. Extend `build.js` with a new update function for the category.
5. Wire category from `shop.html` tiles list and footer/nav links where appropriate.
6. Run `node build.js`.
7. Validate:

- Filters work (type/topic/oc/search).
- Lightbox opens only visible tiles after filtering.
- Theme toggle works from navbar.

## 9) Change Management Rules (Must Follow)

Whenever site code changes, update this file in the same commit if any of these changed:

- New page/path/folder.
- New script, CSS module, or major selector contract.
- Build script behavior or generated HTML structure.
- Theme names, filter semantics, or lightbox controls.
- Gallery metadata fields (`data-*`) or algorithm assumptions.

Required update steps per feature:

1. Edit implementation files.
2. Update relevant section(s) in this file.
3. Add one line to the maintenance log below.

## 10) Maintenance Log

Format:

- `YYYY-MM-DD: <summary> | files: <comma-separated list>`

Entries:

- `2026-04-14: Created AGENTS master context and update protocol | files: AGENTS.md`
- `2026-04-14: Added Showcase page and wired nav/site maps | files: showcase.html, navbar.html, index.html, shop.html, contact.html, AGENTS.md`
- `2026-04-14: Centralized footer into shared footer.html iframe and removed inline page footers | files: footer.html, navbar.html, index.html, shop.html, contact.html, showcase.html, shop/bookmarks.html, shop/posters.html, shop/stickers.html, AGENTS.md`
- `2026-04-14: Matched footer iframe behavior to navbar (full-width, borderless) and added adaptive iframe height | files: css/styles.css, js/theme.js, footer.html, AGENTS.md`
- `2026-04-14: Synced live theme updates into navbar/footer iframes so footer changes instantly without reload | files: js/theme.js, AGENTS.md`
- `2026-04-14: Updated Showcase to tile-based navigation and added starter works pages | files: showcase.html, works/featured-designs.html, works/client-projects.html, works/process-experiments.html, AGENTS.md`
- `2026-04-14: Linked Photography tiles to dedicated borderless justified-layout pages | files: works/featured-designs.html, works/late-winter-morning-walk.html, works/placeholder-project-two.html, works/placeholder-project-three.html, css/styles.css, AGENTS.md`
- `2026-04-14: Removed sidebar/grid spacing on borderless justified pages so photography layouts span full width | files: css/styles.css, AGENTS.md`
- `2026-04-14: Added side gutters equal to tile spacing and title/description breathing room on borderless photography pages | files: css/styles.css, works/late-winter-morning-walk.html, works/placeholder-project-two.html, works/placeholder-project-three.html, AGENTS.md`
- `2026-04-14: Renamed photography pages and folders to photos-* for simpler build/update flow | files: works/photos-1.html, works/photos-2.html, works/photos-3.html, works/images/photos-1/, works/images/photos-2/, works/images/photos-3/, showcase.html, build.js, AGENTS.md`
- `2026-04-14: Left featured-designs.html as a redirect to photos-1 for legacy URLs | files: works/featured-designs.html, AGENTS.md`
- `2026-04-14: Reorganized showcase sections and moved photos pages under works/photos/ with updated build paths | files: showcase.html, works/photography.html, works/photos/photos-1.html, works/photos/photos-2.html, works/photos/photos-3.html, works/featured-designs.html, build.js, AGENTS.md`
- `2026-04-14: Restored photo page click-to-open viewer by adding lightbox DOM and gallery initialization to works/photos pages; documented required lightbox/runtime contract | files: works/photos/photos-1.html, works/photos/photos-2.html, works/photos/photos-3.html, AGENTS.md, README.md, documentation/DEVELOPMENT_GUIDELINES.md`
- `2026-04-14: Added runtime gallery randomization controls (Randomize Now and Randomize on Reload with saved preference) so image order can shuffle without rebuilding | files: js/gallery.js, css/styles.css, AGENTS.md, README.md, documentation/DEVELOPMENT_GUIDELINES.md`
- `2026-04-14: Improved photo gallery responsiveness by forcing justified relayout after randomization, refined randomize control styling (button + switch), and increased borderless title/description spacing | files: js/gallery.js, js/justified-layout.js, css/styles.css, AGENTS.md`
- `2026-04-14: Unified phone and desktop vw-responsive justified layout behavior for poster/photo galleries and removed phone-only fallback overrides | files: js/justified-layout.js, css/styles.css, AGENTS.md`
- `2026-04-14: Enforced minimum 4 columns per row on large screens for posters page in justified layout packing | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Added viewport-height row cap to justified layout so poster/photo tiles do not render overly tall while preserving responsive packing | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Restored strict full-width row fill in justified layout by removing row-height clamping that introduced right-edge gaps | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Tuned justified row packing to continue adding items when row height exceeds 80vh, keeping full-width fill while reducing oversized rows | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Refined justified row-height threshold to 65vh for poster/photo galleries to reduce oversized rows while preserving full-width fill | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Enforced 65vh row-height cap by appending additional items before row finalize, preventing oversized rows after portrait pairing | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Limited last-row tile height to 65vh in justified layout while keeping non-last rows width-filled | files: js/justified-layout.js, AGENTS.md`
- `2026-04-14: Increased photos-page title line spacing and reduced description line spacing to match for balanced typography | files: css/styles.css, AGENTS.md`

# Build Process & Workflow

## Automated Deployment

Galleries update automatically when you push to the `main` branch:

1. Add images to `shop/images/{category}/` folders
2. Commit and push changes
3. GitHub Actions automatically runs `build.js`
4. Gallery pages are regenerated with updated filters and metadata
5. Changes are committed back to the repository

## Manual Build

If you need to build manually:

```bash
npm run build
```

Or directly:

```bash
node build.js
```

## Local Development

Start a local development server:

```bash
npm start  # Starts local server with live reload
```

## Build Script Details

The `build.js` script processes each gallery:

### What it does:

1. **Scans image directories** for `.webp` files
2. **Parses filenames** according to naming conventions
3. **Extracts image dimensions** using `image-size` library
4. **Generates filter buttons** based on unique types and topics found
5. **Creates gallery HTML** with data attributes for filtering
6. **Embeds configuration** as inline JavaScript for gallery initialization

### For each gallery type:

**Bookmarks:**

- Extracts artist and album from filenames
- Groups by artist
- Sorts alphabetically

**Posters:**

- Extracts dimensions for justified layout
- Calculates aspect ratios
- Determines orientation (portrait/landscape)

**Stickers:**

- Sequential ordering by filename
- Simple grid layout (no dimension extraction needed)

## GitHub Actions Workflow

Located in `.github/workflows/`, the workflow:

1. Triggers on push to `main` branch
2. Installs Node.js and dependencies
3. Runs `npm run build`
4. Commits generated changes back to repository
5. Pushes to `main` branch

This ensures galleries always reflect the current images without manual intervention.

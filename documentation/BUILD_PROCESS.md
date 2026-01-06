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

The `build.js` script processes each gallery through a series of automated steps:

### Step-by-Step Process

#### 1. Filename Parsing

For each `.webp` file in the gallery directory:

- **Split filename** by hyphens into segments
- **Extract type** from first segment
- **Extract topic** from second segment
  - Special handling for "the-" prefix (e.g., `the-beatles` → "The Beatles")
- **Detect OC flag** by checking for `-oc` anywhere in filename
- **Generate search terms** from topic + remaining segments (excluding numbers)
- **Format labels** for display (title-case: `kendricklamar` → "KendrickLamar")

**Example:** `albums-the-beatles-yellow-submarine-oc.webp`

- Type: `albums`
- Topic: `the-beatles` → "The Beatles"
- Search terms: `["the", "beatles", "yellow", "submarine"]`
- OC: `true`

#### 2. Image Dimension Extraction (Posters Only)

For posters with mixed aspect ratios:

- **Read image file** using `image-size` library
- **Extract width and height** in pixels
- **Calculate aspect ratio** (width ÷ height)
- **Determine orientation** (portrait if ratio < 1, landscape if ratio > 1)
- **Embed as data attributes** for JavaScript layout calculations

#### 3. Filter Generation

Based on parsed filenames:

- **Collect unique types** across all files
- **Collect unique topics** across all files
- **Sort alphabetically** for consistent display
- **Generate HTML** for filter buttons with data attributes

#### 4. Gallery HTML Generation

For each image:

- **Create tile element** with semantic HTML (`<button>` for accessibility)
- **Add data attributes:**
  - `data-index` - Position in gallery
  - `data-type` - Raw type slug (lowercase)
  - `data-topic` - Raw topic slug (lowercase with hyphens)
  - `data-oc` - Boolean string (`"true"` or `"false"`)
  - `data-search-terms` - Space-separated searchable words
  - `data-width`, `data-height` - Dimensions (posters only)
  - `data-orientation` - Portrait/landscape (posters only)
- **Set image source** with relative path
- **Add alt text** from topic name

#### 5. HTML File Updates

- **Read existing HTML** file for the gallery
- **Replace filter section** with newly generated filter buttons
- **Replace gallery content** with newly generated tiles
- **Preserve structure** (header, scripts, styles remain untouched)
- **Write updated HTML** back to file

#### 6. JavaScript Configuration

Generate inline JavaScript for each gallery:

```javascript
{
  images: ["./images/category/file1.webp", ...],
  types: ["Type1", "Type2", ...],
  topics: ["Topic1", "Topic2", ...]
}
```

This config is embedded in the HTML for instant client-side initialization.

### Gallery-Specific Processing

**Bookmarks:**

- Extracts artist and album from filenames
- Groups by artist
- Sorts alphabetically by artist, then album
- No dimension extraction needed (uniform grid)

**Posters:**

- Extracts dimensions for justified layout algorithm
- Calculates aspect ratios for packing
- Determines orientation for layout decisions
- Embeds dimensional data in HTML

**Stickers:**

- Sequential ordering by filename (alphabetical)
- Simple grid layout (no dimension extraction)
- Maintains numeric ordering within series

## GitHub Actions Workflow

Located in `.github/workflows/`, the workflow:

1. Triggers on push to `main` branch
2. Installs Node.js and dependencies
3. Runs `npm run build`
4. Commits generated changes back to repository
5. Pushes to `main` branch

This ensures galleries always reflect the current images without manual intervention.

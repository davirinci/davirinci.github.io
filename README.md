# Davinci Portfolio

Portfolio site for graphic designer Virinci, featuring a custom justified gallery layout and automated build system.

## 📚 Documentation

- **[Naming Conventions](documentation/NAMING_CONVENTIONS.md)** - File naming rules for image assets
- **[Build Process](documentation/BUILD_PROCESS.md)** - Automated workflow and build details
- **[Development Guidelines](documentation/DEVELOPMENT_GUIDELINES.md)** - HTML/CSS/JS standards for adding pages

## 🚀 Quick Start

### Adding Images

1. Add `.webp` images to `shop/images/{category}/` folders following [naming conventions](documentation/NAMING_CONVENTIONS.md)
2. Commit and push to `main`
3. GitHub Actions automatically rebuilds galleries

### Local Development

```bash
npm start  # Start local server
npm run build  # Manual build
```

## 🖼️ Gallery Features

### Posters (Justified Layout)

Uses a custom justified gallery algorithm that dynamically packs images to fill each row exactly to the container width, similar to Unsplash or Flickr.

**How it works:**

- Each image is assigned "units" based on aspect ratio (portrait ≈ 1.0, landscape ≈ 1.6)
- Algorithm groups images into rows targeting specific unit counts (varies by screen size)
- Row heights are calculated to fill container width precisely, eliminating gaps
- Dimensions are extracted during build and embedded as data attributes for instant layout
- MutationObserver re-calculates layout when filters change or window resizes

**Features:**

- Preserves aspect ratios without cropping
- Responsive breakpoints adjust packing density
- Type/Topic filtering, search, OC toggle

### Bookmarks

Grid layout with artist grouping and automatic sorting.

### Stickers

Uniform grid layout with sequential ordering.

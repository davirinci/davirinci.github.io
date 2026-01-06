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

Custom algorithm that packs images to fill rows precisely. Images are assigned "units" based on aspect ratio, then grouped into rows that fill the container width exactly. Dimensions are extracted during build for instant layout.

### Bookmarks

Grid layout with artist grouping and automatic sorting.

### Stickers

Uniform grid layout with sequential ordering.

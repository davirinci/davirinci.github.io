# Davinci Portfolio - Advanced Gallery System

Hello, I'm Virinci, a graphic designer. This portfolio showcases my work through an innovative gallery system with unique auto-resizing capabilities.

## 🎨 Unique Features

### Justified Gallery Layout Algorithm

This portfolio implements a **custom justified gallery layout** that dynamically resizes images to fill each row exactly to the container width, similar to professional photography sites like Unsplash and Pinterest.

**Key Innovations:**

- **Exact Width Filling**: Each row is calculated to fill the available width precisely, eliminating gaps
- **Aspect Ratio Preservation**: All images maintain their original proportions without cropping
- **Unit-Based Packing**: Uses a smart packing algorithm that assigns "units" to images (portrait=1.0, landscape=1.6) for optimal row composition
- **Responsive Breakpoints**: Adapts packing density based on screen size:
  - Small screens (<500px): ~1.5 units per row
  - Medium screens (500-800px): ~2.5 units per row
  - Large screens (≥800px): ~4.0 units per row
- **Visual Consistency**: Last row height matches the previous row for cohesive appearance
- **Real-time Adaptation**: Layout recalculates instantly on window resize and filter changes

**Technical Implementation:**

- JavaScript-driven layout calculation using `getBoundingClientRect()` for precise width measurement
- CSS `flexbox` with pixel-perfect dimensions applied via inline styles
- MutationObserver for detecting filter changes and triggering re-layout
- Container width accounting for sidebar presence and CSS padding

### Automated Build System

The build process automatically extracts image dimensions and generates gallery HTML with embedded metadata:

```javascript
// Extracts width/height from WebP files using image-size library
const dimensions = imageSize(imagePath);
// Embeds as data attributes: data-width="601" data-height="800"
```

**Benefits:**

- No manual dimension specification required
- Eliminates layout shift during page load
- Enables precise aspect ratio calculations
- Supports WebP format optimization

### Advanced Filtering System

Multi-dimensional filtering with real-time layout adaptation:

- **Type filtering**: Photo, Postcard, Poster categories
- **Topic filtering**: Artist, Movie, MMA, etc. with proper sorting
- **Original Content toggle**: OC/Non-OC content separation
- **Search functionality**: Full-text search across image metadata
- **Layout preservation**: Filtered results maintain justified layout without container resizing

## 🚀 Getting Started

### Automated Deployment

The galleries update automatically when you push image changes to GitHub:

1. **Add images** to `shop/images/` folders
2. **Commit and push** to the `main` branch
3. **GitHub Actions** automatically runs `build.js`
4. **Gallery configs** are updated and committed back

### Manual Build (if needed)

```bash
npm run build
# or
node build.js
```

### Local Development

```bash
npm start  # Start local server with live reload
```

## 📁 Project Structure

```
├── build.js                 # Automated gallery generation script
├── js/
│   ├── justified-layout.js  # Custom justified gallery algorithm
│   ├── gallery.js          # Filtering and lightbox functionality
│   └── theme.js            # Dark/light theme switching
├── css/
│   └── styles.css          # Responsive styling with sidebar layout
├── shop/
│   ├── posters.html        # Justified gallery implementation
│   ├── bookmarks.html      # Artist-categorized gallery
│   ├── stickers.html       # Sequential numbered gallery
│   └── images/             # Source images organized by category
└── package.json            # Dependencies and scripts
```

## 🖼️ Gallery Types

### Posters Gallery (Justified Layout)

- **Layout**: Custom justified algorithm with exact width filling
- **Features**: Advanced filtering, responsive packing, aspect ratio preservation
- **Naming**: `{type}-{topic}-{description}-oc.webp`
- **Example**: `poster-MMA-dustin-poirer-oc.webp`

### Bookmarks Gallery (Artist-Categorized)

- **Layout**: Grid-based with artist grouping and headers
- **Features**: Automatic artist detection and sorting
- **Naming**: `albums-{artist}-{album}.webp`
- **Example**: `albums-queen-the-works.webp`

### Stickers Gallery (Sequential)

- **Layout**: Simple grid layout with advanced filtering
- **Features**: Auto-detection of numbered files, multi-dimensional filtering (type, topic, OC, search)
- **Naming**: `{type}-{topic}-{number}.webp`
- **Example**: `game-ClashRoyale-005.webp`
- **Example**: `1.webp`, `2.webp`, `3.webp`

## 🛠️ Technical Stack

- **Build System**: Node.js with `image-size` for dimension extraction
- **Layout Engine**: Custom JavaScript justified gallery algorithm
- **Styling**: CSS Grid and Flexbox with responsive breakpoints
- **Interactivity**: Vanilla JavaScript with MutationObserver for dynamic updates
- **Image Format**: WebP for optimal compression and quality
- **Deployment**: GitHub Pages with Actions automation

## 🎯 Performance Optimizations

- **Lazy Loading**: Images load only when needed
- **Dimension Pre-calculation**: No layout shift during page load
- **Efficient Filtering**: DOM manipulation with minimal reflows
- **Responsive Images**: Appropriate sizing for different screen densities
- **WebP Format**: Modern compression with fallback support

## 📝 Adding New Images

### For Posters/Bookmarks

1. Add WebP images to appropriate `shop/images/{category}/` folder
2. Follow naming conventions above
3. Commit and push - build runs automatically

### For Stickers

1. Add sequentially numbered WebP files to `shop/images/stickers/`
2. Build script auto-detects and includes all files

The justified gallery algorithm ensures your images always display optimally, filling available space while maintaining visual harmony across all device sizes.

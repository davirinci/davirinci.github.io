# A Simple Design Portfolio

Hello, I'm Virinci, a graphic designer.

## Adding New Images

When you add new images to the galleries, the build script runs automatically on GitHub! Just commit and push your image files.

### Manual Build (if needed)

If you want to run the build script locally:

```bash
npm run build
# or
node build.js
```

### Automated Deployment

The galleries update automatically when you push image changes to GitHub:

1. **Add images** to `shop/images/` folders
2. **Commit and push** to the `main` branch
3. **GitHub Actions** automatically runs `build.js`
4. **Gallery configs** are updated and committed back

## Image Naming Requirements

### Stickers/Posters

- **Naming**: `1.webp`, `2.webp`, `3.webp`, etc.
- **Auto-detection**: Counts existing files automatically

### Bookmarks (Categorized by Artist)

- **Naming**: `albums-{artist}-{album}.webp`
- **Examples**:
  - `albums-queen-the-works.webp` → Artist: "Queen", Album: "The Works"
  - `albums-pink-floyd-dark-side-of-the-moon.webp` → Artist: "Pink Floyd", Album: "Dark Side of the Moon"
  - `albums-the-beatles-let-it-be.webp` → Artist: "The Beatles", Album: "Let It Be"
- **Auto-categorization**: Groups by artist with proper headers
- **Sorting**: "The Beatles" sorts under "B", "The Weeknd" under "W"

## Development

```bash
npm start  # Start local server
```

# Justified Layout Algorithm

The poster gallery uses a custom justified layout algorithm that packs images of varying aspect ratios into rows that fill the container width exactly, similar to Flickr or Unsplash galleries.

## What Makes It Unique

Most gallery libraries rely on predefined row heights or complex math that recalculates dimensions multiple times. This implementation uses a **unit-based packing system** that makes one-pass calculations with precise width-filling results.

### Key Innovation: Unit-Based Packing

Instead of working directly with pixel dimensions, images are assigned "unit values" based on their aspect ratio:

- **Portrait images** (taller than wide): 1.0 unit
- **Landscape images** (wider than tall): 1.6 units

This simplifies row composition—you're packing abstract units, not juggling actual dimensions. The algorithm accumulates units until it reaches a target, then calculates the exact row height needed to fill the container width.

## How It Works

### 1. Container Width Measurement

```javascript
const rect = gallery.getBoundingClientRect();
const containerWidth = rect.width - paddingLeft - paddingRight;
```

Uses `getBoundingClientRect()` for precise measurement that accounts for:

- Sidebar presence on larger screens
- CSS padding
- Any layout shifts from other page elements

### 2. Responsive Target Units

Different screen sizes have different packing targets:

| Screen Size        | Target Units | Typical Images per Row |
| ------------------ | ------------ | ---------------------- |
| Small (<500px)     | 1.5          | 1-2 images             |
| Medium (500-800px) | 2.5          | 2-3 images             |
| Large (≥800px)     | 4.0          | 3-5 images             |

This creates visual consistency—small screens show fewer, larger images while large screens pack more images per row.

### 3. Row Packing Logic

The algorithm builds rows by accumulating units:

```javascript
while (i < visibleTiles.length) {
  const unit = isLandscape ? LANDSCAPE_UNIT : PORTRAIT_UNIT;

  // Stop if adding this image would overshoot the target by too much
  if (row.length > 0 && rowUnits + unit > TARGET_UNITS_PER_ROW * 1.2) break;

  row.push({ tile, aspectRatio: ar });
  rowUnits += unit;

  // Row is "full enough" if we hit 90% of target
  if (rowUnits >= TARGET_UNITS_PER_ROW * 0.9) break;
}
```

**Tolerance ranges:**

- **Minimum:** 90% of target (allows slightly underfilled rows)
- **Maximum:** 120% of target (prevents overpacking)

This flexibility ensures visually balanced rows without forcing exact unit counts.

### 4. Height Calculation

Once a row is packed, calculate the height that will fill the width exactly:

```javascript
const totalGapWidth = gap * (row.length - 1); // Space between images
const availableWidth = containerWidth - totalGapWidth;
const aspectSum = row.reduce((s, r) => s + r.aspectRatio, 0);

// The key formula: divide available width by sum of aspect ratios
const rowHeight = availableWidth / aspectSum;
```

**Why this works:**

If you have three images with aspect ratios 1.5, 0.67, and 1.8, their widths at a given height `h` would be:

- Image 1: `1.5h`
- Image 2: `0.67h`
- Image 3: `1.8h`
- **Total:** `(1.5 + 0.67 + 1.8)h = 3.97h`

To fill width `W`, solve: `3.97h = W` → `h = W / 3.97`

This gives you the exact height needed so all images, placed side-by-side, fill the width perfectly.

### 5. Last Row Consistency

The last row uses the previous row's height instead of calculating a new one:

```javascript
if (isLastRow) {
  rowHeight = lastRowHeight;
}
```

This prevents the last row from having drastically different proportions, maintaining visual harmony across the entire gallery.

### 6. Applying Dimensions

```javascript
row.forEach(({ tile, aspectRatio }) => {
  const tileWidth = rowHeight * aspectRatio;
  tile.style.width = `${tileWidth}px`;
  tile.style.height = `${rowHeight}px`;
  tile.style.flexBasis = `${tileWidth}px`;
});
```

Dimensions are applied via inline styles for pixel-perfect control. Flexbox is used but with fixed sizes (`flex-grow: 0`) to prevent any browser-based stretching.

## Responsive Behavior

### Window Resize

```javascript
window.addEventListener("resize", layoutGallery);
```

The layout recalculates instantly on window resize, recomputing container width and repacking all rows.

### Filter Changes

```javascript
const observer = new MutationObserver(() => layoutGallery());
observer.observe(gallery, {
  attributes: true,
  attributeFilter: ["style"],
  subtree: true,
});
```

A `MutationObserver` watches for `display: none` changes on tiles (from filtering) and triggers re-layout. This ensures filtered results maintain the justified layout without manual intervention.

## Performance Considerations

- **One-pass calculation:** Each image is measured and positioned once per layout
- **No trial-and-error:** The formula directly calculates the correct height
- **Dimension pre-extraction:** Image dimensions are embedded during build as data attributes, avoiding costly runtime measurements
- **Minimal reflows:** All dimension changes happen in one batch before browser repaint

## Comparison to Other Approaches

**Traditional Grid Layouts:**

- Fixed heights for all rows
- Images cropped or letterboxed to fit
- No aspect ratio preservation

**CSS-only Justified:**

- Relies on `justify-content: space-between` with gaps
- Can't guarantee full-width fills
- Last row often has visual inconsistencies

**Library-based Solutions (Masonry, Flickity):**

- Often include unnecessary features (drag-and-drop, infinite scroll)
- Heavier dependencies
- Less control over packing logic

This custom implementation provides exactly what's needed: precise width-filling with aspect ratio preservation, lightweight code, and full control over responsive behavior.

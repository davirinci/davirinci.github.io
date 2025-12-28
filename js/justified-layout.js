// Justified gallery layout - calculates row heights to fill full width
function initializeJustifiedLayout() {
  const gallery = document.querySelector(
    '.portrait-gallery[aria-label="Print thumbnails"]'
  );
  if (!gallery) return;

  function layoutGallery() {
    const tiles = Array.from(gallery.querySelectorAll(".portrait-tile"));
    const visibleTiles = tiles.filter((tile) => tile.style.display !== "none");
    if (visibleTiles.length === 0) return;

    // Measure actual available width using getBoundingClientRect to account for sidebar
    const rect = gallery.getBoundingClientRect();
    const styles = window.getComputedStyle(gallery);
    const paddingLeft = parseFloat(styles.paddingLeft);
    const paddingRight = parseFloat(styles.paddingRight);
    const containerWidth = rect.width - paddingLeft - paddingRight;

    const gap = 12;

    // Responsive target units and row height based on container width
    let TARGET_UNITS_PER_ROW, targetRowHeight;
    if (containerWidth < 500) {
      // Small screens: ~1.5 portrait units per row (roughly 1-2 images)
      TARGET_UNITS_PER_ROW = 1.5;
      targetRowHeight = 200;
    } else if (containerWidth < 800) {
      // Medium screens: ~2.5 portrait units per row
      TARGET_UNITS_PER_ROW = 2.5;
      targetRowHeight = 220;
    } else {
      // Large screens: ~4 portrait units per row
      TARGET_UNITS_PER_ROW = 4.0;
      targetRowHeight = 250;
    }

    const PORTRAIT_UNIT = 1.0;
    const LANDSCAPE_UNIT = 1.6;

    let i = 0;
    let lastRowHeight = targetRowHeight;

    while (i < visibleTiles.length) {
      let row = [];
      let rowUnits = 0;

      // Pack images into row
      while (i < visibleTiles.length) {
        const tile = visibleTiles[i];
        const w = parseInt(tile.dataset.width);
        const h = parseInt(tile.dataset.height);
        if (!w || !h) {
          i++;
          continue;
        }

        const ar = w / h;
        const isLandscape = ar >= 1.2;
        const unit = isLandscape ? LANDSCAPE_UNIT : PORTRAIT_UNIT;

        if (row.length > 0 && rowUnits + unit > TARGET_UNITS_PER_ROW * 1.2)
          break;

        row.push({ tile, aspectRatio: ar });
        rowUnits += unit;
        i++;

        if (rowUnits >= TARGET_UNITS_PER_ROW * 0.9 || i === visibleTiles.length)
          break;
      }

      if (row.length === 0) break;

      const isLastRow = i >= visibleTiles.length;
      const totalGapWidth = gap * (row.length - 1);
      const availableWidth = containerWidth - totalGapWidth;
      const aspectSum = row.reduce((s, r) => s + r.aspectRatio, 0);

      // All rows: calculate rowHeight to fill width exactly
      // For last row, use same height as previous row for visual consistency
      let rowHeight;
      if (isLastRow) {
        rowHeight = lastRowHeight;
      } else {
        rowHeight = availableWidth / aspectSum;
        lastRowHeight = rowHeight;
      }

      row.forEach(({ tile, aspectRatio }) => {
        const tileWidth = rowHeight * aspectRatio;
        tile.style.width = `${tileWidth}px`;
        tile.style.height = `${rowHeight}px`;
        tile.style.flexBasis = `${tileWidth}px`;
        tile.style.flexGrow = "0";
        tile.style.flexShrink = "0";
        tile.style.minWidth = "0";
        const img = tile.querySelector("img");
        if (img) {
          img.style.width = `100%`;
          img.style.height = `100%`;
        }
      });
    }
  }

  // Layout on load and resize
  layoutGallery();
  window.addEventListener("resize", layoutGallery);

  // Re-layout when filters change (images shown/hidden)
  const observer = new MutationObserver(() => {
    layoutGallery();
  });

  observer.observe(gallery, {
    attributes: true,
    attributeFilter: ["style"],
    subtree: true,
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeJustifiedLayout);
} else {
  initializeJustifiedLayout();
}

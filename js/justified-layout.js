// Justified gallery layout - calculates row heights to fill full width
function initializeJustifiedLayout() {
  const gallery = document.querySelector(
    '.portrait-gallery[aria-label="Print thumbnails"]',
  );
  if (!gallery) return;
  const isPosterPage = window.location.pathname.includes("/shop/posters");

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
    const minItemsPerRow = isPosterPage && containerWidth >= 1200 ? 4 : 1;
    const maxRowHeightPx = window.innerHeight * 0.65;

    let i = 0;

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
        const isPortrait =
          tile.dataset.orientation === "portrait" ||
          (tile.dataset.orientation !== "landscape" && ar <= 1);
        const isLandscape = !isPortrait;
        const unit = isLandscape ? LANDSCAPE_UNIT : PORTRAIT_UNIT;

        // If a row starts with a portrait and the next visible image is also portrait,
        // force a pair so portrait images render two per row.
        if (row.length === 0 && isPortrait) {
          const nextTile = visibleTiles[i + 1];
          if (nextTile) {
            const nextW = parseInt(nextTile.dataset.width);
            const nextH = parseInt(nextTile.dataset.height);
            if (nextW && nextH) {
              const nextAr = nextW / nextH;
              const nextIsPortrait =
                nextTile.dataset.orientation === "portrait" ||
                (nextTile.dataset.orientation !== "landscape" && nextAr <= 1);

              if (nextIsPortrait) {
                row.push({ tile, aspectRatio: ar });
                row.push({ tile: nextTile, aspectRatio: nextAr });
                i += 2;
                rowUnits += PORTRAIT_UNIT * 2;
                break;
              }
            }
          }
        }

        const currentAspectSum = row.reduce((s, r) => s + r.aspectRatio, 0);
        const currentAvailableWidth = containerWidth - gap * (row.length - 1);
        const predictedCurrentRowHeight =
          row.length > 0 && currentAspectSum > 0
            ? currentAvailableWidth / currentAspectSum
            : Infinity;

        if (
          row.length > 0 &&
          rowUnits + unit > TARGET_UNITS_PER_ROW * 1.2 &&
          row.length >= minItemsPerRow &&
          (predictedCurrentRowHeight <= maxRowHeightPx ||
            i === visibleTiles.length - 1)
        )
          break;

        row.push({ tile, aspectRatio: ar });
        rowUnits += unit;
        i++;

        const remaining = visibleTiles.length - i;
        const aspectSumNow = row.reduce((s, r) => s + r.aspectRatio, 0);
        const availableWidthNow = containerWidth - gap * (row.length - 1);
        const predictedRowHeightNow =
          aspectSumNow > 0 ? availableWidthNow / aspectSumNow : Infinity;
        const canStopByUnits =
          rowUnits >= TARGET_UNITS_PER_ROW * 0.9 &&
          (row.length >= minItemsPerRow || remaining === 0) &&
          (predictedRowHeightNow <= maxRowHeightPx || remaining === 0);

        if (canStopByUnits || i === visibleTiles.length) break;
      }

      if (row.length === 0) break;

      // If row is still too tall, keep adding next items until it drops below cap
      // (or we run out of images). This ensures the vh threshold is always honored.
      while (i < visibleTiles.length) {
        const rowAspectSum = row.reduce((s, r) => s + r.aspectRatio, 0);
        const rowAvailableWidth = containerWidth - gap * (row.length - 1);
        const predictedRowHeight =
          rowAspectSum > 0 ? rowAvailableWidth / rowAspectSum : Infinity;

        if (predictedRowHeight <= maxRowHeightPx) {
          break;
        }

        const nextTile = visibleTiles[i];
        const nextW = parseInt(nextTile.dataset.width);
        const nextH = parseInt(nextTile.dataset.height);
        if (!nextW || !nextH) {
          i++;
          continue;
        }

        row.push({ tile: nextTile, aspectRatio: nextW / nextH });
        i++;
      }

      const totalGapWidth = gap * (row.length - 1);
      const availableWidth = containerWidth - totalGapWidth;
      const aspectSum = row.reduce((s, r) => s + r.aspectRatio, 0);
      const isLastRow = i >= visibleTiles.length;

      // Always compute row height from available width so each row fills fully.
      let rowHeight = availableWidth / aspectSum;
      if (isLastRow) {
        rowHeight = Math.min(rowHeight, maxRowHeightPx);
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
    childList: true,
    subtree: true,
  });

  gallery.addEventListener("gallery:randomized", layoutGallery);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeJustifiedLayout);
} else {
  initializeJustifiedLayout();
}

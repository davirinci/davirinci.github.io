/**
 * Generic gallery initialization
 * Usage: initializeGallery(selector, config)
 * config can be:
 * - { images: ['path1', 'path2', ...] } for explicit list
 * - { directory: 'path', pattern: 'prefix-{n}.ext', count: 100 } for sequential
 * - { directory: 'path', files: ['file1.ext', 'file2.ext', ...] } for named files
 */
function initializeGallery(gallerySelector, config) {
  const gallery = document.querySelector(gallerySelector);
  if (!gallery) return;

  // Check if tiles are already rendered in HTML (from build.js)
  const existingTiles = gallery.querySelectorAll("button[data-index]");
  if (existingTiles.length > 0) {
    // Tiles already exist - just set up lightbox functionality
    const tiles = Array.from(existingTiles);
    const lightbox = document.querySelector(".lightbox");
    if (!lightbox) return;

    // Get image sources from existing tiles
    const imageSources = tiles
      .map((tile) => {
        const img = tile.querySelector("img");
        return img ? img.src : "";
      })
      .filter((src) => src);

    attachLightboxHandlers(gallery, tiles, lightbox, imageSources);
    return;
  }

  // If no tiles exist, create them from config (fallback for non-build galleries)
  gallery.innerHTML = "";

  let imageSources = [];

  if (config.images) {
    // Explicit list of images
    imageSources = config.images;
  } else if (config.directory && config.pattern && config.count) {
    // Sequential pattern like '001', '002', etc.
    imageSources = Array.from(
      { length: config.count },
      (_, i) =>
        `${config.directory}/${config.pattern.replace(
          "{n}",
          String(i + 1).padStart(3, "0")
        )}`
    );
  } else if (config.directory && config.files) {
    // Explicit list of filenames
    imageSources = config.files.map((file) => `${config.directory}/${file}`);
  }

  const isPortrait = gallery.classList.contains("portrait-gallery");

  imageSources.forEach((src, idx) => {
    const btn = document.createElement("button");
    btn.className = isPortrait ? "portrait-tile" : "square-tile";
    btn.dataset.index = String(idx);
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Image ${String(idx + 1).padStart(3, "0")}`;
    btn.appendChild(img);
    gallery.appendChild(btn);
  });

  const tiles = Array.from(gallery.querySelectorAll("button[data-index]"));
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

  attachLightboxHandlers(gallery, tiles, lightbox, imageSources);
}

/**
 * Attach lightbox event handlers to tiles
 */
function attachLightboxHandlers(gallery, tiles, lightbox, imageSources) {
  const carousel = lightbox.querySelector(".lightbox__carousel");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const prevBtn = lightbox.querySelector(".lightbox__prev");
  const nextBtn = lightbox.querySelector(".lightbox__next");

  let currentIndex = 0;

  function updateCarousel() {
    const total = imageSources.length;
    const slides = {
      "prev-2": (currentIndex - 2 + total) % total,
      "prev-1": (currentIndex - 1 + total) % total,
      center: currentIndex,
      "next-1": (currentIndex + 1) % total,
      "next-2": (currentIndex + 2) % total,
    };

    Object.entries(slides).forEach(([position, index]) => {
      const slide = carousel.querySelector(`.lightbox__slide--${position}`);
      if (!slide) return; // Skip if slide doesn't exist (for small screens)
      const img = slide.querySelector("img");
      img.src = imageSources[index];
      img.alt = `Image ${String(index + 1).padStart(3, "0")}`;
    });
  }

  function openLightbox(index) {
    currentIndex = index;
    updateCarousel();
    lightbox.dataset.active = "true";
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    lightbox.dataset.active = "false";
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove("lightbox-open");
  }

  function showNext(delta) {
    const total = imageSources.length;
    currentIndex = (currentIndex + delta + total) % total;
    updateCarousel();
  }

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const index = Number(tile.dataset.index);
      openLightbox(index);
    });
  });

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", closeLightbox);

  prevBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    showNext(-1);
  });

  nextBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    showNext(1);
  });

  lightbox
    .querySelector(".lightbox__stage")
    .addEventListener("click", (event) => {
      event.stopPropagation();
    });

  document.addEventListener("keydown", (event) => {
    if (lightbox.dataset.active !== "true") return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showNext(1);
    if (event.key === "ArrowLeft") showNext(-1);
  });

  // Touch swipe support for mobile/tablet
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50; // minimum distance for a swipe

  lightbox.addEventListener(
    "touchstart",
    (event) => {
      if (lightbox.dataset.active !== "true") return;
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (event) => {
      if (lightbox.dataset.active !== "true") return;
      touchEndX = event.changedTouches[0].screenX;
      handleSwipe();
    },
    { passive: true }
  );

  function handleSwipe() {
    const distance = touchEndX - touchStartX;
    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe right - show previous
      showNext(-1);
    } else {
      // Swipe left - show next
      showNext(1);
    }
  }
}

/**
 * Initialize gallery filters
 * Attaches filter button event listeners
 */
function initializeGalleryFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.filterGroup;

      // Toggle active state
      document
        .querySelectorAll(`.filter-btn[data-filter-group="${group}"]`)
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Apply filters
      applyGalleryFilters();
    });
  });

  // OC toggle
  const ocToggle = document.querySelector("#oc-toggle");
  if (ocToggle) {
    ocToggle.addEventListener("change", () => {
      applyGalleryFilters();
    });
  }

  // Search input
  const searchInput = document.querySelector("#gallery-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      applyGalleryFilters();
    });
  }
}

/**
 * Apply gallery filters based on selected filter buttons
 */
function applyGalleryFilters() {
  const activeTypeBtn = document.querySelector(
    '.filter-btn[data-filter-group="type"].active'
  );
  const activeTopicBtn = document.querySelector(
    '.filter-btn[data-filter-group="topic"].active'
  );

  let selectedType = (activeTypeBtn?.dataset.filterType || "all").toLowerCase();
  let selectedTopic = (
    activeTopicBtn?.dataset.filterTopic || "all"
  ).toLowerCase();

  // Normalize: convert spaces to hyphens for topic matching
  if (selectedTopic !== "all") {
    selectedTopic = selectedTopic.replace(/\s+/g, "-");
  }

  // Get search query
  const searchInput = document.querySelector("#gallery-search");
  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // Select both portrait and square tiles
  const tiles = document.querySelectorAll(
    ".portrait-gallery [data-type], .square-gallery [data-type]"
  );

  tiles.forEach((tile) => {
    const type = tile.dataset.type?.toLowerCase() || "";
    const topic = tile.dataset.topic?.toLowerCase() || "";
    const isOc = tile.dataset.oc === "true";
    const searchTerms = tile.dataset.searchTerms?.toLowerCase() || "";

    const ocToggle = document.querySelector("#oc-toggle");
    const ocOnly = ocToggle ? ocToggle.checked : false;

    const typeMatch = selectedType === "all" || type === selectedType;
    const topicMatch = selectedTopic === "all" || topic === selectedTopic;
    const ocMatch = !ocOnly || isOc;
    const searchMatch = !searchQuery || searchTerms.includes(searchQuery);

    if (typeMatch && topicMatch && ocMatch && searchMatch) {
      tile.style.display = "";
    } else {
      tile.style.display = "none";
    }
  });
}

// Auto-initialize filters when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGalleryFilters);
} else {
  initializeGalleryFilters();
}

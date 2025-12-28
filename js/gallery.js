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
  let visibleSources = []; // Track currently visible images
  let zoomLevel = 1;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let slideshowInterval = null;
  let isSlideshowActive = false;
  let transitionMode = 0; // 0 = fade, 1 = movement

  function getVisibleSources() {
    // Get only visible tiles and their image sources
    const visibleTiles = tiles.filter((tile) => tile.style.display !== "none");
    return visibleTiles
      .map((tile) => {
        const img = tile.querySelector("img");
        return img ? img.src : "";
      })
      .filter((src) => src);
  }

  function updateCarousel(animate = false) {
    const total = visibleSources.length;
    if (total === 0) return;

    const slides = {
      "prev-2": (currentIndex - 2 + total) % total,
      "prev-1": (currentIndex - 1 + total) % total,
      center: currentIndex,
      "next-1": (currentIndex + 1) % total,
      "next-2": (currentIndex + 2) % total,
    };

    const centerSlide = carousel.querySelector(".lightbox__slide--center");
    const centerImg = centerSlide ? centerSlide.querySelector("img") : null;

    if (animate && centerImg) {
      if (transitionMode === 0) {
        // Fade transition
        centerImg.style.opacity = "0";
        centerImg.style.transition = "opacity 300ms ease-out";

        setTimeout(() => {
          // Update image source while faded out
          const newIndex = slides.center;
          centerImg.src = visibleSources[newIndex];
          centerImg.alt = `Image ${String(newIndex + 1).padStart(3, "0")}`;

          // Reset transition for smooth fade-in
          centerImg.style.transition = "opacity 300ms ease-in";
          centerImg.style.opacity = "1";
        }, 300);
      } else {
        // Movement transition - slide from right to left
        centerImg.style.transition = "transform 400ms ease-in-out";
        centerImg.style.transform = "translateX(-100%)";

        setTimeout(() => {
          // Update image source while off-screen
          const newIndex = slides.center;
          centerImg.src = visibleSources[newIndex];
          centerImg.alt = `Image ${String(newIndex + 1).padStart(3, "0")}`;

          // Reset transform and transition for slide-in from right
          centerImg.style.transition = "none";
          centerImg.style.transform = "translateX(100%)";

          // Trigger reflow to ensure transition is applied after transform is set
          centerImg.offsetHeight;

          // Animate back to center
          centerImg.style.transition = "transform 400ms ease-in-out";
          centerImg.style.transform = "translateX(0)";
        }, 200);
      }
    }

    // Update all slides (including center if not animating)
    Object.entries(slides).forEach(([position, index]) => {
      const slide = carousel.querySelector(`.lightbox__slide--${position}`);
      if (!slide) return; // Skip if slide doesn't exist (for small screens)
      const img = slide.querySelector("img");

      // Don't update center image source if animating (already done above)
      if (animate && position === "center") return;

      img.src = visibleSources[index];
      img.alt = `Image ${String(index + 1).padStart(3, "0")}`;
    });
  }

  function openLightbox(clickedTile) {
    // Update visible sources based on current filter state
    visibleSources = getVisibleSources();

    // Find the index of the clicked tile within visible tiles
    const visibleTiles = tiles.filter((tile) => tile.style.display !== "none");
    currentIndex = visibleTiles.indexOf(clickedTile);

    if (currentIndex === -1) return; // Shouldn't happen, but safety check

    updateCarousel();
    lightbox.dataset.active = "true";
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    stopSlideshow();
    resetZoom();
    lightbox.dataset.active = "false";
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    document.body.classList.remove("lightbox-open");
  }

  function showNext(delta, animate = false) {
    const total = visibleSources.length;
    if (total === 0) return;
    currentIndex = (currentIndex + delta + total) % total;
    updateCarousel(animate);
  }

  function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.25, 3);
    applyZoom();
  }

  function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
    applyZoom();
  }

  function resetZoom() {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    applyZoom();
  }

  function applyZoom() {
    const centerSlide = carousel.querySelector(".lightbox__slide--center");
    if (centerSlide) {
      const img = centerSlide.querySelector("img");
      if (img) {
        img.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
        img.style.transition = "transform 200ms ease";
        img.style.cursor = zoomLevel > 1 ? "grab" : "default";
      }
    }

    // Update zoom button states
    const zoomInBtn = lightbox.querySelector(".lightbox__zoom-in");
    const zoomOutBtn = lightbox.querySelector(".lightbox__zoom-out");
    if (zoomInBtn) zoomInBtn.disabled = zoomLevel >= 3;
    if (zoomOutBtn) zoomOutBtn.disabled = zoomLevel <= 0.5;
  }

  function startSlideshow() {
    if (isSlideshowActive) return;
    isSlideshowActive = true;
    const playBtn = lightbox.querySelector(".lightbox__slideshow");
    if (playBtn) {
      playBtn.textContent = "⏸";
      playBtn.setAttribute("aria-label", "Pause slideshow");
    }
    slideshowInterval = setInterval(() => {
      showNext(1, true);
    }, 3000);
  }

  function stopSlideshow() {
    if (!isSlideshowActive) return;
    isSlideshowActive = false;
    const playBtn = lightbox.querySelector(".lightbox__slideshow");
    if (playBtn) {
      playBtn.textContent = "▶";
      playBtn.setAttribute("aria-label", "Play slideshow");
    }
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }
  }

  function toggleSlideshow() {
    if (isSlideshowActive) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      openLightbox(tile);
    });
  });

  // Prevent dragging on lightbox images
  carousel.querySelectorAll("img").forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());

    // Pan/drag functionality for zoomed images
    img.addEventListener("mousedown", (e) => {
      if (zoomLevel <= 1) return;
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      img.style.cursor = "grabbing";
      img.style.transition = "none";
      e.preventDefault();
    });

    img.addEventListener(
      "touchstart",
      (e) => {
        if (zoomLevel <= 1) return;
        isPanning = true;
        panStartX = e.touches[0].clientX;
        panStartY = e.touches[0].clientY;
        img.style.transition = "none";
      },
      { passive: false }
    );
  });

  document.addEventListener("mousemove", (e) => {
    if (!isPanning || zoomLevel <= 1) return;
    const centerImg = carousel.querySelector(".lightbox__slide--center img");
    if (!centerImg) return;

    const deltaX = (e.clientX - panStartX) / zoomLevel;
    const deltaY = (e.clientY - panStartY) / zoomLevel;

    panX += deltaX;
    panY += deltaY;
    panStartX = e.clientX;
    panStartY = e.clientY;

    centerImg.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
  });

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!isPanning || zoomLevel <= 1) return;
      const centerImg = carousel.querySelector(".lightbox__slide--center img");
      if (!centerImg) return;

      const deltaX = (e.touches[0].clientX - panStartX) / zoomLevel;
      const deltaY = (e.touches[0].clientY - panStartY) / zoomLevel;

      panX += deltaX;
      panY += deltaY;
      panStartX = e.touches[0].clientX;
      panStartY = e.touches[0].clientY;

      centerImg.style.transform = `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`;
    },
    { passive: false }
  );

  document.addEventListener("mouseup", () => {
    if (!isPanning) return;
    isPanning = false;
    const centerImg = carousel.querySelector(".lightbox__slide--center img");
    if (centerImg) {
      centerImg.style.cursor = zoomLevel > 1 ? "grab" : "default";
      centerImg.style.transition = "transform 200ms ease";
    }
  });

  document.addEventListener("touchend", () => {
    if (!isPanning) return;
    isPanning = false;
    const centerImg = carousel.querySelector(".lightbox__slide--center img");
    if (centerImg) {
      centerImg.style.transition = "transform 200ms ease";
    }
  });

  // Click handlers for prev/next slides
  const prevSlide1 = carousel.querySelector(".lightbox__slide--prev-1");
  const prevSlide2 = carousel.querySelector(".lightbox__slide--prev-2");
  const nextSlide1 = carousel.querySelector(".lightbox__slide--next-1");
  const nextSlide2 = carousel.querySelector(".lightbox__slide--next-2");

  if (prevSlide1) {
    prevSlide1.addEventListener("click", (event) => {
      event.stopPropagation();
      showNext(-1, true);
    });
  }
  if (prevSlide2) {
    prevSlide2.addEventListener("click", (event) => {
      event.stopPropagation();
      showNext(-1, true);
    });
  }
  if (nextSlide1) {
    nextSlide1.addEventListener("click", (event) => {
      event.stopPropagation();
      showNext(1, true);
    });
  }
  if (nextSlide2) {
    nextSlide2.addEventListener("click", (event) => {
      event.stopPropagation();
      showNext(1, true);
    });
  }

  closeBtn.addEventListener("click", closeLightbox);

  // Close lightbox when clicking outside center image and controls
  lightbox.addEventListener("click", (e) => {
    // Don't close if clicking on close button (handled above)
    if (e.target === closeBtn) return;

    // Don't close if clicking on carousel center slide or its children
    const centerSlide = carousel.querySelector(".lightbox__slide--center");
    if (centerSlide && centerSlide.contains(e.target)) return;

    // Don't close if clicking on side slides
    const prevSlide1 = carousel.querySelector(".lightbox__slide--prev-1");
    const prevSlide2 = carousel.querySelector(".lightbox__slide--prev-2");
    const nextSlide1 = carousel.querySelector(".lightbox__slide--next-1");
    const nextSlide2 = carousel.querySelector(".lightbox__slide--next-2");

    if (
      (prevSlide1 && prevSlide1.contains(e.target)) ||
      (prevSlide2 && prevSlide2.contains(e.target)) ||
      (nextSlide1 && nextSlide1.contains(e.target)) ||
      (nextSlide2 && nextSlide2.contains(e.target))
    ) {
      return;
    }

    // Don't close if clicking on nav buttons
    const navButtons = lightbox.querySelectorAll(".lightbox__nav");
    if (Array.from(navButtons).some((btn) => btn.contains(e.target))) return;

    closeLightbox();
  });

  // Zoom controls
  const zoomInBtn = lightbox.querySelector(".lightbox__zoom-in");
  const zoomOutBtn = lightbox.querySelector(".lightbox__zoom-out");
  const zoomResetBtn = lightbox.querySelector(".lightbox__zoom-reset");
  const transitionBtn = lightbox.querySelector(".lightbox__transition");
  const slideshowBtn = lightbox.querySelector(".lightbox__slideshow");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      zoomIn();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      zoomOut();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      resetZoom();
    });
  }

  if (transitionBtn) {
    transitionBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      transitionMode = (transitionMode + 1) % 2;
      // Update button appearance based on mode
      transitionBtn.textContent = transitionMode === 0 ? "⟺" : "◜◝";
      transitionBtn.setAttribute(
        "aria-label",
        transitionMode === 0 ? "Fade transition" : "Movement transition"
      );
    });
  }

  if (slideshowBtn) {
    slideshowBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleSlideshow();
    });
  }

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

  // Touch swipe support for mobile/tablet with smooth animations
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let isDragging = false;
  const minSwipeDistance = 50; // minimum distance for a swipe
  const stage = lightbox.querySelector(".lightbox__stage");

  lightbox.addEventListener(
    "touchstart",
    (event) => {
      if (lightbox.dataset.active !== "true") return;
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
      isDragging = true;
      carousel.style.transition = "none";
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchmove",
    (event) => {
      if (!isDragging || lightbox.dataset.active !== "true") return;
      const currentX = event.changedTouches[0].screenX;
      const currentY = event.changedTouches[0].screenY;
      const deltaX = currentX - touchStartX;
      const deltaY = Math.abs(currentY - touchStartY);

      // Only track horizontal swipes
      if (Math.abs(deltaX) > deltaY) {
        carousel.style.transform = `translateX(${deltaX}px)`;
      }
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    (event) => {
      if (lightbox.dataset.active !== "true") return;
      touchEndX = event.changedTouches[0].screenX;
      isDragging = false;
      carousel.style.transition = "transform 300ms ease-out";
      carousel.style.transform = "translateX(0)";
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

  // Scroll to gallery after filtering
  // Only scroll on mobile/tablet (non-sidebar layouts)
  const isSidebarLayout = window.matchMedia("(min-width: 1200px)").matches;
  if (!isSidebarLayout) {
    const gallery = document.querySelector(
      ".portrait-gallery, .square-gallery"
    );
    if (gallery) {
      // Small delay to ensure layout is updated
      setTimeout(() => {
        const galleryTop = gallery.getBoundingClientRect().top + window.scrollY;
        const offset = 140; // Offset to account for sticky search bar
        window.scrollTo({
          top: galleryTop - offset,
          behavior: "smooth",
        });
      }, 100);
    }
  }
}

// Auto-initialize filters when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeGalleryFilters);
} else {
  initializeGalleryFilters();
}

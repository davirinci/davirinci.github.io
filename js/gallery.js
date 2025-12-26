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

  gallery.innerHTML = "";
  
  let imageSources = [];
  
  if (config.images) {
    // Explicit list of images
    imageSources = config.images;
  } else if (config.directory && config.pattern && config.count) {
    // Sequential pattern like '001', '002', etc.
    imageSources = Array.from(
      { length: config.count },
      (_, i) => `${config.directory}/${config.pattern.replace('{n}', String(i + 1).padStart(3, '0'))}`
    );
  } else if (config.directory && config.files) {
    // Explicit list of filenames
    imageSources = config.files.map(file => `${config.directory}/${file}`);
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

  // Rest of the gallery initialization code...
  const tiles = Array.from(gallery.querySelectorAll("button[data-index]"));
  const lightbox = document.querySelector(".lightbox");
  if (!lightbox) return;

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
      "center": currentIndex,
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
}

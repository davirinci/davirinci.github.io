#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Build script to automatically update gallery file lists
 * Usage: node build.js
 */

function parseFilename(filename) {
  // Format: {type}-{topic}-{rest}.webp
  // Type: always first word only
  // Topic: if second word is "the", take "the" + next word; else just second word
  const name = filename.replace(/\.webp$/, '');
  const parts = name.split('-');
  
  if (parts.length < 2) {
    return null; // Invalid filename
  }

  const type = parts[0];
  let topic = parts[1];
  
  // If second part is "the", include the next word too
  if (topic.toLowerCase() === 'the' && parts.length > 2) {
    topic = topic + '-' + parts[2];
  }

  return {
    file: filename,
    type: formatTypeName(type),
    typeRaw: type,
    topic: formatTopicName(topic),
    topicRaw: topic
  };
}

function updateBookmarksGallery() {
  const bookmarksDir = path.join(__dirname, 'shop', 'images', 'bookmarks');
  const bookmarksHtml = path.join(__dirname, 'shop', 'bookmarks.html');

  try {
    // Read all files in the bookmarks directory
    const files = fs.readdirSync(bookmarksDir);

    // Filter for .webp files and sort them
    const webpFiles = files
      .filter(file => file.endsWith('.webp'))
      .sort(); // Alphabetical sort

    console.log(`Found ${webpFiles.length} bookmark images`);

    // Parse all files to extract type and topic
    const parsedFiles = webpFiles
      .map(f => parseFilename(f))
      .filter(p => p !== null);

    // Collect unique types and topics
    const types = [...new Set(parsedFiles.map(p => p.type))].sort();
    const topics = [...new Set(parsedFiles.map(p => p.topic))].sort();

    console.log(`Types: ${types.join(', ')}`);
    console.log(`Topics: ${topics.join(', ')}`);

    // Read the HTML file
    let htmlContent = fs.readFileSync(bookmarksHtml, 'utf8');

    // Generate filter buttons HTML
    const filterHtml = generateFilterHtml(types, topics);

    // Generate gallery items with data attributes
    const galleryItemsHtml = parsedFiles.map((item, idx) => 
      `<button class="portrait-tile" data-index="${idx}" data-type="${item.typeRaw}" data-topic="${item.topicRaw}">
        <img src="./images/bookmarks/${item.file}" alt="${item.topic}">
      </button>`
    ).join('\n        ');

    // Replace filter and gallery content
    const contentRegex = /(<h1>Bookmarks<\/h1>)\s*[\s\S]*?(<div class="portrait-gallery"[\s\S]*?)<\/div>/;
    const newContent = `$1\n${filterHtml}\n        <div class="portrait-gallery" aria-label="Bookmark thumbnails">\n        ${galleryItemsHtml}\n        `;
    htmlContent = htmlContent.replace(contentRegex, newContent + '</div>');

    // Generate the JavaScript config
    const jsConfig = generateGalleryJsConfig(parsedFiles, types, topics);
    
    // Replace the script content
    const scriptRegex = /<script>\s*[\s\S]*?<\/script>/;
    const newScript = `<script>\n      ${jsConfig}\n    </script>`;
    htmlContent = htmlContent.replace(scriptRegex, newScript);

    // Write back to file
    fs.writeFileSync(bookmarksHtml, htmlContent, 'utf8');

    console.log('✅ Updated bookmarks.html with filters and metadata');

  } catch (error) {
    console.error('❌ Error updating bookmarks gallery:', error.message);
    process.exit(1);
  }
}

function formatArtistName(artistSlug) {
  return artistSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatAlbumName(albumSlug) {
  return albumSlug
    .split('-')
    .map((word, index) => {
      // Keep "The" capitalized when it's the first word
      if (index === 0 && word.toLowerCase() === 'the') {
        return 'The';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function formatTypeName(typeSlug) {
  return typeSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTopicName(topicSlug) {
  // Handle "the-X" format
  const parts = topicSlug.split('-');
  if (parts[0].toLowerCase() === 'the' && parts.length > 1) {
    return 'The ' + parts.slice(1)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  // Regular formatting
  return parts
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateFilterHtml(types, topics) {
  let html = `        <div class="gallery-filters">
          <div class="filter-section">
            <h3>Type</h3>
            <div class="filter-buttons">
              <button class="filter-btn active" data-filter-type="all" data-filter-group="type">All</button>\n`;
  
  types.forEach(type => {
    html += `              <button class="filter-btn" data-filter-type="${type.toLowerCase()}" data-filter-group="type">${type}</button>\n`;
  });

  html += `            </div>
          </div>
          <div class="filter-section">
            <h3>Topic</h3>
            <div class="filter-buttons">
              <button class="filter-btn active" data-filter-topic="all" data-filter-group="topic">All</button>\n`;

  topics.forEach(topic => {
    html += `              <button class="filter-btn" data-filter-topic="${topic.toLowerCase()}" data-filter-group="topic">${topic}</button>\n`;
  });

  html += `            </div>
          </div>
        </div>\n`;

  return html;
}

function generateGalleryJsConfig(parsedFiles, types, topics) {
  const images = parsedFiles.map(f => `./images/bookmarks/${f.file}`);
  return `(function() {
          const config = {
            images: ${JSON.stringify(images)},
            types: ${JSON.stringify(types)},
            topics: ${JSON.stringify(topics)}
          };
          initializeGallery(".portrait-gallery", config);
        })();`;
}

function generateGalleryJsConfigForGallery(parsedFiles, types, topics, galleryType) {
  const galleryClass = galleryType === 'stickers' ? '.square-gallery' : '.portrait-gallery';
  const images = parsedFiles.map(f => `./images/${galleryType}/${f.file}`);
  return `(function() {
          const config = {
            images: ${JSON.stringify(images)},
            types: ${JSON.stringify(types)},
            topics: ${JSON.stringify(topics)}
          };
          initializeGallery("${galleryClass}", config);
        })();`;
}

function generateCategorizedGalleryHtml(categories, sortedCategories) {
  let html = '';

  sortedCategories.forEach((category, catIndex) => {
    // Add category header
    html += `\n        <h2>${category}</h2>\n`;
    
    // Add gallery container for this category
    const galleryId = `gallery-${catIndex}`;
    html += `        <div id="${galleryId}" class="portrait-gallery" aria-label="${category} bookmarks">\n`;
    
    // Sort albums within category
    const sortedAlbums = categories[category].sort((a, b) => a.album.localeCompare(b.album));
    
    sortedAlbums.forEach((item, albumIndex) => {
      html += `          <button class="portrait-tile" data-index="${albumIndex}" data-category="${category}" data-album="${item.album}">
            <img src="./images/bookmarks/${item.file}" alt="${item.album} by ${category}">
          </button>\n`;
    });
    
    html += `        </div>\n`;
  });

  return html;
}

function generateCategorizedJsConfig(categories, sortedCategories) {
  let jsCode = '';

  sortedCategories.forEach((category, catIndex) => {
    const galleryId = `gallery-${catIndex}`;
    const albums = categories[category].map(item => item.album);
    const images = categories[category].map(item => `./images/bookmarks/${item.file}`);
    
    jsCode += `
        (function() {
          const config = {
            images: ${JSON.stringify(images)},
            albums: ${JSON.stringify(albums)},
            category: "${category}"
          };
          initializeGallery("#${galleryId}", config);
        })();`;
  });

  return jsCode;
}

function updateStickersGallery() {
  const stickersDir = path.join(__dirname, 'shop', 'images', 'stickers');
  const stickersHtml = path.join(__dirname, 'shop', 'stickers.html');

  try {
    // Read all files in the stickers directory
    const files = fs.readdirSync(stickersDir);

    // Filter for .webp files and sort them
    const webpFiles = files
      .filter(file => file.endsWith('.webp'))
      .sort(); // Alphabetical sort

    console.log(`Found ${webpFiles.length} sticker images`);

    // Parse all files to extract type and topic
    const parsedFiles = webpFiles
      .map(f => parseFilename(f))
      .filter(p => p !== null);

    // Collect unique types and topics
    const types = [...new Set(parsedFiles.map(p => p.type))].sort();
    const topics = [...new Set(parsedFiles.map(p => p.topic))].sort();

    console.log(`Types: ${types.join(', ')}`);
    console.log(`Topics: ${topics.join(', ')}`);

    // Read the HTML file
    let htmlContent = fs.readFileSync(stickersHtml, 'utf8');

    // Generate filter buttons HTML
    const filterHtml = generateFilterHtml(types, topics);

    // Generate gallery items with data attributes
    const galleryItemsHtml = parsedFiles.map((item, idx) => 
      `<button class="square-tile" data-index="${idx}" data-type="${item.typeRaw}" data-topic="${item.topicRaw}">
        <img src="./images/stickers/${item.file}" alt="${item.topic}">
      </button>`
    ).join('\n        ');

    // Replace filter and gallery content
    const contentRegex = /(<h1>Sticker Gallery<\/h1>)\s*[\s\S]*?(<div class="square-gallery"[\s\S]*?)<\/div>/;
    const newContent = `$1\n${filterHtml}\n        <div class="square-gallery" aria-label="Sticker thumbnails">\n        ${galleryItemsHtml}\n        `;
    htmlContent = htmlContent.replace(contentRegex, newContent + '</div>');

    // Generate the JavaScript config
    const jsConfig = generateGalleryJsConfigForGallery(parsedFiles, types, topics, 'stickers');
    
    // Replace the script content
    const scriptRegex = /<script>\s*[\s\S]*?<\/script>/;
    const newScript = `<script>\n      ${jsConfig}\n    </script>`;
    htmlContent = htmlContent.replace(scriptRegex, newScript);

    // Write back to file
    fs.writeFileSync(stickersHtml, htmlContent, 'utf8');

    console.log('✅ Updated stickers.html with filters and metadata');

  } catch (error) {
    console.error('❌ Error updating stickers gallery:', error.message);
    process.exit(1);
  }
}

function updatePostersGallery() {
  const postersDir = path.join(__dirname, 'shop', 'images', 'posters');
  const postersHtml = path.join(__dirname, 'shop', 'posters.html');

  try {
    // Read all files in the posters directory
    const files = fs.readdirSync(postersDir);

    // Filter for .webp files and sort them
    const webpFiles = files
      .filter(file => file.endsWith('.webp'))
      .sort(); // Alphabetical sort

    console.log(`Found ${webpFiles.length} poster images`);

    // Parse all files to extract type and topic
    const parsedFiles = webpFiles
      .map(f => parseFilename(f))
      .filter(p => p !== null);

    // Collect unique types and topics
    const types = [...new Set(parsedFiles.map(p => p.type))].sort();
    const topics = [...new Set(parsedFiles.map(p => p.topic))].sort();

    console.log(`Types: ${types.join(', ')}`);
    console.log(`Topics: ${topics.join(', ')}`);

    // Read the HTML file
    let htmlContent = fs.readFileSync(postersHtml, 'utf8');

    // Generate filter buttons HTML
    const filterHtml = generateFilterHtml(types, topics);

    // Generate gallery items with data attributes
    const galleryItemsHtml = parsedFiles.map((item, idx) => 
      `<button class="portrait-tile" data-index="${idx}" data-type="${item.typeRaw}" data-topic="${item.topicRaw}">
        <img src="./images/posters/${item.file}" alt="${item.topic}">
      </button>`
    ).join('\n        ');

    // Replace filter and gallery content
    const contentRegex = /(<h1>Postcards & Posters<\/h1>)\s*[\s\S]*?(<div class="portrait-gallery"[\s\S]*?)<\/div>/;
    const newContent = `$1\n${filterHtml}\n        <div class="portrait-gallery" aria-label="Print thumbnails">\n        ${galleryItemsHtml}\n        `;
    htmlContent = htmlContent.replace(contentRegex, newContent + '</div>');

    // Generate the JavaScript config
    const jsConfig = generateGalleryJsConfigForGallery(parsedFiles, types, topics, 'posters');
    
    // Replace the script content
    const scriptRegex = /<script>\s*[\s\S]*?<\/script>/;
    const newScript = `<script>\n      ${jsConfig}\n    </script>`;
    htmlContent = htmlContent.replace(scriptRegex, newScript);

    // Write back to file
    fs.writeFileSync(postersHtml, htmlContent, 'utf8');

    console.log('✅ Updated posters.html with filters and metadata');

  } catch (error) {
    console.error('❌ Error updating posters gallery:', error.message);
    process.exit(1);
  }
}

// Run all updates
console.log('🔄 Updating galleries...\n');

updateBookmarksGallery();
console.log('');
updateStickersGallery();
console.log('');
updatePostersGallery();

console.log('\n🎉 All galleries updated successfully!');
console.log('Run this script again whenever you add new images.');
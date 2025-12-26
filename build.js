#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Build script to automatically update gallery file lists
 * Usage: node build.js
 */

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

    // Parse filenames to extract categories (artists) with smart parsing
    const categories = {};
    
    // Known artists for better parsing
    const knownArtists = [
      'kendrick-lamar', 'led-zeppelin', 'nirvana', 'pink-floyd', 'queen',
      'the-beatles', 'the-local', 'the-weeknd'
    ];
    
    webpFiles.forEach(file => {
      // Expected format: albums-{artist}-{album}.webp
      // Remove 'albums-' prefix and '.webp' suffix
      const nameWithoutPrefix = file.replace(/^albums-/, '').replace(/\.webp$/, '');
      
      // Try to match known artist first
      let artist = null;
      let album = null;
      
      for (const knownArtist of knownArtists) {
        if (nameWithoutPrefix.startsWith(knownArtist + '-')) {
          artist = knownArtist;
          album = nameWithoutPrefix.substring(knownArtist.length + 1); // +1 for the hyphen
          break;
        }
      }
      
      // Fallback parsing if not found
      if (!artist) {
        const parts = nameWithoutPrefix.split('-');
        if (parts[0] === 'the' && parts.length >= 3) {
          artist = `the-${parts[1]}`;
          album = parts.slice(2).join('-');
        } else if (parts.length >= 2) {
          artist = parts[0];
          album = parts.slice(1).join('-');
        } else {
          artist = 'Unknown';
          album = nameWithoutPrefix;
        }
      }
      
      const formattedArtist = formatArtistName(artist);
      
      if (!categories[formattedArtist]) {
        categories[formattedArtist] = [];
      }
      categories[formattedArtist].push({
        file: file,
        album: formatAlbumName(album)
      });
    });

    // Sort categories by sort key (second word for "the-*", first word otherwise)
    const sortedCategories = Object.keys(categories).sort((a, b) => {
      const getSortKey = (artist) => {
        const lower = artist.toLowerCase();
        if (lower.startsWith('the ')) {
          // For "The Beatles", sort key is "beatles"
          return lower.split(' ')[1];
        } else {
          // For others, sort key is first word
          return lower.split(' ')[0];
        }
      };
      
      const keyA = getSortKey(a);
      const keyB = getSortKey(b);
      return keyA.localeCompare(keyB);
    });

    console.log(`Created ${sortedCategories.length} categories:`, sortedCategories);

    // Read the HTML file
    let htmlContent = fs.readFileSync(bookmarksHtml, 'utf8');

    // Create the new categorized gallery HTML
    const galleryHtml = generateCategorizedGalleryHtml(categories, sortedCategories);

    // Replace everything between h1 and the script tag
    const contentRegex = /(<h1>Bookmarks<\/h1>)\s*[\s\S]*?(?=<script>)/;
    const newContent = `$1\n        ${galleryHtml}`;
    htmlContent = htmlContent.replace(contentRegex, newContent);

    // Generate the JavaScript config for categorized galleries
    const jsConfig = generateCategorizedJsConfig(categories, sortedCategories);
    
    // Replace the script content
    const scriptRegex = /<script>\s*[\s\S]*?<\/script>/;
    const newScript = `<script>
      ${jsConfig}
    </script>`;
    htmlContent = htmlContent.replace(scriptRegex, newScript);

    // Write back to file
    fs.writeFileSync(bookmarksHtml, htmlContent, 'utf8');

    console.log('✅ Updated bookmarks.html with categorized galleries');

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
    // Count .webp files
    const files = fs.readdirSync(stickersDir);
    const webpFiles = files.filter(file => file.endsWith('.webp'));

    // Find the highest number
    let maxCount = 0;
    webpFiles.forEach(file => {
      const match = file.match(/^(\d+)\.webp$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxCount) maxCount = num;
      }
    });

    if (maxCount === 0) {
      console.log('⚠️  No sequentially named sticker files found');
      return;
    }

    console.log(`Found ${maxCount} sticker images (1.webp to ${maxCount}.webp)`);

    // Read the HTML file
    let htmlContent = fs.readFileSync(stickersHtml, 'utf8');

    // Update the count
    htmlContent = htmlContent.replace(/count:\s*\d+,/, `count: ${maxCount},`);

    // Write back to file
    fs.writeFileSync(stickersHtml, htmlContent, 'utf8');

    console.log('✅ Updated stickers.html count to', maxCount);

  } catch (error) {
    console.error('❌ Error updating stickers gallery:', error.message);
    process.exit(1);
  }
}

function updatePostersGallery() {
  const postersDir = path.join(__dirname, 'shop', 'images', 'posters');
  const postersHtml = path.join(__dirname, 'shop', 'posters.html');

  try {
    // Count .webp files
    const files = fs.readdirSync(postersDir);
    const webpFiles = files.filter(file => file.endsWith('.webp'));

    // Find the highest number
    let maxCount = 0;
    webpFiles.forEach(file => {
      const match = file.match(/^(\d+)\.webp$/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxCount) maxCount = num;
      }
    });

    if (maxCount === 0) {
      console.log('⚠️  No sequentially named poster files found');
      return;
    }

    console.log(`Found ${maxCount} poster images (1.webp to ${maxCount}.webp)`);

    // Read the HTML file
    let htmlContent = fs.readFileSync(postersHtml, 'utf8');

    // Update the count
    htmlContent = htmlContent.replace(/count:\s*\d+,/, `count: ${maxCount},`);

    // Write back to file
    fs.writeFileSync(postersHtml, htmlContent, 'utf8');

    console.log('✅ Updated posters.html count to', maxCount);

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
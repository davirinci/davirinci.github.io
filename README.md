# Davinci Portfolio

Portfolio site for Virinci, a graphic designer, featuring a custom justified gallery layout and automated build system.

## 🚀 Setup

### Automated Deployment

Galleries update automatically on push to `main`:

1. Add images to `shop/images/{category}/` folders
2. Commit and push
3. GitHub Actions runs `build.js`
4. Gallery pages auto-update

### Manual Build

```bash
npm run build
```

### Local Development

```bash
npm start  # Start local server
```

## 📝 Naming Conventions for Image Assets

### Default Naming Convention

`{type}-{topic}-{rest}`

`{rest}` may have more hyphen-separated values which will be part of the search terms.

**Example:** `{rest} = {rest-all-day}`

"Rest", "all", and "day" are made searchable terms along with the topic.

If the file is named `album-gangster-rest-all-day.webp`:

- **Type** is `album`
- **Topic** is `gangster`
- **Title/Description** is "rest all day", which can be searched for

If the `-oc` slug is included in the filename, it will be categorized as Original Content. This is usually present at the end of the file, e.g., `album-gangster-rest-all-day-oc.webp`

---

### Examples for All Categories

#### Bookmarks

**Naming Pattern:** `albums-{artist}-{album}-oc.webp`

**Example Files:**

- `albums-queen-the-works-oc.webp`
- `albums-the-beatles-yellow-submarine-oc.webp`
- `albums-pinkFloyd-dark-side-of-the-moon-oc.webp`
- `albums-kendrickLamar-gnx-oc.webp`
- `albums-the-weeknd-starboy-oc.webp`
- `albums-nirvana-nevermind-oc.webp`

**Generated Filters:**

- **Type Filter:** Albums
- **Topic Filters:** KendrickLamar, LedZeppelin, Nirvana, PinkFloyd, Queen, The Beatles, The LocalTrain, The Weeknd
- **Search Terms:** Artist slug + album words (e.g., "queen the works", "beatles yellow submarine")
- **OC Status:** All marked as original content

#### Posters/Postcards

**Naming Pattern:** `{type}-{topic}-{description}-oc.webp`

**Example Files:**

- `poster-movie-fight-club.webp`
- `poster-movie-drive-horizontal.webp`
- `poster-series-breaking-bad-bb-collection.webp`
- `poster-batman-rogues-1.webp`
- `poster-MMA-dustin-poirer-oc.webp`
- `photo-nalanda-rainy-day-oc.webp`
- `postcard-ThileepanDrawing-bison-oc.webp`
- `postcard-misc-pink-skel-on-green.webp`

**Generated Filters:**

- **Type Filters:** Photo, Postcard, Poster
- **Topic Filters:** Artist, Batman, Car, MMA, Misc, Movie, Nalanda, Series, ThileepanDrawing
- **Search Terms:** All words after type (e.g., "movie fight club", "series breaking bad bb collection", "batman rogues")
- **OC Status:** Mixed - some files marked with `-oc`, others not

#### Stickers

**Naming Pattern:** `{type}-{topic}-{number}.webp`

**Example Files:**

- `game-ClashRoyale-005.webp`
- `show-BigBangTheory-001.webp`
- `show-friends-077.webp`
- `show-rickAndMorty-089.webp`
- `misc-misc-064.webp`

**Generated Filters:**

- **Type Filters:** Game, Misc, Show
- **Topic Filters:** BigBangTheory, ClashRoyale, Friends, Misc, RickAndMorty
- **Search Terms:** Topic words only (numbers are excluded from search terms)
- **OC Status:** None currently marked as original content

---

### Key Parsing Rules

1. **Type** = Always first segment
2. **Topic** = Second segment (if starts with "the-", includes next word: `the-beatles`, `the-weeknd`)
3. **OC Detection** = `-oc` anywhere in filename → `data-oc="true"`
4. **Search Terms** = Topic + remaining words (numbers excluded)
5. **Filter Labels** = Title-cased for display (`kendricklamar` → "KendrickLamar")
6. **Data Attributes** = Lowercase/hyphenated (`data-topic="the beatles"` for filtering)

## 🖼️ Gallery Features

### Posters (Justified Layout)

Uses a custom justified gallery algorithm that dynamically packs images to fill each row exactly to the container width, similar to Unsplash or Flickr. 

**How it works:**
- Each image is assigned "units" based on aspect ratio (portrait ≈ 1.0, landscape ≈ 1.6)
- Algorithm groups images into rows targeting specific unit counts (varies by screen size)
- Row heights are calculated to fill container width precisely, eliminating gaps
- Dimensions are extracted during build and embedded as data attributes for instant layout
- MutationObserver re-calculates layout when filters change or window resizes

**Features:**
- Preserves aspect ratios without cropping
- Responsive breakpoints adjust packing density
- Type/Topic filtering, search, OC toggle

### Bookmarks

- Grid layout with artist grouping
- Automatic sorting by artist/album
- Type/Topic filtering, search, OC toggle

### Stickers

- Uniform grid layout
- Sequential numbering in filenames
- Type/Topic filtering, search, OC toggle

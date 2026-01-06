# Naming Conventions for Image Assets

## Default Naming Convention

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

## Examples for All Categories

### Bookmarks

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

### Posters/Postcards

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

### Stickers

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

## Key Parsing Rules

1. **Type** = Always first segment
2. **Topic** = Second segment (if starts with "the-", includes next word: `the-beatles`, `the-weeknd`)
3. **OC Detection** = `-oc` anywhere in filename → `data-oc="true"`
4. **Search Terms** = Topic + remaining words (numbers excluded)
5. **Filter Labels** = Title-cased for display (`kendricklamar` → "KendrickLamar")
6. **Data Attributes** = Lowercase/hyphenated (`data-topic="the beatles"` for filtering)

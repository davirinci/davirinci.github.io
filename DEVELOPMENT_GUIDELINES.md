# Development Guidelines for davirinci.github.io

This document outlines the standards and requirements for adding new pages to the Various Thingamjigs website.

## Table of Contents

1. [File Structure](#file-structure)
2. [HTML Template](#html-template)
3. [CSS & Styling](#css--styling)
4. [Navigation](#navigation)
5. [Theme System](#theme-system)
6. [JavaScript Requirements](#javascript-requirements)
7. [Accessibility](#accessibility)

---

## File Structure

### Root Level Pages

Pages in the root directory should follow this naming:

- `index.html` - Homepage
- `contact.html` - Contact page
- `shop.html` - Main shop page

### Nested Pages (e.g., Shop Categories)

Nested pages live in subdirectories and follow this structure:

- `/shop/bookmarks.html`
- `/shop/posters.html`
- `/shop/stickers.html`

**Important**: CSS and JS paths must be relative to the file's location. Use `../` for nested pages.

---

## HTML Template

### Root Level Page Template

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title – Various Thingamjigs</title>
    <link rel="stylesheet" href="css/styles.css" />
  </head>
  <body>
    <header id="mainHeader">
      <div class="container">
        <h1>Various Thingamjigs</h1>
      </div>
    </header>

    <iframe
      src="/navbar.html"
      id="navbar"
      title="Navigation"
      style="height: 48px"
    ></iframe>

    <!-- Page Content Here -->

    <script src="js/disable-contextmenu.js"></script>
    <script src="js/theme.js"></script>
  </body>
</html>
```

### Nested Page Template (e.g., `/shop/newpage.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Title – Various Thingamjigs</title>
    <link rel="stylesheet" href="../css/styles.css" />
  </head>
  <body>
    <header id="mainHeader">
      <div class="container">
        <h1>Various Thingamjigs</h1>
      </div>
    </header>

    <iframe
      src="/navbar.html"
      id="navbar"
      title="Navigation"
      style="height: 48px"
    ></iframe>

    <!-- Page Content Here -->

    <script src="../js/disable-contextmenu.js"></script>
    <script src="../js/theme.js"></script>
  </body>
</html>
```

### Key Template Elements

1. **DOCTYPE & Language**

   - Always use `<!DOCTYPE html>` and `lang="en"`

2. **Meta Tags** (Required)

   ```html
   <meta charset="UTF-8" />
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

3. **Title Format**

   - Root pages: `Page Title – Various Thingamjigs`
   - Nested pages: `Page Title – Various Thingamjigs`
   - Use en-dash (–) separator

4. **Header** (Required on all pages)

   ```html
   <header id="mainHeader">
     <div class="container">
       <h1>Various Thingamjigs</h1>
     </div>
   </header>
   ```

5. **Navigation Iframe** (Required on all pages)
   ```html
   <iframe
     src="/navbar.html"
     id="navbar"
     title="Navigation"
     style="height: 48px"
   ></iframe>
   ```
   - Must have `id="navbar"` and `title="Navigation"` for accessibility
   - Fixed height of `48px` - **do not change without updating CSS**
   - Always use absolute path `/navbar.html` (works from any directory)

---

## CSS & Styling

### Stylesheet Links

**Root Level:**

```html
<link rel="stylesheet" href="css/styles.css" />
```

**Nested Level (e.g., `/shop/`):**

```html
<link rel="stylesheet" href="../css/styles.css" />
```

### CSS Classes & IDs

#### Required Container Class

All main content should be wrapped in:

```html
<div class="container">
  <!-- Your content -->
</div>
```

- `.container` provides 80% width with centered margin
- Consistent with site-wide layout

#### Theme Variables

The CSS uses CSS custom properties for theming. Access theme colors via:

- `var(--bg)` - Background color
- `var(--text)` - Text color
- `var(--accent)` - Accent color
- `var(--nav-bg)` - Navigation background
- `var(--nav-text)` - Navigation text color
- `var(--header-bg)` - Header background
- `var(--header-text)` - Header text color

Use these variables instead of hardcoding colors to ensure theme compatibility.

### Custom Styling

All custom styles should be added to `css/styles.css`. Follow existing conventions:

- Use kebab-case for class names
- Use camelCase for IDs
- Group related styles together
- Comment section headers for clarity

---

## Navigation

### Navbar System

The navbar is a **separate HTML file** (`navbar.html`) embedded via iframe on every page.

#### Benefits

- Single source of truth for navigation
- Update navbar once, applies everywhere
- Theme toggle works across all pages via localStorage

#### Navbar Links

Current navbar links are absolute paths:

- `/` - Home
- `/shop.html` - Shop
- `/contact.html` - Contact

**When adding new pages:**

1. Add link to `navbar.html`
2. Use absolute path format: `/pagename.html` or `/folder/pagename.html`
3. Use `target="_parent"` attribute (already set in navbar.html)

### How Navbar Works

- Loaded in iframe with `src="/navbar.html"`
- Uses absolute paths so it works from any page depth
- Theme state shared via localStorage
- Clicking navbar links uses `target="_parent"` to navigate parent window

---

## Theme System

### How Theming Works

The site supports 4 themes: `royal` (default), `deep`, `dark`, `light`

#### Theme Persistence

Themes are saved to `localStorage` under key `theme` and persist across sessions.

#### Theme Script Loading

1. `js/theme.js` loads on every page
2. Handles theme toggle button click
3. Syncs theme across iframe and parent window via `storage` events
4. Updates `data-theme` attribute on `<body>` tag

### Current Theme Colors

**Royal (Default)**

- Background: `#090040` (deep blue)
- Text: `#e6edf7` (light)
- Accent: `#b13bff` (neon purple)

**Deep**

- Background: `#0b1e3a` (midnight blue)
- Text: `#e6edf7`
- Accent: `#4c6fff` (blue)

**Dark**

- Background: `#000000` (pure black)
- Text: `#e8e8e8`
- Accent: `#90caf9` (pastel blue)

**Light**

- Background: `#ffffff`
- Text: `#333333`
- Accent: `#333333`

### Using Theme Colors in CSS

Always reference theme colors via CSS variables:

```css
.my-element {
  background: var(--bg);
  color: var(--text);
  border-color: var(--accent);
}
```

---

## JavaScript Requirements

### Required Scripts

Every page must include these scripts **in order** at the end of `<body>`:

```html
<script src="js/disable-contextmenu.js"></script>
<script src="js/theme.js"></script>
```

**For nested pages, use relative paths:**

```html
<script src="../js/disable-contextmenu.js"></script>
<script src="../js/theme.js"></script>
```

### Script Purposes

1. **disable-contextmenu.js** - Disables right-click context menu
2. **theme.js** - Manages theme switching and persistence

### Custom JavaScript

If adding custom JavaScript:

- Create new files in `/js/` directory
- Load at end of `<body>` tag
- Use consistent naming: `descriptive-name.js` (kebab-case)
- Add inline comments for complex logic
- Ensure accessibility (keyboard navigation, ARIA labels)

---

## Accessibility

### HTML Structure Best Practices

1. **Semantic HTML**

   - Use `<header>`, `<main>`, `<section>`, `<nav>` appropriately
   - Avoid using `<div>` for semantic content

2. **Headings**

   - Start with `<h1>` for page title
   - Use proper heading hierarchy (`<h2>`, `<h3>`, etc.)
   - Do not skip heading levels

3. **ARIA Labels**

   - Use `aria-label` on interactive elements without visible text
   - Example from navbar: `aria-label="Toggle theme"`
   - Use `aria-current="page"` on active navigation links

4. **Images**

   - Always include `alt` attribute
   - Describe content, not just "image"
   - Example: `alt="Gallery of autumn landscape photos"`

5. **Forms**
   - Label all form inputs with `<label>`
   - Use descriptive `aria-label` if label not visible
   - Example: `<input type="text" placeholder="Search..." aria-label="Search gallery" />`

### Color Contrast

- Ensure text has sufficient contrast with background
- Test with theme colors, especially light theme
- Use automated tools to verify WCAG AA compliance

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use native HTML buttons/links when possible
- If using custom interactive elements, add `tabindex`, keyboard handlers, and ARIA roles

---

## Common Patterns

### Container Wrapper Pattern

```html
<div class="container">
  <h2>Section Title</h2>
  <p>Content here...</p>
</div>
```

### Gallery/Grid Pattern

See `/shop/stickers.html`, `/shop/bookmarks.html`, `/shop/posters.html` for reference implementations with:

- Filtering system
- Search functionality
- Dynamic gallery generation
- Responsive grid layout

### Jumbo Section Pattern (Hero/Banner)

```html
<section id="jumbo">
  <div class="container">
    <h1>Large headline</h1>
  </div>
</section>
```

---

## Checklist for New Pages

- [ ] File created in correct directory (root or subdirectory)
- [ ] Correct HTML template used with proper paths
- [ ] Page title follows format: `Title – Various Thingamjigs`
- [ ] Header with "Various Thingamjigs" h1 included
- [ ] Navbar iframe included with correct attributes and height
- [ ] CSS stylesheet linked with correct relative path
- [ ] All theme colors use CSS variables
- [ ] Required scripts included (`disable-contextmenu.js`, `theme.js`)
- [ ] All links use correct absolute or relative paths
- [ ] Semantic HTML used throughout
- [ ] All interactive elements have ARIA labels
- [ ] Images have descriptive alt text
- [ ] Page tested in all 4 themes
- [ ] Page tested on mobile (responsive)
- [ ] Links tested for correct navigation
- [ ] Navbar theme toggle tested and works

---

## Quick Reference: Relative Paths

### Root Level Page

- CSS: `href="css/styles.css"`
- JS: `src="js/filename.js"`
- Iframe: `src="/navbar.html"`
- Links: `href="page.html"` or `href="/page.html"`

### Nested Page (e.g., `/shop/page.html`)

- CSS: `href="../css/styles.css"`
- JS: `src="../js/filename.js"`
- Iframe: `src="/navbar.html"`
- Links: `href="../page.html"` (sibling) or `href="/page.html"` (absolute)

---

## Contact & Updates

For questions or updates to these guidelines, review the site structure and update this document accordingly.

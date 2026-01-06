# Image Formatting Conventions

All images must be converted to WebP format with specific dimensions based on their gallery type.

## Image Specifications

### Stickers

- **Format:** WebP
- **Dimensions:** Fixed width of **512px** (height varies by aspect ratio)
- **Quality:** 80%
- **Aspect Ratio:** Preserved

### Bookmarks

- **Format:** WebP
- **Dimensions:** Fixed height of **700px** (width varies by aspect ratio)
- **Quality:** 80%
- **Aspect Ratio:** Preserved

### Posters & Postcards

- **Format:** WebP
- **Dimensions:** Fixed height of **800px** (width varies by aspect ratio)
- **Quality:** 80%
- **Aspect Ratio:** Preserved

---

## Conversion Commands

### Using ImageMagick

Open the image folder containing your source files (named using proper [naming conventions](NAMING_CONVENTIONS.md)) and run the appropriate command:

#### Stickers

```bash
mkdir -p webp && magick mogrify -path webp -format webp -geometry 512x -quality 80 *.*
```

This creates a `webp/` subdirectory and outputs compressed files at 512px width.

#### Bookmarks

```bash
mkdir -p webp && magick mogrify -path webp -geometry x700 -quality 80 -format webp *.*
```

This creates a `webp/` subdirectory and outputs compressed files at 700px height.

#### Posters & Postcards

```bash
mkdir -p webp && magick mogrify -path webp -geometry x800 -quality 80 -format webp *.*
```

This creates a `webp/` subdirectory and outputs compressed files at 800px height.

---

## Notes

- **Tool Independence:** While ImageMagick is shown as an example, any image processing tool that can produce WebP at the specified dimensions and quality will work.
- **Quality Setting:** 80% quality provides a good balance between file size and visual quality for web delivery.
- **Aspect Ratio:** Always preserve the original aspect ratio. Only constrain one dimension (width or height) and let the other scale proportionally.
- **Output Directory:** The commands above create a `webp/` subdirectory to keep converted files separate from originals. Confirm that the files are satisfactory and then replace the larger bloated images with the smaller web-optimised images. If not satisfactory increase (or even remove the quality parameter) or increase the height or width that the image was downscaled to.

## Workflow

1. Name your source files following [naming conventions](NAMING_CONVENTIONS.md)
2. Run the appropriate conversion command for your gallery type
3. Move converted `.webp` files from the `webp/` subdirectory to `shop/images/{category}/`
4. Commit and push—the build process will handle the rest

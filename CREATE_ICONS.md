# Creating Extension Icons

The extension requires three PNG icon files. You have several options:

## Option 1: Use Online Icon Generator (Easiest)
1. Go to https://www.favicon-generator.org/
2. Upload or create your image (or use the default)
3. Download the favicon package
4. Extract the files and rename:
   - `favicon-16x16.png` → `icon-16.png`
   - `favicon-48x48.png` → `icon-48.png`
   - `favicon-128x128.png` → `icon-128.png`
5. Place in `icons/` folder

## Option 2: Quick SVG to PNG Converter
Create SVG icons with text "PA" (Prior Auth):

### Create `icon.svg`:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="url(#grad)" rx="24"/>
  <text x="64" y="75" font-size="56" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">PA</text>
</svg>
```

Then convert to PNG using:
- https://cloudconvert.com/svg-to-png
- Upload your SVG, select output sizes (16x16, 48x48, 128x128)
- Download each and rename

## Option 3: Python Script (If you have Python installed)
```python
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, output_path):
    # Create gradient background
    img = Image.new('RGB', (size, size), color='#38bdf8')
    
    # Add text
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", int(size * 0.6))
    except:
        font = ImageFont.load_default()
    
    # Draw "PA"
    text = "PA"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    img.save(output_path)
    print(f"Created {output_path}")

# Create icons
create_icon(16, "icons/icon-16.png")
create_icon(48, "icons/icon-48.png")
create_icon(128, "icons/icon-128.png")
```

Save as `create_icons.py`, run with `python create_icons.py`

## Option 4: Use Existing Medical Icons
Search for "medical plus" or "stethoscope" PNG icons at:
- https://www.flaticon.com/
- https://www.iconfinder.com/
- https://www.icons8.com/

Download in the three sizes (16x16, 48x48, 128x128) and rename accordingly.

## Directory Structure After Setup
```
clinisys-pa-justification/
├── manifest.json
├── popup.html
├── popup.js
├── background.js
├── prior-auth-copilot.html (full-page version)
├── icons/
│   ├── icon-16.png    (16x16 pixels)
│   ├── icon-48.png    (48x48 pixels)
│   └── icon-128.png   (128x128 pixels)
└── EXTENSION_SETUP.md
```

## Next Steps After Creating Icons
1. Create the `icons/` folder: `mkdir icons`
2. Place the three PNG files in it
3. Load the extension in Chrome/Edge:
   - `chrome://extensions/` (Chrome)
   - `edge://extensions/` (Edge)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select your folder
4. The extension icon should now appear in the toolbar!

## Icon Best Practices
- Use clear, simple designs (readable at 16x16)
- Use brand colors (light blue #38bdf8 matches the app theme)
- Medical/clinical theme (plus sign, stethoscope, clipboard, briefcase)
- Ensure white/light colors for visibility against dark browser toolbars
- Test at actual sizes before finalizing

---

Once icons are created and the extension is loaded, you're ready to use Prior Auth Copilot! 🚀

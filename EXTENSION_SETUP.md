# Prior Auth Copilot - Chrome/Edge Extension Setup

## Overview
Prior Auth Copilot is a browser extension that provides clinical decision support for prior authorization planning. It runs entirely locally in your browser with no external network calls.

## Files Included
- `manifest.json` - Extension configuration (Manifest v3)
- `popup.html` - Extension popup UI (compact 1000x700 layout)
- `popup.js` - Core rules engine and event handlers
- `background.js` - Service worker (required for Manifest v3)
- `icons/` - Extension icons (16px, 48px, 128px)

## Installation Steps

### For Chrome:
1. **Download the extension files** to a local folder (all files in the root directory)
2. **Create icons folder:**
   ```bash
   mkdir icons
   ```
   
3. **Add icon files** (use any image editor or create simple PNG files):
   - `icons/icon-16.png` (16x16 pixels)
   - `icons/icon-48.png` (48x48 pixels)  
   - `icons/icon-128.png` (128x128 pixels)
   
   *Temporary solution:* If you don't have icons yet, you can temporarily comment out the icon references in `manifest.json`, or use a placeholder image.

4. **Open Chrome Extensions page:**
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right)
   - Click **Load unpacked**
   - Select the folder containing these files

5. **Extension is now active!**
   - Click the extension icon in the top-right corner
   - The popup opens with the Prior Auth Copilot interface

### For Edge:
1. Follow the same steps as Chrome
2. Go to `edge://extensions/` instead of `chrome://extensions/`
3. Rest of the process is identical

## Features

### Quick Start
- **Expand Button:** Click the expand icon to open the app in a full window (better for detailed analysis)
- **Demo Data:** Form auto-fills from browser storage (saved after each analysis)

### Workflow
1. **Select payer** (Medicare Advantage, Aetna, BCBS, Medicaid)
2. **Choose service** (MRI Lumbar, MRI Cervical, CT Abd/Pelvis, Pelvic US, Knee arthroscopy)
3. **Enter diagnosis** (ICD-10 code, e.g., M54.16)
4. **Add optional details** (age, symptom duration, conservative care, red flags)
5. **Click "Analyze"** to score and generate justification note
6. **Copy or download** the generated note

### Rules Engine
The extension includes local rules for:
- **MRI Lumbar Spine** - Requires 6+ weeks conservative care (PT + NSAIDs)
- **MRI Cervical Spine** - Similar thresholds for neck/arm radiculopathy
- **CT Abdomen/Pelvis** - Less conservative care required (acute presentations)
- **Pelvic Ultrasound** - Obstetric/gynecologic imaging
- **Knee Arthroscopy** - Requires mechanical symptoms + failed conservative care

Each service has:
- **Payer-specific adjustments** (Medicare Advantage, Aetna, BCBS, Medicaid)
- **ICD-10 severity mapping** (severe/moderate/mild)
- **Red flag detection** (cauda equina, progressive weakness, etc.)
- **Documentation gap analysis**

## Privacy & Security
✅ **No data leaves your browser**
- All analysis happens locally
- No external API calls
- Safe for demo/test data
- Uses Chrome's local storage for case history

⚠️ **Important:** This is for clinical decision support only. It does not replace:
- Provider clinical judgment
- Payer-specific policies (always verify with the actual payer)
- Current clinical guidelines
- Specialist consultation

## Customization

### Adding More Services
Edit `popup.js` and add entries to the `RULES` object:
```javascript
const RULES = {
  YOUR_SERVICE: {
    label: "Service Name",
    cpt: ["12345"],
    baseWeight: 0.5,
    // ... other fields
  }
};
```

### Modifying Payer Rules
Each service in `RULES` has `payerAdjustments`:
```javascript
payerAdjustments: {
  "Medicare Advantage": { weightDelta: 0.05 },
  "Commercial – Aetna": { weightDelta: -0.05 },
  // ...
}
```

Lower `weightDelta` = stricter payer (lower approval probability)

## Troubleshooting

### Extension doesn't appear in toolbar
- Go to `chrome://extensions/` and verify it's enabled
- Check that `manifest.json` is valid JSON (use JSONLint)
- Reload the extension (toggle off/on in Extensions page)

### Icons not showing
- Verify icon files exist in `icons/` folder
- Icon files must be PNG format and correct dimensions
- Reload the extension after adding icons

### Form data not saving between sessions
- This is by design (privacy). Data saves within the session only
- Refresh browser clears stored data

### Analysis shows "Pending" score
- Ensure all required fields are filled: Payer, Service, ICD-10
- Click "Analyze" button to recalculate

## Future Enhancements
Potential additions:
- ✨ Integration with Epic/Cerner notes (content script)
- ✨ Keyboard shortcut to open extension
- ✨ Export to PDF with clinic letterhead
- ✨ Sync settings across devices
- ✨ Real-time payer criteria updates (from MCG/eviCore)
- ✨ Autocomplete for ICD-10 codes
- ✨ Case templates and library

## Support
For issues or feature requests, contact the development team or check:
- Chrome Extension documentation: https://developer.chrome.com/docs/extensions/
- Edge Extension documentation: https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/

---

**Version:** 1.0.0  
**Last Updated:** 2026-06-03  
**License:** Internal Use Only

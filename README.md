# Copy Rich URL - Chrome Extension

A lightweight Chrome extension that copies the current page's URL and Title as a rich HTML link (`<a href="URL">Title</a>`) to your clipboard.

## Features

- **Rich Copy**: Copies a rich text link that will be pasted as a hyperlink in rich text editors (Outlook, Slack, Word, etc.).
- **Simple Popup Interface**: Click the extension icon → click "Copy Current URL" button → done!
- **Visual Feedback**: Shows "✓ Copied!" status in the popup before auto-closing.
- **Privacy First**: Only requires `activeTab` permission—no access to page content, no security risks.

## Why a Popup?

Chrome's Clipboard API requires **user activation** (a user gesture like a click) to write rich HTML content to the clipboard. This is a security feature to prevent malicious extensions from silently modifying your clipboard.

The popup provides this user activation through the button click. Without it, we would need to:
- Request `scripting` permission to inject code into every page (security risk), OR
- Use deprecated/unreliable methods like `document.execCommand('copy')`

The popup approach is the cleanest, most secure solution that works reliably across all websites.

## Installation (Developer Mode)

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the project root directory (`ChromeExt_CopyRichURL`).

## Project Structure

- `manifest.json`: Extension configuration (Manifest V3).
- `src/popup.html` + `src/popup.js`: Popup interface for copying URLs.
- `src/options.html`: Extension information page.
- `icons/`: Extension icons in various sizes.
- `Scripts/`: Utility scripts (e.g., icon generation).
- `SPECS/`: Technical design and planning documents.

## Development

### Generating Icons

Icons are generated from the source image `icons_source/CopyRichURL_icon.png` using the provided C# script:

```powershell
dotnet run --file Scripts/GenerateExtensionIcons.cs
```

This generates all required sizes: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`

The icon is designed to work on any toolbar background (light, dark, or custom themes).

### Building for Chrome Web Store

To create a zip file for uploading to the Chrome Web Store:

```cmd
cmd\build.bat
```

This creates `build/CopyRichURL-v1.0.zip` containing only the necessary files for publication.

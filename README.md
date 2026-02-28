# Copy Rich URL - Chrome Extension

A lightweight Chrome extension that copies the current page's URL and Title as a rich HTML link (`<a href="URL">Title</a>`) to your clipboard.

## Features

- **Rich Copy**: Copies a rich text link that will be pasted as a hyperlink in rich text editors (Outlook, Slack, Word, etc.).
- **Multiple Triggers**:
  - Extension button in the toolbar.
  - Right-click context menu ("Copy Rich URL").
  - Keyboard shortcut (Default: `Ctrl+Shift+C` or `Cmd+Shift+C`).
- **Visual Feedback**: Shows a temporary "OK" badge and tooltip confirmation.
- **Privacy First**: Uses `activeTab` permission—only accesses the page you are currently looking at when you explicitly trigger it.

## Installation (Developer Mode)

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the project root directory (`ChromeExt_CopyRichURL`).

## Configuration

To change the keyboard shortcut:

1. Go to `chrome://extensions/shortcuts`.
2. Find **Copy Rich URL**.
3. Type your preferred key combination.

## Project Structure

- `manifest.json`: Extension configuration (Manifest V3).
- `src/background.js`: Service worker handling events and triggers.
- `src/offscreen.js`: Helper for rich clipboard access.
- `src/options.html`: Extension information and settings guide.
- `icons/`: Extension icons in various sizes.
- `Scripts/`: Utility scripts (e.g., icon generation).
- `_SPECS/`: Technical design and planning documents.

## Development

The icons were generated from a source PNG using the provided C# script:

```powershell
dotnet run --file Scripts/GenerateExtensionIcons.cs
```

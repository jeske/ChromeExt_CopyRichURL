# Copy Rich URL - Chrome Extension Specification

## Overview
A Chrome extension that copies the current page's URL and Title as a rich HTML link (`<a href="URL">Title</a>`) to the clipboard.

## Architecture
The extension uses Manifest V3 and follows a "minimum permissions" approach.

### Components
1.  **Background Service Worker (`src/background.js`)**:
    *   Handles the `action.onClicked` event (extension button).
    *   Creates and manages the context menu item.
    *   Listens for the keyboard shortcut command.
    *   Retrieves the current tab's URL and Title using `chrome.tabs`.
    *   Manages the lifecycle of the Offscreen Document.
    *   Updates the extension badge for visual feedback.

2.  **Offscreen Document (`src/offscreen.html` / `src/offscreen.js`)**:
    *   Since Service Workers cannot access the DOM or the Clipboard API directly, this hidden document is created on-demand to perform the "rich" clipboard write.
    *   Uses `navigator.clipboard.write` with `ClipboardItem` to write both `text/plain` and `text/html` data.

3.  **Options Page (`src/options.html` / `src/options.js`)**:
    *   Provides a simple UI explaining the extension.
    *   Includes instructions on how to configure the keyboard shortcut via `chrome://extensions/shortcuts`.

### Permissions
*   `activeTab`: To get the URL and Title of the current tab only when the user interacts with the extension.
*   `contextMenus`: To add the "Copy Rich URL" option to the page context menu.
*   `offscreen`: To allow the creation of the offscreen document for clipboard access.

## User Experience
*   **Hover**: Tooltip "Click to copy URL".
*   **Click/Trigger**: 
    1. Copies rich link to clipboard.
    2. Shows "Copied!" badge on the extension icon for 1.5 seconds.
*   **Context Menu**: Right-click on any page to see "Copy Rich URL" with the extension icon.
*   **Keyboard Shortcut**: Configurable via Chrome settings (defaults to unset).

## Icon Generation
The provided `CopyRichURL_icon.png` (120x72) will be processed using a repurposed C# script to generate square PNGs:
*   16x16, 32x32, 48x48, 128x128
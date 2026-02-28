// Signal to background service worker that this offscreen document is loaded and ready
chrome.runtime.sendMessage({ type: 'offscreen-ready' });

// Listen for clipboard copy requests from the background service worker.
// Uses sendResponse to reply with success/failure (return true keeps channel open for async).
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') {
    return;
  }

  if (message.type === 'copy-to-clipboard') {
    writeRichLinkToClipboard(message.data)
      .then(() => sendResponse({ success: true }))
      .catch((clipboardError) => {
        console.error('src/offscreen.js:writeRichLinkToClipboard failed:', clipboardError.message);
        sendResponse({ success: false, errorMessage: clipboardError.message });
      });
    return true; // Keep message channel open for async sendResponse
  }
});

async function writeRichLinkToClipboard(linkData) {
  // Programmatically click button to create user activation for clipboard API
  const clipboardTriggerButton = document.getElementById('clipboard-trigger');
  clipboardTriggerButton.click();
  
  const richHtmlLink = `<a href="${linkData.url}">${linkData.title}</a>`;
  
  const htmlBlob = new Blob([richHtmlLink], { type: 'text/html' });
  const plainTextBlob = new Blob([linkData.url], { type: 'text/plain' });
  const clipboardItem = new ClipboardItem({
    'text/html': htmlBlob,
    'text/plain': plainTextBlob
  });
  
  await navigator.clipboard.write([clipboardItem]);
}
document.getElementById('copy-button').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!activeTab || !activeTab.url || !activeTab.title) {
    console.error('src/popup.js: No active tab found');
    window.close();
    return;
  }
  
  try {
    const richHtmlLink = `<a href="${activeTab.url}">${activeTab.title}</a>`;
    
    const htmlBlob = new Blob([richHtmlLink], { type: 'text/html' });
    const plainTextBlob = new Blob([activeTab.url], { type: 'text/plain' });
    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': plainTextBlob
    });
    
    await navigator.clipboard.write([clipboardItem]);
    
    // Show success toast on the page
    showToastOnPage(activeTab.id, '✓ URL copied to clipboard!', '#4CAF50');
    
    // Close popup immediately
    window.close();
  } catch (clipboardError) {
    console.error('src/popup.js: Clipboard write failed:', clipboardError);
    
    // Show error toast on the page
    showToastOnPage(activeTab.id, `✗ Copy failed: ${clipboardError.message}`, '#F44336');
    
    // Close popup even on error
    window.close();
  }
});

async function showToastOnPage(tabId, message, backgroundColor) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    css: `
      .copy-rich-url-toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 14px;
      }
      .copy-rich-url-toast.show {
        opacity: 1;
      }
    `
  });
  
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (toastMessage, bgColor) => {
      const existingToast = document.querySelector('.copy-rich-url-toast');
      if (existingToast) {
        existingToast.remove();
      }
      
      const toast = document.createElement('div');
      toast.className = 'copy-rich-url-toast';
      toast.style.backgroundColor = bgColor;
      toast.textContent = toastMessage;
      document.body.appendChild(toast);
      
      setTimeout(() => { toast.classList.add('show'); }, 10);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300);
      }, 2500);
    },
    args: [message, backgroundColor]
  });
}
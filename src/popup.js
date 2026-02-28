document.getElementById('copy-button').addEventListener('click', async () => {
  const statusElement = document.getElementById('status');
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!activeTab || !activeTab.url || !activeTab.title) {
    console.error('src/popup.js: No active tab found');
    statusElement.textContent = '✗ No tab found';
    statusElement.style.color = '#F44336';
    statusElement.style.display = 'block';
    setTimeout(() => window.close(), 1000);
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
    
    // Show success status in popup
    statusElement.textContent = '✓ Copied!';
    statusElement.style.color = '#4CAF50';
    statusElement.style.display = 'block';
    
    // Close popup after brief delay
    setTimeout(() => window.close(), 500);
  } catch (clipboardError) {
    console.error('src/popup.js: Clipboard write failed:', clipboardError);
    
    statusElement.textContent = '✗ Copy failed';
    statusElement.style.color = '#F44336';
    statusElement.style.display = 'block';
    
    setTimeout(() => window.close(), 1500);
  }
});
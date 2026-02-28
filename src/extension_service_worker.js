const CONTEXT_MENU_ID = 'copy-rich-url-context-menu';
const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen.html';

// Offscreen document readiness tracking
let resolveOffscreenReady;
let offscreenDocumentReady = new Promise(resolve => { resolveOffscreenReady = resolve; });

// Create offscreen document immediately on service worker startup
setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);

// Initialize context menu on installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed, creating context menu...');
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Copy Rich URL',
    contexts: ['page']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Context menu creation error:', chrome.runtime.lastError);
    } else {
      console.log('Context menu created successfully');
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    handleCopyRequest(tab);
  }
});

// Handle extension action clicks
chrome.action.onClicked.addListener((tab) => {
  handleCopyRequest(tab);
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'copy-rich-url') {
    const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (activeTab) {
      handleCopyRequest(activeTab);
    }
  }
});

// Main handler for copy requests
async function handleCopyRequest(tab) {
  console.log('Copy request triggered for tab:', tab.id, tab.url);
  
  if (!tab.url || !tab.title) {
    console.warn('Missing tab URL or title, cannot proceed');
    return;
  }

  // Ensure offscreen document exists (safety net for service worker restarts)
  await setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH);
  // Wait for offscreen document to signal it's ready
  await offscreenDocumentReady;
  
  console.log('Sending copy message to offscreen document...');
  const clipboardOperationResult = await new Promise((resolve) => {
    const responseTimeout = setTimeout(() => {
      resolve({ success: false, errorMessage: 'Clipboard operation timed out after 1 second — offscreen document did not respond' });
    }, 1000);
    
    chrome.runtime.sendMessage({
      type: 'copy-to-clipboard',
      target: 'offscreen',
      data: {
        url: tab.url,
        title: tab.title
      }
    }, (response) => {
      clearTimeout(responseTimeout);
      if (chrome.runtime.lastError) {
        resolve({ success: false, errorMessage: chrome.runtime.lastError.message });
      } else {
        resolve(response || { success: false, errorMessage: 'No response received from offscreen document' });
      }
    });
  });

  if (clipboardOperationResult.success) {
    console.log('Clipboard copy succeeded');
    showCopySuccessFeedback();
  } else {
    console.error('Clipboard copy failed:', clipboardOperationResult.errorMessage);
    showCopyFailureFeedback(clipboardOperationResult.errorMessage);
  }
}

// Listen for offscreen document readiness signal
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'offscreen-ready') {
    console.log('Offscreen document is ready');
    resolveOffscreenReady();
  }
});

async function setupOffscreenDocument(path) {
  // Check if an offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(path)]
  });

  if (existingContexts.length > 0) {
    // Document already exists and is ready (survived service worker restart)
    resolveOffscreenReady();
    return;
  }

  // Create the offscreen document — it will send 'offscreen-ready' when loaded
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['CLIPBOARD'],
    justification: 'Copying rich HTML link to clipboard'
  });
}

function showCopySuccessFeedback() {
  chrome.action.setBadgeText({ text: 'OK' });
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
  chrome.action.setTitle({ title: 'URL copied to clipboard!' });
  showToastInActiveTab('✓ URL copied to clipboard!', '#4CAF50');

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Click to copy URL' });
  }, 1500);
}

function showCopyFailureFeedback(errorMessage) {
  chrome.action.setBadgeText({ text: '✗' });
  chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
  chrome.action.setTitle({ title: 'Copy failed!' });
  showToastInActiveTab(`✗ Copy failed: ${errorMessage}`, '#F44336');

  setTimeout(() => {
    chrome.action.setBadgeText({ text: '' });
    chrome.action.setTitle({ title: 'Click to copy URL' });
  }, 3000);
}

async function showToastInActiveTab(toastMessage, backgroundColor) {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id) {
    console.warn('No active tab found for toast notification');
    return;
  }
  
  await chrome.scripting.insertCSS({
    target: { tabId: activeTab.id },
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
    target: { tabId: activeTab.id },
    func: (message, bgColor) => {
      const existingToast = document.querySelector('.copy-rich-url-toast');
      if (existingToast) {
        existingToast.remove();
      }
      
      const toast = document.createElement('div');
      toast.className = 'copy-rich-url-toast';
      toast.style.backgroundColor = bgColor;
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => { toast.classList.add('show'); }, 10);
      
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 300);
      }, 2500);
    },
    args: [toastMessage, backgroundColor]
  });
}
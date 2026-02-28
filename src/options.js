document.getElementById('configure-shortcuts').addEventListener('click', (event) => {
  event.preventDefault();
  // Open the Chrome extensions shortcuts page
  chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});
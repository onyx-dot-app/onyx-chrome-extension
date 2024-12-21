(function() {
  const iframe = document.getElementById('onyx-panel-iframe');

  // For now, we're using a static URL. In the future, this could be made configurable.
  const defaultUrl = 'http://localhost:3000/chat';

  // Set the iframe src
  iframe.src = defaultUrl;

  // In the future, you might want to add functionality here to dynamically update the iframe src
  // based on user settings stored in chrome.storage.sync
})();

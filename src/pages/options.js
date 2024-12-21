(function() {
  const domainInput = document.getElementById('onyxDomain');
  const saveButton = document.getElementById('save');
  const statusElement = document.getElementById('status');

  // Load existing value from storage
  chrome.storage.sync.get({ onyxDomain: 'http://localhost:3000/nrf' }, (result) => {
    domainInput.value = result.onyxDomain;
  });

  saveButton.addEventListener('click', () => {
    const domain = domainInput.value.trim();
    chrome.storage.sync.set({ onyxDomain: domain || 'http://localhost:3000/nrf' }, () => {
      statusElement.textContent = 'Domain saved!';
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
    });
  });
})();

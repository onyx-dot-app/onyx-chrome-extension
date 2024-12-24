document.addEventListener('DOMContentLoaded', function() {
  const domainInput = document.getElementById('onyxDomain');
  const useOnyxAsDefaultToggle = document.getElementById('useOnyxAsDefault');
  const saveButton = document.getElementById('save');
  const statusElement = document.getElementById('status');

  // Load existing values from storage
  chrome.storage.local.get({ onyxDomain: 'http://localhost:3000/nrf', useOnyxAsDefaultNewTab: false }, (result) => {
    domainInput.value = result.onyxDomain;
    useOnyxAsDefaultToggle.checked = result.useOnyxAsDefaultNewTab;
  });

  saveButton.addEventListener('click', () => {
    const domain = domainInput.value.trim();
    const useOnyxAsDefault = useOnyxAsDefaultToggle.checked;

    chrome.storage.local.set(
      { 
        onyxDomain: domain || 'http://localhost:3000/nrf',
        useOnyxAsDefaultNewTab: useOnyxAsDefault
      }, 
      () => {
        statusElement.textContent = 'Settings saved!';
        setTimeout(() => {
          statusElement.textContent = '';
        }, 3000);
      }
    );
  });
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({tabId: tab.id});
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Onyx Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentOnyxDomain") {
    chrome.storage.sync.get({ onyxDomain: 'http://localhost:3000/nrf' }, (result) => {
      sendResponse({ onyxDomain: result.onyxDomain });
    });
    return true; 
  }
});

chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
      var headers = details.responseHeaders;
      for (var i = 0; i < headers.length; i++) {
        if (headers[i].name.toLowerCase() === 'set-cookie') {
          headers[i].value = headers[i].value.replace('SameSite=Lax', 'SameSite=None; Secure');
        }
      }
      return {responseHeaders: headers};
    },
    {urls: ["http://localhost:3000/*"]},
    ["responseHeaders", "extraHeaders"]
  );
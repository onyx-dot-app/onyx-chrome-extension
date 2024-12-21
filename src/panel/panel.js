(function() {
  const iframe = document.getElementById('onyx-panel-iframe');

  function setIframeSrc(url, pageUrl) {
    console.log('Setting iframe src to:', url);
    iframe.src = url;
    sendWebsiteToIframe(pageUrl);
  }

  function sendWebsiteToIframe(pageUrl) {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: "PAGE_URL",
          url: pageUrl,
        },
        "*"
      );
      console.log('Sent PAGE_URL message to iframe:', pageUrl);
    } else {
      console.error('iframe.contentWindow not available');
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Panel received message:', request);
    if (request.action === "openOnyxWithInput") {
      setIframeSrc(request.url, request.pageUrl);
    } else if (request.action === "updatePageUrl") {
      sendWebsiteToIframe(request.pageUrl);
    }
  });

  console.log('Panel loaded');
  chrome.runtime.sendMessage({action: "getCurrentOnyxDomain"}, function(response) {
    if (response && response.onyxDomain) {
      console.log('Onyx domain:', response.onyxDomain);
      setIframeSrc(response.onyxDomain + '/chat', '');
    } else {
      console.log('No Onyx domain found');
      console.error('Failed to get Onyx domain');
      setIframeSrc('http://localhost:3000/chat', '');
    }
  });

  iframe.onerror = function() {
    console.error('Failed to load iframe');
  };
})();

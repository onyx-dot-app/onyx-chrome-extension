(function () {
  const iframe = document.getElementById("onyx-panel-iframe");
  const loadingScreen = document.getElementById("loading-screen");

  let currentUrl = "";
  let iframeLoadTimeout;

  function setIframeSrc(url, pageUrl) {
    console.log("Setting iframe src to:", url);
    if (iframe.src !== url) {
      iframe.src = url;
    }
    currentUrl = pageUrl;
    startIframeLoadTimeout(url);
  }

  function startIframeLoadTimeout(url) {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = setTimeout(() => {
      console.error("Timeout: No message received from Onyx application");
    }, 10000); // 10 seconds timeout
  }

  function sendWebsiteToIframe(pageUrl) {
    if (iframe.contentWindow && pageUrl !== currentUrl) {
      iframe.contentWindow.postMessage(
        {
          type: "PAGE_URL",
          url: pageUrl,
        },
        "*"
      );
      console.log("Sent PAGE_URL message to iframe:", pageUrl);
      currentUrl = pageUrl;
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Panel received message:", request);
    if (request.action === "openOnyxWithInput") {
      setIframeSrc(request.url, request.pageUrl);
    } else if (request.action === "updatePageUrl") {
      sendWebsiteToIframe(request.pageUrl);
    }
  });

  console.log("Panel loaded");
  chrome.runtime.sendMessage(
    { action: "getCurrentOnyxDomain" },
    function (response) {
      if (response && response.onyxDomain) {
        console.log("Onyx domain:", response.onyxDomain);
        setIframeSrc(response.onyxDomain + "/chat", "");
      } else {
        console.log("No Onyx domain found");
        console.error("Failed to get Onyx domain");
        setIframeSrc("http://localhost:3000/chat", "");
      }
    }
  );

  window.addEventListener("message", function (event) {
    console.log("Received message in panel.js:", event.data);
    if (event.data.type === "ONYX_APP_LOADED") {
      console.log("Onyx application loaded successfully");
      clearTimeout(iframeLoadTimeout);
      hideErrorModal();
      iframe.style.opacity = "1";
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);
    }
  });

  iframe.onload = function () {
    console.log("Iframe onload event fired");
    // We'll wait for the ONYX_APP_LOADED message instead of checking content here
  };

  iframe.onerror = function () {
    console.error("Failed to load iframe");
  };
})();

import { showErrorModal, hideErrorModal } from "../shared/error-modal.js";

(function () {
  const iframe = document.getElementById("onyx-panel-iframe");
  const loadingScreen = document.getElementById("loading-screen");

  let currentUrl = "";
  let iframeLoadTimeout;

  // Ensure loading screen is visible initially
  loadingScreen.style.display = "flex";
  loadingScreen.style.opacity = "1";
  iframe.style.opacity = "0";

  function setIframeSrc(url, pageUrl) {
    console.log("Setting iframe src to:", url);
    if (iframe.src !== url) {
      iframe.src = url;
    }
    currentUrl = pageUrl;
    startIframeLoadTimeout();
  }

  function startIframeLoadTimeout() {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = setTimeout(() => {
      console.error("Timeout: No message received from Onyx application");
      showErrorModal(iframe.src);
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
        setIframeSrc(response.onyxDomain + "/chat?defaultSidebarOff=true", "");
      } else {
        console.warn("Onyx domain not found, using default");
        setIframeSrc("http://localhost:3000/chat?defaultSidebarOff=true", "");
      }
    }
  );

  window.addEventListener("message", function (event) {
    console.log("Received message in panel.js:", event.data);
    if (event.data.type === "ONYX_APP_LOADED") {
      console.log("Onyx application loaded successfully");
      clearTimeout(iframeLoadTimeout);
      hideErrorModal();

      // Fade out loading screen and show iframe
      iframe.style.opacity = "1";
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 500);

      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: "PANEL_READY" }, "*");
      }
    }
  });

  iframe.onload = function () {
    console.log("Iframe onload event fired");
  };

  iframe.onerror = function (error) {
    console.error("Failed to load iframe:", error);
    showErrorModal(iframe.src);
  };
})();

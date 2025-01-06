import { showErrorModal, hideErrorModal } from "../utils/error-modal.js";

(function () {
  const iframe = document.getElementById("onyx-panel-iframe");
  const loadingScreen = document.getElementById("loading-screen");

  let currentUrl = "";
  let iframeLoadTimeout;

  function initializePanel() {
    loadingScreen.style.display = "flex";
    loadingScreen.style.opacity = "1";
    iframe.style.opacity = "0";
    loadOnyxDomain();
  }

  function setIframeSrc(url, pageUrl) {
    if (iframe.src !== url) {
      iframe.src = url;
    }
    currentUrl = pageUrl;
    startIframeLoadTimeout();
  }

  function startIframeLoadTimeout() {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = setTimeout(() => {
      showErrorModal(iframe.src);
    }, 10000);
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
      currentUrl = pageUrl;
    }
  }

  function handleMessage(event) {
    if (event.data.type === "ONYX_APP_LOADED") {
      clearTimeout(iframeLoadTimeout);
      hideErrorModal();
      showIframe();
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: "PANEL_READY" }, "*");
      }
    }
  }

  function showIframe() {
    iframe.style.opacity = "1";
    loadingScreen.style.opacity = "0";
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }

  function loadOnyxDomain() {
    chrome.runtime.sendMessage(
      { action: "getCurrentOnyxDomain" },
      function (response) {
        if (response && response.onyxDomain) {
          setIframeSrc(
            response.onyxDomain + "/chat?defaultSidebarOff=true",
            ""
          );
        } else {
          console.warn("Onyx domain not found, using default");
          setIframeSrc(
            "https://test.danswer.dev/chat?defaultSidebarOff=true",
            ""
          );
        }
      }
    );
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openOnyxWithInput") {
      setIframeSrc(request.url, request.pageUrl);
    } else if (request.action === "updatePageUrl") {
      sendWebsiteToIframe(request.pageUrl);
    }
  });

  window.addEventListener("message", handleMessage);

  iframe.onload = startIframeLoadTimeout;

  iframe.onerror = function (error) {
    showErrorModal(iframe.src);
  };

  initializePanel();
})();

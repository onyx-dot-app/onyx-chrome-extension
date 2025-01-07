import { showErrorModal } from "../utils/error-modal.js";
import { ACTIONS, CHROME_MESSAGE, WEB_MESSAGE } from "../utils/constants.js";
(function () {
  const iframe = document.getElementById("onyx-panel-iframe");
  const loadingScreen = document.getElementById("loading-screen");

  let currentUrl = "";
  let iframeLoaded = false;
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
  }

  function sendWebsiteToIframe(pageUrl) {
    if (iframe.contentWindow && pageUrl !== currentUrl) {
      iframe.contentWindow.postMessage(
        {
          type: WEB_MESSAGE.PAGE_CHANGE,
          url: pageUrl,
        },
        "*"
      );
      currentUrl = pageUrl;
    }
  }

  function startIframeLoadTimeout() {
    iframeLoadTimeout = setTimeout(() => {
      if (!iframeLoaded) {
        showErrorModal(iframe.src);
      }
    }, 2500);
  }

  function handleMessage(event) {
    if (event.data.type === CHROME_MESSAGE.ONYX_APP_LOADED) {
      clearTimeout(iframeLoadTimeout);
      iframeLoaded = true;
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

  async function loadOnyxDomain() {
    const response = await chrome.runtime.sendMessage({
      action: ACTIONS.GET_CURRENT_ONYX_DOMAIN,
    });
    if (response && response.onyxDomain) {
      setIframeSrc(response.onyxDomain + "?defaultSidebarOff=true", "");
    } else {
      console.warn("Onyx domain not found, using default");
      const domain = await getOnyxDomain();
      setIframeSrc(domain + "/chat?defaultSidebarOff=true", "");
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === ACTIONS.UPDATE_PAGE_URL) {
      sendWebsiteToIframe(request.pageUrl);
    }
  });

  window.addEventListener("message", handleMessage);

  iframe.onerror = function (error) {
    showErrorModal(iframe.src);
  };

  initializePanel();
  startIframeLoadTimeout();
})();

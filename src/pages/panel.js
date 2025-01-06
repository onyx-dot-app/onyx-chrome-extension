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
      action: "getCurrentOnyxDomain",
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
    if (request.action === "openOnyxWithInput") {
      setIframeSrc(request.url, request.pageUrl);
    } else if (request.action === "updatePageUrl") {
      sendWebsiteToIframe(request.pageUrl);
    }
  });

  window.addEventListener("message", handleMessage);

  iframe.onerror = function (error) {
    showErrorModal(iframe.src);
  };

  initializePanel();
})();

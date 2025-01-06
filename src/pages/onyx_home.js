import {
  showErrorModal,
  hideErrorModal,
  initErrorModal,
} from "../utils/error-modal.js";
import { getOnyxDomain } from "../utils/storage.js";

(function () {
  let mainIframe = document.getElementById("onyx-iframe");
  let preloadedIframe = null;
  const background = document.getElementById("background");
  const content = document.getElementById("content");
  const DEFAULT_LIGHT_BACKGROUND_IMAGE =
    "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const DEFAULT_DARK_BACKGROUND_IMAGE =
    "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  let iframeLoadTimeout;
  let iframeLoaded = false;

  initErrorModal();

  async function preloadChatInterface() {
    preloadedIframe = document.createElement("iframe");

    const domain = await getOnyxDomain();
    preloadedIframe.src = domain;
    console.log("setting to", domain);

    preloadedIframe.style.opacity = "0";
    preloadedIframe.style.visibility = "hidden";
    preloadedIframe.style.transition = "opacity 0.3s ease-in";
    preloadedIframe.style.border = "none";
    preloadedIframe.style.width = "100%";
    preloadedIframe.style.height = "100%";
    preloadedIframe.style.position = "absolute";
    preloadedIframe.style.top = "0";
    preloadedIframe.style.left = "0";
    preloadedIframe.style.zIndex = "1";
    content.appendChild(preloadedIframe);
  }

  function setIframeSrc(url) {
    mainIframe.src = url;
    startIframeLoadTimeout();
    iframeLoaded = false;
  }

  function startIframeLoadTimeout() {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = setTimeout(() => {
      if (!iframeLoaded) {
        try {
          if (
            mainIframe.contentWindow.location.pathname.includes("/auth/login")
          ) {
            showLoginPage();
          } else {
            showErrorModal(mainIframe.src);
          }
        } catch (error) {
          showErrorModal(mainIframe.src);
        }
      }
    }, 5000);
  }

  function showLoginPage() {
    background.style.opacity = "0";
    mainIframe.style.opacity = "1";
    mainIframe.style.visibility = "visible";
    content.style.opacity = "1";
    hideErrorModal();
  }

  function setTheme(theme, customBackgroundImage) {
    const imageUrl =
      customBackgroundImage ||
      (theme === "dark"
        ? DEFAULT_DARK_BACKGROUND_IMAGE
        : DEFAULT_LIGHT_BACKGROUND_IMAGE);
    background.style.backgroundImage = `url('${imageUrl}')`;
  }

  function fadeInContent() {
    content.style.transition = "opacity 0.5s ease-in";
    mainIframe.style.transition = "opacity 0.5s ease-in";
    content.style.opacity = "0";
    mainIframe.style.opacity = "0";
    mainIframe.style.visibility = "visible";

    requestAnimationFrame(() => {
      content.style.opacity = "1";
      mainIframe.style.opacity = "1";

      setTimeout(() => {
        background.style.transition = "opacity 0.3s ease-out";
        background.style.opacity = "0";
      }, 500);
    });
  }

  function checkOnyxPreference() {
    chrome.storage.local.get(
      ["useOnyxAsDefaultNewTab", "onyxDomain", "defaultNtpUrl"],
      (items) => {
        let useOnyxAsDefaultNewTab = items.useOnyxAsDefaultNewTab;

        if (useOnyxAsDefaultNewTab === undefined) {
          useOnyxAsDefaultNewTab = !!(
            localStorage.getItem("useOnyxAsDefaultNewTab") === "1"
          );
          chrome.storage.local.set({ useOnyxAsDefaultNewTab });
        }

        if (!useOnyxAsDefaultNewTab) {
          chrome.tabs.update({
            url: items.defaultNtpUrl || "chrome://new-tab-page",
          });
          return;
        }

        setIframeSrc(items.onyxDomain + "/nrf");
      }
    );
  }

  function loadThemeAndBackground() {
    chrome.storage.local.get(
      ["onyxTheme", "onyxBackgroundImage", "darkBgUrl", "lightBgUrl"],
      function (result) {
        const theme = result.onyxTheme || "light";
        const customBackgroundImage = result.onyxBackgroundImage;
        const darkBgUrl = result.darkBgUrl;
        const lightBgUrl = result.lightBgUrl;

        let backgroundImage;
        if (customBackgroundImage) {
          backgroundImage = customBackgroundImage;
        } else if (theme === "dark" && darkBgUrl) {
          backgroundImage = darkBgUrl;
        } else if (theme === "light" && lightBgUrl) {
          backgroundImage = lightBgUrl;
        }

        setTheme(theme, backgroundImage);
        checkOnyxPreference();
      }
    );
  }

  function loadNewPage(newSrc) {
    if (preloadedIframe && preloadedIframe.contentWindow) {
      preloadedIframe.contentWindow.postMessage(
        { type: "LOAD_NEW_PAGE", href: newSrc },
        "*"
      );
    } else {
      console.error("Preloaded iframe not available");
    }
  }

  function completePendingPageLoad() {
    if (preloadedIframe) {
      preloadedIframe.style.visibility = "visible";
      preloadedIframe.style.opacity = "1";
      preloadedIframe.style.zIndex = "1";
      mainIframe.style.zIndex = "2";
      mainIframe.style.opacity = "0";

      setTimeout(() => {
        if (content.contains(mainIframe)) {
          content.removeChild(mainIframe);
        }

        mainIframe = preloadedIframe;
        mainIframe.id = "onyx-iframe";
        mainIframe.style.zIndex = "";
        iframeLoaded = true;
        clearTimeout(iframeLoadTimeout);
      }, 200);
    } else {
      console.warn("No preloaded iframe available");
    }
  }

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local" && changes.useOnyxAsDefaultNewTab) {
      checkOnyxPreference();
    }
  });

  window.addEventListener("message", function (event) {
    if (event.data.type === "SET_DEFAULT_NEW_TAB") {
      chrome.storage.local.set({ useOnyxAsDefaultNewTab: event.data.value });
    } else if (event.data.type === "ONYX_APP_LOADED") {
      clearTimeout(iframeLoadTimeout);
      hideErrorModal();
      fadeInContent();
      iframeLoaded = true;
    } else if (event.data.type === "PREFERENCES_UPDATED") {
      const { theme, backgroundUrl } = event.data.payload;
      chrome.storage.local.set(
        {
          onyxTheme: theme,
          onyxBackgroundImage: backgroundUrl,
        },
        () => {}
      );
    } else if (event.data.type === "LOAD_NEW_PAGE") {
      loadNewPage(event.data.href);
    } else if (event.data.type === "LOAD_NEW_CHAT_PAGE") {
      completePendingPageLoad();
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateIframeSrc") {
      setIframeSrc(request.url);
    }
  });

  mainIframe.onload = function () {
    clearTimeout(iframeLoadTimeout);
    startIframeLoadTimeout();
  };

  mainIframe.onerror = function (error) {
    showErrorModal(mainIframe.src);
  };

  loadThemeAndBackground();
  preloadChatInterface();
})();

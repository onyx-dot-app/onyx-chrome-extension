import {
  showErrorModal,
  hideErrorModal,
  initErrorModal,
} from "../shared/error-modal.js";

(function () {
  const iframe = document.getElementById("onyx-iframe");
  const background = document.getElementById("background");
  const content = document.getElementById("content");
  const DEFAULT_LIGHT_BACKGROUND_IMAGE =
    "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const DEFAULT_DARK_BACKGROUND_IMAGE =
    "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  let iframeLoadTimeout;
  let iframeLoaded = false;

  initErrorModal();

  function setIframeSrc(url) {
    iframe.src = url;
    startIframeLoadTimeout();
    iframeLoaded = false;
  }

  function startIframeLoadTimeout() {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = setTimeout(() => {
      if (!iframeLoaded) {
        try {
          if (iframe.contentWindow.location.pathname.includes("/auth/login")) {
            showLoginPage();
          } else {
            showErrorModal(iframe.src);
          }
        } catch (error) {
          showErrorModal(iframe.src);
        }
      }
    }, 5000);
  }

  function showLoginPage() {
    background.style.opacity = "0";
    iframe.style.opacity = "1";
    iframe.style.visibility = "visible";
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
    iframe.style.transition = "opacity 0.5s ease-in";
    content.style.opacity = "0";
    iframe.style.opacity = "0";
    iframe.style.visibility = "visible";

    requestAnimationFrame(() => {
      content.style.opacity = "1";
      iframe.style.opacity = "1";

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

        const onyxDomain =
          items.onyxDomain + "/nrf" || "http://localhost:3000/nrf";
        setIframeSrc(onyxDomain);
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

  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local") {
      if (changes.onyxTheme || changes.onyxBackgroundImage) {
        loadThemeAndBackground();
      }
      if (changes.useOnyxAsDefaultNewTab) {
        checkOnyxPreference();
      }
    }
  });

  window.addEventListener("message", function (event) {
    if (event.data.type === "SET_DEFAULT_NEW_TAB") {
      chrome.storage.local.set(
        { useOnyxAsDefaultNewTab: event.data.value },
        function () {
          checkOnyxPreference();
        }
      );
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
        () => {
          console.log("Updated preferences in chrome.storage:", {
            theme,
            backgroundUrl,
          });
        }
      );
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateIframeSrc") {
      setIframeSrc(request.url);
    }
  });

  iframe.onload = function () {
    clearTimeout(iframeLoadTimeout);
    startIframeLoadTimeout();
  };

  iframe.onerror = function (error) {
    showErrorModal(iframe.src);
  };

  loadThemeAndBackground();
})();

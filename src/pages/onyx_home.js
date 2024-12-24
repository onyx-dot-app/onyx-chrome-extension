(function () {
  const iframe = document.getElementById("onyx-iframe");
  const background = document.getElementById("background");
  const content = document.getElementById("content");
  const errorModal = document.getElementById("error-modal");
  const attemptedUrlSpan = document.getElementById("attempted-url");
  const openOptionsLink = document.getElementById("open-options");
  const DEFAULT_LIGHT_BACKGROUND_IMAGE =
    "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const DEFAULT_DARK_BACKGROUND_IMAGE =
    "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  let iframeLoadTimeout;

  function setIframeSrc(url) {
    console.log("Setting iframe src to:", url);
    iframe.src = url;
    attemptedUrlSpan.textContent = url;
    startIframeLoadTimeout();
  }

  function startIframeLoadTimeout() {
    clearTimeout(iframeLoadTimeout);
    iframeLoadTimeout = setTimeout(() => {
      console.error("Timeout: No message received from Onyx application");
      showErrorModal();
    }, 10000); // 10 seconds timeout
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
    console.log("Fading in content");
    background.style.opacity = "0";
    content.style.opacity = "1";
    iframe.style.visibility = "visible";
  }

  function fadeOutAndRedirect(url) {
    console.log("Fading out and redirecting to:", url);
    background.style.opacity = "1";
    content.style.opacity = "0";
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  }

  function showErrorModal() {
    console.error("Showing error modal");
    errorModal.style.display = "flex";
    background.style.opacity = "1";
    content.style.opacity = "0";
  }

  function hideErrorModal() {
    console.log("Hiding error modal");
    errorModal.style.display = "none";
  }

  function checkOnyxPreference() {
    chrome.storage.local.get(
      ["useOnyxAsDefaultNewTab", "onyxDomain"],
      function (result) {
        console.log("useOnyxAsDefaultNewTab:", result.useOnyxAsDefaultNewTab);
        if (result.useOnyxAsDefaultNewTab) {
          const onyxDomain = result.onyxDomain || "http://localhost:3000";
          console.log("Setting iframe src to:", onyxDomain);
          setIframeSrc(onyxDomain);
        } else {
          console.log("Redirecting to default new tab");
          window.location.href = "chrome://newtab/";
        }
      }
    );
  }

  // Immediately check for cached theme and background image
  chrome.storage.local.get(
    ["onyxTheme", "onyxBackgroundImage"],
    function (result) {
      const theme = result.onyxTheme || "light";
      const customBackgroundImage = result.onyxBackgroundImage;
      if (theme !== "light" || customBackgroundImage) {
        setTheme(theme, customBackgroundImage);
      }
      checkOnyxPreference();
    }
  );

  // Listen for theme changes
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === "local") {
      if (changes.onyxTheme || changes.onyxBackgroundImage) {
        chrome.storage.local.get(
          ["onyxTheme", "onyxBackgroundImage"],
          function (result) {
            setTheme(result.onyxTheme || "light", result.onyxBackgroundImage);
          }
        );
      }
      if (changes.useOnyxAsDefaultNewTab) {
        checkOnyxPreference();
      }
    }
  });

  // Listen for messages from the iframe
  window.addEventListener("message", function (event) {
    console.log("Received message in onyx_home.js:", event.data);
    if (event.data.type === "SET_DEFAULT_NEW_TAB") {
      console.log("Updating useOnyxAsDefaultNewTab setting:", event.data.value);
      chrome.storage.local.set(
        { useOnyxAsDefaultNewTab: event.data.value },
        function () {
          console.log(
            "Use Onyx as default new tab setting updated:",
            event.data.value
          );
          checkOnyxPreference();
        }
      );
    } else if (event.data.type === "ONYX_APP_LOADED") {
      console.log("Onyx application loaded successfully");
      clearTimeout(iframeLoadTimeout);
      hideErrorModal();
      fadeInContent();
    }
  });

  // Listen for messages from the service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateIframeSrc") {
      console.log("Updating iframe src to:", request.url);
      setIframeSrc(request.url);
    }
  });

  iframe.onload = function () {
    console.log("Iframe onload event fired");
    // We'll wait for the ONYX_APP_LOADED message instead of checking content here
  };

  iframe.onerror = function () {
    console.error("Failed to load iframe");
    showErrorModal();
  };

  openOptionsLink.addEventListener("click", function (e) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
})();

import {
  CHROME_SPECIFIC_STORAGE_KEYS,
  DEFAULT_ONYX_DOMAIN,
} from "../utils/constants.js";

document.addEventListener("DOMContentLoaded", function () {
  const domainInput = document.getElementById("onyxDomain");
  const useOnyxAsDefaultToggle = document.getElementById("useOnyxAsDefault");
  const saveButton = document.getElementById("save");
  const statusContainer = document.getElementById("statusContainer");
  const statusElement = document.getElementById("status");
  const shortcutKeySpan = document.getElementById("shortcut-key");
  const newTabButton = document.getElementById("newTab");

  function setShortcutKey() {
    if (shortcutKeySpan) {
      shortcutKeySpan.textContent =
        navigator.platform.indexOf("Mac") === 0 ? "⌘+Shift+O" : "Ctrl+Shift+O";
    }
  }

  function loadStoredValues() {
    chrome.storage.local.get(
      {
        [CHROME_SPECIFIC_STORAGE_KEYS.ONYX_DOMAIN]: DEFAULT_ONYX_DOMAIN,
        [CHROME_SPECIFIC_STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]: false,
      },
      (result) => {
        if (domainInput)
          domainInput.value = result[CHROME_SPECIFIC_STORAGE_KEYS.ONYX_DOMAIN];
        if (useOnyxAsDefaultToggle)
          useOnyxAsDefaultToggle.checked =
            result[CHROME_SPECIFIC_STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB];
      }
    );
  }

  function saveSettings() {
    const domain = domainInput.value.trim();
    const useOnyxAsDefault = useOnyxAsDefaultToggle
      ? useOnyxAsDefaultToggle.checked
      : false;
    chrome.storage.local.set(
      {
        [CHROME_SPECIFIC_STORAGE_KEYS.ONYX_DOMAIN]: domain,
        [CHROME_SPECIFIC_STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]:
          useOnyxAsDefault,
      },
      showStatusMessage
    );
  }

  function showStatusMessage() {
    if (statusElement) {
      const useOnyxAsDefault = useOnyxAsDefaultToggle
        ? useOnyxAsDefaultToggle.checked
        : false;
      if (useOnyxAsDefault) {
        statusElement.textContent =
          "Settings updated. Open a new tab to test it out. Click on the extension icon to bring up Onyx from any page.";
        if (newTabButton) newTabButton.style.display = "block";
      } else {
        statusElement.textContent = "Settings updated.";
        if (newTabButton) newTabButton.style.display = "none";
      }
      statusElement.style.color = "black";
    }
    if (statusContainer) {
      statusContainer.style.display = "block";
      statusContainer.style.opacity = "1";
    }
    if (statusElement) statusElement.style.opacity = "1";
    if (newTabButton) newTabButton.style.opacity = "1";

    setTimeout(hideStatusMessage, 5000);
  }

  function hideStatusMessage() {
    if (statusContainer) statusContainer.style.opacity = "0";
    if (statusElement) statusElement.style.opacity = "0";
    if (newTabButton) newTabButton.style.opacity = "0";
    setTimeout(() => {
      if (statusContainer) statusContainer.style.display = "none";
    }, 500);
  }

  function openNewTab() {
    chrome.tabs.create({});
  }

  setShortcutKey();
  loadStoredValues();

  if (saveButton) {
    saveButton.addEventListener("click", saveSettings);
  }

  if (newTabButton) {
    newTabButton.addEventListener("click", openNewTab);
  }
});

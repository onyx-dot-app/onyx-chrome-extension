import {
  CHROME_SPECIFIC_STORAGE_KEYS,
} from "../utils/constants.js";

document.addEventListener("DOMContentLoaded", async function () {
  const defaultNewTabToggle = document.getElementById("defaultNewTabToggle");
  const openSidePanelButton = document.getElementById("openSidePanel");
  const openOptionsButton = document.getElementById("openOptions");

  // Load current setting
  async function loadSetting() {
    const result = await chrome.storage.local.get({
      [CHROME_SPECIFIC_STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]: false,
    });
    if (defaultNewTabToggle) {
      defaultNewTabToggle.checked =
        result[CHROME_SPECIFIC_STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB];
    }
  }

  // Toggle the setting
  async function toggleSetting() {
    const currentValue = defaultNewTabToggle.checked;
    await chrome.storage.local.set({
      [CHROME_SPECIFIC_STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]: currentValue,
    });
  }

  // Open side panel
  async function openSidePanel() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && chrome.sidePanel) {
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    } catch (error) {
      console.error("Error opening side panel:", error);
    }
  }

  // Open options page
  function openOptions() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  // Initialize
  await loadSetting();

  // Event listeners
  if (defaultNewTabToggle) {
    defaultNewTabToggle.addEventListener("change", toggleSetting);
  }

  if (openSidePanelButton) {
    openSidePanelButton.addEventListener("click", openSidePanel);
  }

  if (openOptionsButton) {
    openOptionsButton.addEventListener("click", openOptions);
  }
});


import {
  DEFAULT_ONYX_DOMAIN,
  CONTEXT_MENU_ID,
  CONTEXT_MENU_TITLE,
  STORAGE_KEYS,
  COMMANDS,
  ACTIONS,
} from "./src/shared/constants.js";

const logger = {
  log: (message, ...args) =>
    console.log(`[Onyx Extension] ${message}`, ...args),
  error: (message, ...args) =>
    console.error(`[Onyx Extension] Error: ${message}`, ...args),
  warn: (message, ...args) =>
    console.warn(`[Onyx Extension] Warning: ${message}`, ...args),
};

logger.log("Service worker loaded");

async function setupSidePanel() {
  if (chrome.sidePanel) {
    logger.log("Side panel API is available");
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      logger.log("Side panel behavior set successfully");
    } catch (error) {
      logger.error("Error setting side panel behavior:", error);
    }
  } else {
    logger.warn("Side panel not supported");
  }
}

async function openSidePanel(tabId) {
  try {
    await chrome.sidePanel.open({ tabId });
    logger.log("Side panel opened successfully");
  } catch (error) {
    logger.error("Error opening side panel:", error);
  }
}

async function sendToOnyx(info, tab) {
  logger.log("sendToOnyx function called", { info, tab });
  const selectedText = encodeURIComponent(info.selectionText);
  const currentUrl = encodeURIComponent(tab.url);

  try {
    const result = await chrome.storage.local.get({
      [STORAGE_KEYS.ONYX_DOMAIN]: DEFAULT_ONYX_DOMAIN,
    });
    const url = `${
      result[STORAGE_KEYS.ONYX_DOMAIN]
    }/chat?input=${selectedText}&url=${currentUrl}`;
    logger.log("Attempting to open side panel with URL:", url);

    await openSidePanel(tab.id);
    chrome.runtime.sendMessage({
      action: ACTIONS.OPEN_ONYX_WITH_INPUT,
      url: url,
      pageUrl: tab.url,
    });
  } catch (error) {
    logger.error("Error in sendToOnyx:", error);
  }
}

async function setupContextMenu() {
  if (chrome.contextMenus) {
    try {
      await chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: CONTEXT_MENU_TITLE,
        contexts: ["selection"],
      });
      logger.log("Context menu created successfully");
    } catch (error) {
      logger.error("Error creating context menu:", error);
    }
  } else {
    logger.warn("Context menus not supported");
  }
}

async function toggleNewTabOverride() {
  try {
    const result = await chrome.storage.local.get(
      STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB
    );
    const newValue = !result[STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB];
    await chrome.storage.local.set({
      [STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]: newValue,
    });
    logger.log(`Onyx New Tab Override ${newValue ? "enabled" : "disabled"}`);

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Onyx New Tab",
      message: `New Tab Override ${newValue ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    logger.error("Error toggling new tab override:", error);
  }
}

chrome.runtime.onInstalled.addListener(setupContextMenu);

chrome.action.onClicked.addListener((tab) => {
  logger.log("Extension icon clicked, attempting to open side panel");
  openSidePanel(tab.id);
});

if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_ID) {
      sendToOnyx(info, tab);
    }
  });
}

chrome.commands.onCommand.addListener(async (command) => {
  if (command === COMMANDS.SEND_TO_ONYX) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tab) {
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: ACTIONS.GET_SELECTED_TEXT,
        });
        const selectedText = response?.selectedText || "";
        sendToOnyx({ selectionText: selectedText }, tab);
      }
    } catch (error) {
      logger.error("Error handling send-to-onyx command:", error);
    }
  } else if (command === COMMANDS.TOGGLE_NEW_TAB_OVERRIDE) {
    toggleNewTabOverride();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === ACTIONS.GET_CURRENT_ONYX_DOMAIN) {
    chrome.storage.local.get(
      { [STORAGE_KEYS.ONYX_DOMAIN]: DEFAULT_ONYX_DOMAIN },
      (result) => {
        sendResponse({ onyxDomain: result[STORAGE_KEYS.ONYX_DOMAIN] });
      }
    );
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  logger.log("Storage changed:", changes, "in namespace:", namespace);
  if (
    namespace === "local" &&
    changes[STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]
  ) {
    const newValue = changes[STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB].newValue;
    logger.log(
      `${STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB} changed:`,
      newValue
    );

    if (newValue === false) {
      chrome.runtime.openOptionsPage(() => {
        logger.log("Attempted to reopen options page");
      });
    }
  }
});

setupSidePanel();

import {
  DEFAULT_ONYX_DOMAIN,
  CONTEXT_MENU_ID,
  CONTEXT_MENU_TITLE,
  STORAGE_KEYS,
  COMMANDS,
  ACTIONS,
} from "./src/utils/constants.js";

async function setupSidePanel() {
  if (chrome.sidePanel) {
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    } catch (error) {
      console.error("Error setting up side panel:", error);
    }
  }
}

async function openSidePanel(tabId) {
  try {
    await chrome.sidePanel.open({ tabId });
  } catch (error) {
    console.error("Error opening side panel:", error);
  }
}

async function sendToOnyx(info, tab) {
  const selectedText = encodeURIComponent(info.selectionText);
  const currentUrl = encodeURIComponent(tab.url);

  try {
    const result = await chrome.storage.local.get({
      [STORAGE_KEYS.ONYX_DOMAIN]: DEFAULT_ONYX_DOMAIN,
    });
    const url = `${
      result[STORAGE_KEYS.ONYX_DOMAIN]
    }/chat?input=${selectedText}&url=${currentUrl}`;

    await openSidePanel(tab.id);
    chrome.runtime.sendMessage({
      action: ACTIONS.OPEN_ONYX_WITH_INPUT,
      url: url,
      pageUrl: tab.url,
    });
  } catch (error) {
    console.error("Error sending to Onyx:", error);
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
    } catch (error) {
      console.error("Error setting up context menu:", error);
    }
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

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Onyx New Tab",
      message: `New Tab Override ${newValue ? "enabled" : "disabled"}`,
    });

    // Send a message to inform all tabs about the change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: "newTabOverrideToggled",
          value: newValue,
        });
      });
    });
  } catch (error) {
    console.error("Error toggling new tab override:", error);
  }
}

chrome.runtime.onInstalled.addListener(setupContextMenu);

chrome.action.onClicked.addListener((tab) => {
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
      console.error("Error sending to Onyx:", error);
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
  if (
    namespace === "local" &&
    changes[STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB]
  ) {
    const newValue = changes[STORAGE_KEYS.USE_ONYX_AS_DEFAULT_NEW_TAB].newValue;

    if (newValue === false) {
      chrome.runtime.openOptionsPage();
    }
  }
});

setupSidePanel();

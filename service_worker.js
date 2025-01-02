console.log("Service worker loaded");

if (chrome.sidePanel) {
  console.log("Side panel API is available");
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .then(() => console.log("Side panel behavior set successfully"))
    .catch((error) =>
      console.error("Error setting side panel behavior:", error)
    );
} else {
  console.warn("Side panel not supported");
}

chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked, attempting to open side panel");
  chrome.sidePanel
    .open({ tabId: tab.id })
    .then(() => console.log("Side panel opened successfully"))
    .catch((error) => console.error("Error opening side panel:", error));
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Onyx Extension installed or updated");
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: "sendToOnyx",
      title: "Send to Onyx",
      contexts: ["selection"],
    });
  } else {
    console.warn("Context menus not supported");
  }
});

function sendToOnyx(info, tab) {
  console.log("sendToOnyx function called", { info, tab });
  const selectedText = encodeURIComponent(info.selectionText);
  const currentUrl = encodeURIComponent(tab.url);
  chrome.storage.local.get(
    { onyxDomain: "http://localhost:3000" },
    (result) => {
      const url = `${result.onyxDomain}/chat?input=${selectedText}&url=${currentUrl}`;
      console.log("Attempting to open side panel with URL:", url);
      chrome.sidePanel
        .open({ tabId: tab.id })
        .then(() => {
          console.log("Side panel opened successfully, sending message");
          chrome.runtime.sendMessage({
            action: "openOnyxWithInput",
            url: url,
            pageUrl: tab.url,
          });
        })
        .catch((error) => console.error("Error opening side panel:", error));
    }
  );
}

if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "sendToOnyx") {
      sendToOnyx(info, tab);
    }
  });
} else {
  console.warn("Context menus not supported");
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "send-to-onyx") {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, ([tab]) => {
      if (tab) {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "getSelectedText" },
          (response) => {
            if (response && response.selectedText) {
              sendToOnyx({ selectionText: response.selectedText }, tab);
            } else {
              sendToOnyx({ selectionText: "" }, tab);
            }
          }
        );
      }
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-new-tab-override") {
    chrome.storage.local.get("useOnyxAsDefaultNewTab", (result) => {
      const newValue = !result.useOnyxAsDefaultNewTab;
      chrome.storage.local.set({ useOnyxAsDefaultNewTab: newValue }, () => {
        console.log(
          `Onyx New Tab Override ${newValue ? "enabled" : "disabled"}`
        );
        // Optionally, show a notification to the user
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Onyx New Tab",
          message: `New Tab Override ${newValue ? "enabled" : "disabled"}`,
        });
      });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCurrentOnyxDomain") {
    chrome.storage.local.get(
      { onyxDomain: "http://localhost:3000" },
      (result) => {
        sendResponse({ onyxDomain: result.onyxDomain });
      }
    );
    return true;
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("Storage changed:", changes, "in namespace:", namespace);
  if (namespace === "local" && changes.useOnyxAsDefaultNewTab) {
    const newValue = changes.useOnyxAsDefaultNewTab.newValue;
    console.log("useOnyxAsDefaultNewTab changed:", newValue);

    // Reopen the options page only if the new value is false
    if (newValue === false) {
      chrome.runtime.openOptionsPage(() => {
        console.log("Attempted to reopen options page");
      });
    }
  }
});

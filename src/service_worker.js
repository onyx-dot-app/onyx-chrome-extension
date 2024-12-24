chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ useOnyxAsDefaultNewTab: false }, (result) => {
    updateNewTabBehavior(result.useOnyxAsDefaultNewTab);
  });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.useOnyxAsDefaultNewTab) {
    updateNewTabBehavior(changes.useOnyxAsDefaultNewTab.newValue);
  }
});

function updateNewTabBehavior(useOnyxAsDefault) {
  if (useOnyxAsDefault) {
    chrome.tabs.onCreated.addListener(handleNewTab);
  } else {
    chrome.tabs.onCreated.removeListener(handleNewTab);
  }
}

function handleNewTab(tab) {
  if (tab.pendingUrl === "chrome://newtab/" || tab.url === "chrome://newtab/") {
    chrome.storage.local.get(
      { onyxDomain: "http://localhost:3000" },
      (result) => {
        chrome.tabs.update(tab.id, { url: `${result.onyxDomain}/nrf` });
      }
    );
  }
}

// Existing code for side panel, context menu, etc.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Onyx Extension installed");
  chrome.contextMenus.create({
    id: "sendToOnyx",
    title: "Send to Onyx",
    contexts: ["selection"],
  });
});

function sendToOnyx(info, tab) {
  const selectedText = encodeURIComponent(info.selectionText);
  const currentUrl = encodeURIComponent(tab.url);
  chrome.storage.local.get(
    { onyxDomain: "http://localhost:3000" },
    (result) => {
      const url = `${result.onyxDomain}/chat?input=${selectedText}&url=${currentUrl}`;
      chrome.sidePanel.open({ tabId: tab.id }).then(() => {
        chrome.runtime.sendMessage({
          action: "openOnyxWithInput",
          url: url,
          pageUrl: tab.url,
        });
      });
    }
  );
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToOnyx") {
    sendToOnyx(info, tab);
  }
});

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

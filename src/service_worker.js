chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({tabId: tab.id});
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Onyx Extension installed');
  chrome.contextMenus.create({
    id: "sendToOnyx",
    title: "Send to Onyx",
    contexts: ["selection"]
  });
});

function sendToOnyx(info, tab) {
  const selectedText = encodeURIComponent(info.selectionText);
  const currentUrl = encodeURIComponent(tab.url);
  chrome.storage.sync.get({ onyxDomain: 'http://localhost:3000' }, (result) => {
    const url = `${result.onyxDomain}/chat?input=${selectedText}&url=${currentUrl}`;
    chrome.sidePanel.open({tabId: tab.id}).then(() => {
      chrome.runtime.sendMessage({
        action: "openOnyxWithInput", 
        url: url,
        pageUrl: tab.url
      });
    });
    console.log("sendToOnyx called with url:", url);
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToOnyx") {
    sendToOnyx(info, tab);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "send-to-onyx") {
    console.log("send-to-onyx command received");
    chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
      if (tab) {
        chrome.tabs.sendMessage(tab.id, {action: "getSelectedText"}, (response) => {
          if (response && response.selectedText) {
            console.log("Selected text received");
            sendToOnyx({selectionText: response.selectedText}, tab);
          } else {
            console.log("No selected text found");
            sendToOnyx({selectionText: ""}, tab);
          }
        });
      } else {
        console.error("No active tab found");
      }
    });
  }
});

function sendPageUrlMessage() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, ([tab]) => {
    if (tab) {
      console.log("Sending updatePageUrl message with URL:", tab.url);
      chrome.runtime.sendMessage({
        action: "updatePageUrl",
        pageUrl: tab.url
      });
    } else {
      console.error("No active tab found");
    }
  });
}

chrome.tabs.onActivated.addListener(() => {
  console.log("onActivated called");
  sendPageUrlMessage();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    console.log("onUpdated called");
    sendPageUrlMessage();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  if (request.action === "getCurrentOnyxDomain") {
    chrome.storage.sync.get({ onyxDomain: 'http://localhost:3000' }, (result) => {
      console.log('Sending Onyx domain:', result.onyxDomain);
      sendResponse({ onyxDomain: result.onyxDomain });
    });
    return true; // Indicates that the response is asynchronous
  }
});
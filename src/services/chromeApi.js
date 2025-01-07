// chromeApi.js

export const openOptionsPage = () => {
  return new Promise((resolve) => {
    chrome.runtime.openOptionsPage(resolve);
  });
};

export const updateTab = (updateProperties) => {
  return new Promise((resolve) => {
    chrome.tabs.update(updateProperties, resolve);
  });
};

export const createTab = (createProperties) => {
  return new Promise((resolve) => {
    chrome.tabs.create(createProperties, resolve);
  });
};

export const sendMessage = (message) => {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
};

export const onMessage = (callback) => {
  chrome.runtime.onMessage.addListener(callback);
};

// Add more Chrome API functions as needed

const storage = chrome.storage.local;

export const getStorageItem = (key) => {
  return new Promise((resolve) => {
    storage.get(key, (result) => {
      resolve(result[key]);
    });
  });
};

export const setStorageItem = (key, value) => {
  return new Promise((resolve) => {
    storage.set({ [key]: value }, resolve);
  });
};

export const removeStorageItem = (key) => {
  return new Promise((resolve) => {
    storage.remove(key, resolve);
  });
};

export const clearStorage = () => {
  return new Promise((resolve) => {
    storage.clear(resolve);
  });
};

// Specific storage functions
export const setUseOnyxAsDefaultNewTab = (value) => {
  return setStorageItem("useOnyxAsDefaultNewTab", value);
};

export const getUseOnyxAsDefaultNewTab = () => {
  return getStorageItem("useOnyxAsDefaultNewTab");
};

// Add more specific storage functions as needed

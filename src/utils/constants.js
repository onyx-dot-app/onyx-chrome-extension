export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

export const DEFAULT_ONYX_DOMAIN = "https://cloud.onyx.app";

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_NEW_TAB_OVERRIDE: "Ctrl+Shift+O",
  OPEN_SIDE_PANEL: "Ctrl+Shift+P",
};

// Actions to send to the service worker
export const ACTIONS = {
  GET_SELECTED_TEXT: "getSelectedText",
  GET_CURRENT_ONYX_DOMAIN: "getCurrentOnyxDomain",
  UPDATE_PAGE_URL: "updatePageUrl",
  SEND_TO_ONYX: "sendToOnyx",
  CLOSE_SIDE_PANEL: "closeSidePanel",
};

// Chrome-extension specific storage keys
export const CHROME_SPECIFIC_STORAGE_KEYS = {
  USE_ONYX_AS_DEFAULT_NEW_TAB: "onyxExtensionDefaultNewTab",
  THEME: "onyxExtensionTheme",
  BACKGROUND_IMAGE: "onyxExtensionBackgroundImage",
  DARK_BG_URL: "onyxExtensionDarkBgUrl",
  LIGHT_BG_URL: "onyxExtensionLightBgUrl",
};

// Messages sent from the iframe to the extension
export const CHROME_MESSAGE = {
  PREFERENCES_UPDATED: "PREFERENCES_UPDATED",
  ONYX_APP_LOADED: "ONYX_APP_LOADED",
  SET_DEFAULT_NEW_TAB: "SET_DEFAULT_NEW_TAB",
  LOAD_NEW_CHAT_PAGE: "LOAD_NEW_CHAT_PAGE",
  LOAD_NEW_PAGE: "LOAD_NEW_PAGE",
  AUTH_REQUIRED: "AUTH_REQUIRED",
};

// Messages to send to the iframe
export const WEB_MESSAGE = {
  PAGE_CHANGE: "PAGE_CHANGE",
};

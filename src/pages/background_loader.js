document.addEventListener("DOMContentLoaded", () => {
  // Fetch user settings for the theme and background URLs
  chrome.storage.local.get(
    ["onyxTheme", "darkBgUrl", "lightBgUrl"],
    (items) => {
      const { onyxTheme, darkBgUrl, lightBgUrl } = items;

      // Decide which background to use based on the stored theme
      if (onyxTheme === "dark" && darkBgUrl) {
        document.getElementById(
          "background"
        ).style.backgroundImage = `url("${darkBgUrl}")`;
      } else if (onyxTheme === "light" && lightBgUrl) {
        document.getElementById(
          "background"
        ).style.backgroundImage = `url("${lightBgUrl}")`;
      }
    }
  );
});

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    ["onyxTheme", "darkBgUrl", "lightBgUrl"],
    (items) => {
      const { onyxTheme, darkBgUrl, lightBgUrl } = items;

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

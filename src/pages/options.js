document.addEventListener("DOMContentLoaded", function () {
  const domainInput = document.getElementById("onyxDomain");
  const useOnyxAsDefaultToggle = document.getElementById("useOnyxAsDefault");
  const saveButton = document.getElementById("save");
  const statusContainer = document.getElementById("statusContainer");
  const statusElement = document.getElementById("status");
  const shortcutKeySpan = document.getElementById("shortcut-key");
  const newTabButton = document.getElementById("newTab");

  // Log which elements are null
  console.log("Element check:", {
    domainInput: !!domainInput,
    useOnyxAsDefaultToggle: !!useOnyxAsDefaultToggle,
    saveButton: !!saveButton,
    statusContainer: !!statusContainer,
    statusElement: !!statusElement,
    shortcutKeySpan: !!shortcutKeySpan,
    newTabButton: !!newTabButton,
  });

  // Set the correct shortcut key based on the user's operating system
  if (shortcutKeySpan) {
    shortcutKeySpan.textContent =
      navigator.platform.indexOf("Mac") === 0 ? "⌘+Shift+O" : "Ctrl+Shift+O";
  }

  // Load existing values from storage
  chrome.storage.local.get(
    { onyxDomain: "http://localhost:3000/nrf", useOnyxAsDefaultNewTab: false },
    (result) => {
      if (domainInput) domainInput.value = result.onyxDomain;
      if (useOnyxAsDefaultToggle)
        useOnyxAsDefaultToggle.checked = result.useOnyxAsDefaultNewTab;
    }
  );

  if (saveButton) {
    saveButton.addEventListener("click", () => {
      const domain = domainInput ? domainInput.value.trim() : "";
      const useOnyxAsDefault = useOnyxAsDefaultToggle
        ? useOnyxAsDefaultToggle.checked
        : false;
      chrome.storage.local.set(
        {
          onyxDomain: domain || "http://localhost:3000/nrf",
          useOnyxAsDefaultNewTab: useOnyxAsDefault,
        },
        () => {
          console.log("Settings saved, updating UI");
          if (statusElement) {
            if (useOnyxAsDefault) {
              statusElement.style.marginTop = "-10px";
              statusElement.textContent =
                "Settings updated. Open a new tab to test it out. Click on the extension icon to bring up Onyx from any page.";
              if (newTabButton) newTabButton.style.display = "block";
            } else {
              statusElement.textContent = "Settings updated.";
              if (newTabButton) newTabButton.style.display = "none";
            }
          }
          statusElement.style.color = "black";
          if (statusContainer) {
            statusContainer.style.display = "block";
            statusContainer.style.opacity = "1";
          }
          if (statusElement) statusElement.style.opacity = "1";
          if (newTabButton) newTabButton.style.opacity = "1";
          console.log(
            "Status message:",
            statusElement ? statusElement.textContent : "N/A"
          );
          console.log(
            "New Tab button display:",
            newTabButton ? newTabButton.style.display : "N/A"
          );

          setTimeout(() => {
            console.log("Starting fade out");
            if (statusContainer) statusContainer.style.opacity = "0";
            if (statusElement) statusElement.style.opacity = "0";
            if (newTabButton) newTabButton.style.opacity = "0";
            setTimeout(() => {
              if (statusContainer) statusContainer.style.display = "none";
              console.log("Status container hidden");
            }, 500);
          }, 5000);
        }
      );
    });
  }

  if (newTabButton) {
    newTabButton.addEventListener("click", () => {
      chrome.tabs.create({});
    });
  }

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    body {
      font-family: Arial, sans-serif;
      background-color: #f1f3f4;
      margin: 0;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      background-color: #fff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      width: 90%;
    }
    .card {
      background-color: #fff;
      color: #333;
      padding: 20px;
      border-radius: 10px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .option-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: #666;
      font-weight: 400;
      font-size: 16px;
    }
    input[type="text"] {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      background-color: #fff;
      color: #333;
    }
    .toggle-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
    }
    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 24px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #4285f4;
    }
    input:checked + .slider:before {
      transform: translateX(26px);
    }
    .button {
      width: 100%;
      padding: 10px 20px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
      transition: background-color 0.3s;
      margin-bottom: 10px;
    }
    .button.primary {
      background-color: #4285f4;
      color: #fff;
    }
    .button.primary:hover {
      background-color: #3367d6;
    }
    .button.secondary {
      background-color: #f1f3f4;
      color: #3c4043;
      margin-top: 10px;
    }
    .button.secondary:hover {
      background-color: #e8eaed;
    }
    .margin-negative {
      margin-top: -16px;
    }
    .status-message {
      margin: 10px 0;
      color: #4caf50;
      font-weight: bold;
      text-align: center;
      font-size: 16px;
      transition: opacity 0.5s ease-in-out;
    }
    .shortcut-info {
      margin-top: 15px;
      font-size: 14px;
      color: #666;
      text-align: center;
      font-weight: 400;
    }
    kbd {
      background-color: #f1f3f4;
      border: 1px solid #ccc;
      border-radius: 3px;
      padding: 2px 5px;
      font-family: monospace;
      font-weight: 500;
      color: #333;
    }
    #statusContainer {
      margin-top: 10px;
      transition: opacity 0.5s ease-in-out;
    }
    #newTab {
      transition: opacity 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);

  console.log("Options page loaded");
});

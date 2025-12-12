(function () {
  console.log("[Onyx] Selection icon content script loaded");
  
  let selectionIcon = null;
  let currentSelectedText = "";

  function createSelectionIcon() {
    if (selectionIcon) return;

    console.log("[Onyx] Creating selection icon element");
    selectionIcon = document.createElement("div");
    selectionIcon.id = "onyx-selection-icon";

    const img = document.createElement("img");
    img.src = chrome.runtime.getURL("public/icon32.png");
    img.alt = "Search with Onyx";

    selectionIcon.appendChild(img);
    document.body.appendChild(selectionIcon);

    // Use mousedown instead of click to capture before selection clears
    selectionIcon.addEventListener("mousedown", handleIconClick);
  }

  function showIcon(text) {
    if (!selectionIcon) {
      createSelectionIcon();
    }

    currentSelectedText = text;

    // Get the bounding rectangle of the selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const iconSize = 32;
    const offset = 4;

    // Position at the bottom-right corner of the selection
    let posX = rect.right + offset;
    let posY = rect.bottom + offset;

    // Adjust if icon would go off-screen to the right
    if (posX + iconSize > window.innerWidth) {
      posX = rect.left - iconSize - offset;
    }
    // Adjust if icon would go off-screen at the bottom
    if (posY + iconSize > window.innerHeight) {
      posY = rect.top - iconSize - offset;
    }

    // Ensure icon stays within viewport bounds
    posX = Math.max(offset, Math.min(posX, window.innerWidth - iconSize - offset));
    posY = Math.max(offset, Math.min(posY, window.innerHeight - iconSize - offset));

    selectionIcon.style.left = `${posX}px`;
    selectionIcon.style.top = `${posY}px`;
    selectionIcon.classList.add("visible");
    console.log("[Onyx] Icon shown at", posX, posY, "with text:", text.substring(0, 50));
  }

  function hideIcon() {
    if (selectionIcon) {
      selectionIcon.classList.remove("visible");
    }
    currentSelectedText = "";
  }

  function handleIconClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const textToSend = currentSelectedText;
    console.log("[Onyx] Icon clicked, text:", textToSend);

    if (textToSend) {
      console.log("[Onyx] Sending message to service worker");
      chrome.runtime.sendMessage({
        action: "open-side-panel-with-text",
        selectedText: textToSend,
        pageUrl: window.location.href,
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("[Onyx] Error sending message:", chrome.runtime.lastError.message);
        } else {
          console.log("[Onyx] Message sent successfully", response);
        }
      });
    }

    hideIcon();
  }

  // Handle text selection
  document.addEventListener("mouseup", (e) => {
    // Ignore clicks on the icon itself
    if (e.target.id === "onyx-selection-icon" || e.target.closest("#onyx-selection-icon")) {
      return;
    }

    // Small delay to ensure selection is complete
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selectedText.length > 0) {
        showIcon(selectedText);
      } else {
        hideIcon();
      }
    }, 10);
  });

  // Hide icon when clicking elsewhere (not on the icon)
  document.addEventListener("mousedown", (e) => {
    if (e.target.id !== "onyx-selection-icon" && !e.target.closest("#onyx-selection-icon")) {
      // Check if there's still a selection
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (!selectedText) {
        hideIcon();
      }
    }
  });

  // Hide icon on scroll
  document.addEventListener("scroll", () => {
    hideIcon();
  }, true);

  // Hide icon when selection changes to empty
  document.addEventListener("selectionchange", () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (!selectedText) {
      hideIcon();
    }
  });

  // Create the icon element on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createSelectionIcon);
  } else {
    createSelectionIcon();
  }
})();

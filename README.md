# Onyx Chrome Extension

This is a minimal Chrome extension for Onyx (formerly Danswer) that provides a default home screen and basic interactions with the Onyx platform.

## Features

- Embedded iframe to Onyx chat (default: http://localhost:3000/nrf)
- Configurable domain for local or remote instances
- Hotkey to open a right panel for quick access

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the `onyx-extension` folder.

## Usage

- Click the extension icon in the Chrome toolbar to open the Onyx home page.
- Use `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the Onyx panel.
- Access the options page to configure the Onyx domain:
  1. Right-click the extension icon
  2. Select "Options"
  3. Enter your desired Onyx domain (e.g., http://localhost:3000/nrf)
  4. Click "Save"

## Development

To make changes to the extension:

1. Modify the relevant files in the `src` directory.
2. If you make changes, go to `chrome://extensions/` and click the refresh icon for the Onyx extension.

## File Structure

- `manifest.json`: Extension configuration
- `src/pages/onyx_home.html` & `onyx_home.js`: Main extension popup
- `src/pages/options.html` & `options.js`: Options page for domain configuration
- `src/panel/panel.html` & `panel.js`: Side panel UI
- `src/service_worker.js`: Background script for handling commands

## Contributing

Feel free to submit issues or pull requests for any bugs or improvements.

## License

[Add your chosen license here]

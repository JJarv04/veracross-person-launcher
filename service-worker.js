/*
  File:         service-worker.js
  Author:       JJA
  Description:  Listens for the keyboard command (Alt+V) defined in manifest.json and opens (or focuses) a popup window showing popup.html.
  Date:         19/11/2025
*/

try {
  chrome.commands.onCommand.addListener((command) => {
    if (command !== 'finder-quick-launch') return;
    chrome.action.openPopup();
  });
} catch (e) {
  // Often fails silently when already open or in settings pages etc; ignore.
}
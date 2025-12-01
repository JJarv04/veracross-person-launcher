# Veracross Person Launcher (Axiom)

This small extension allows you to quickly open a person record in Axiom simply by entering the Veracross Person ID.
![Popup Screenshot](icons\screenshot-store.png)

Features:
- Quickly open a person account in Axiom simply by entering the ID.
- Popout window you can use independently of your browser window.
- Alt+V shortcut to quickly open extension popout with the person id field in focus.
- Choose whether to open the URL in a new tab or reuse the current active tab.
- Constructs & opens the Url on the fly, e.g. https://axiom.veracross.au/{schoolroute}/#/person/{id}
- Persist `School Route`/`Short Code` between browser restarts using chrome.storage.sync

Notes:
- The extension uses `storage` and `tabs` permissions. No host permissions are required to navigate the tab to the target URL.
- A service worker is used to detect and execute the ctrl+v shortcut event.

---
\
This product is in no way affiliated with Veracross; just a (potentially) handy feature.

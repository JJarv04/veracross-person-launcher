# Veracross Person Launcher (Axiom)

This small extension allows you to quickly open a person record in Axiom simply by entering the Veracross Person ID. It does so by constructing and opening the records URL, the structure of which is shown below:
- https://axiom.veracross.com/{schoolroute}/#/person/{id}

Features:
- Quickly open a person account in Axiom simply by entering the ID.
- Popout window you can use independently of your browser window.
- Alt+V shortcut to quickly open extension popout with the person id field in focus.
- Choose whether to open the URL in a new tab or reuse the current active tab.
- Persist `School Route`/`Short Code` between browser restarts using chrome.storage.sync

Notes:
- The extension uses `storage` and `tabs` permissions. No host permissions are required to navigate the tab to the target URL.
- A service worker is used to detect and execute the ctrl+v shortcut event.

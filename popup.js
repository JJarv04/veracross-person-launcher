/*
  File:         popup.js
  Author:       JJA
  Description:  Popup script for Veracross Person Launcher extension. Handles UI interactions and storage
  Date:         19/11/2025
*/

function el(id) { return document.getElementById(id) }

const schoolRouteInput = el('schoolRoute')
const idInput = el('id')
const tldSelect = el('tldSelect')
const tldCustom = el('tldCustom')
const submitButton = el('submit')
const messageEl = el('message')
const settingsCollapsible = el('settingsCollapsible')
const popoutBtn = el('popoutBtn')

const DEFAULTS = { schoolRoute: '', openMode: 'new', tld: 'au' }

function showMessage(text, timeout = 3500) {
  messageEl.textContent = text
  if (timeout > 0) {
    setTimeout(() => { if (messageEl.textContent === text) messageEl.textContent = '' }, timeout)
  }
}

function saveSettings(schoolRoute, openMode, tld = DEFAULTS.tld) {
  chrome.storage.sync.set({ schoolRoute, openMode, tld }, () => {
    // silent
  })
}

function loadSettings(callback) {
  chrome.storage.sync.get(DEFAULTS, (items) => {
    const route = items.schoolRoute || ''
    const mode = items.openMode || 'new'
    const tld = items.tld || DEFAULTS.tld

    schoolRouteInput.value = route
    if (tldSelect) tldSelect.value = tld

    const radio = document.querySelector(`input[name=openMode][value=${mode}]`)
    if (radio) radio.checked = true

    // Set collapsible state: expanded if schoolRoute is empty, collapsed otherwise
    settingsCollapsible.open = !route

    if (typeof callback === 'function') callback()
  })
}

// Load TLD list from resource file `tlds.json` and populate the select control.
async function loadTldList() {
  const url = chrome.runtime.getURL('tlds.json')
  try {
    const resp = await fetch(url)
    if (!resp.ok) throw new Error('Failed to fetch tlds.json')
    const list = await resp.json()
    if (!Array.isArray(list)) throw new Error('tlds.json format invalid')

    // Sort and populate select
    const items = Array.from(new Set(list.map(s => String(s).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))
    if (tldSelect) {
      // Clear existing options
      tldSelect.innerHTML = ''
      // Add options
      items.forEach(v => {
        const opt = document.createElement('option')
        opt.value = v
        opt.textContent = v.startsWith('xn--') ? v : `.${v}`
        tldSelect.appendChild(opt)
      })
      // Add the 'Other' option
      const other = document.createElement('option')
      other.value = 'other'
      other.textContent = 'Other (enter below)'
      tldSelect.appendChild(other)
    }
    return items
  } catch (e) {
    console.error('Failed to load TLD list', e)
    // leave select as-is
    return []
  }
}

function getOpenMode() {
  const r = document.querySelector('input[name=openMode]:checked')
  return r ? r.value : 'new'
}

function validateId(id) {
  return /^\d+$/.test(id)
}

async function openUrl(url, mode) {
  if (mode === 'new') {
    chrome.tabs.create({ url })
  } else {
    // Open in existing active tab of current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.update(tabs[0].id, { url })
      } else {
        // Else if we're somehow now on a active page, just create a new tab
        chrome.tabs.create({ url })
      }
    })
  }
}

submitButton.addEventListener('click', () => {
  const id = idInput.value.trim()
  let code = schoolRouteInput.value.trim()
  const openMode = getOpenMode()
  let tld = tldSelect ? tldSelect.value : DEFAULTS.tld
  if (tld === 'other' && tldCustom) {
    const custom = tldCustom.value.trim()
    if (custom) tld = custom
  }

  if (!id) { showMessage('Enter an ID'); return }
  if (!validateId(id)) { showMessage('ID must be numeric'); return }

  if (!code) {
    // Try to load stored one synchronously via callback then proceed
    chrome.storage.sync.get(DEFAULTS, (items) => {
      code = items.schoolRoute || ''
      const storedTld = items.tld || DEFAULTS.tld
      let usedTld = tldSelect ? tldSelect.value : storedTld
      if (usedTld === 'other' && tldCustom) {
        const custom = tldCustom.value.trim()
        if (custom) usedTld = custom
      }
      if (!code) { showMessage('Enter School Route/Short Code or save it first'); return }
      const url = `https://axiom.veracross.${usedTld}/${encodeURIComponent(code)}/#/detail/person/${encodeURIComponent(id)}`
      saveSettings(code, openMode, usedTld)
      openUrl(url, openMode)
    })
    return
  }

  const url = `https://axiom.veracross.${tld}/${encodeURIComponent(code)}/#/detail/person/${encodeURIComponent(id)}`
  saveSettings(code, openMode, tld)
  openUrl(url, openMode)
})

// Auto-save schoolRoute when it changes (on blur)
schoolRouteInput.addEventListener('blur', () => {
  const code = schoolRouteInput.value.trim()
  const mode = getOpenMode()
  let tld = tldSelect ? tldSelect.value : DEFAULTS.tld
  if (tld === 'other' && tldCustom) {
    const custom = tldCustom.value.trim()
    if (custom) tld = custom
  }
  saveSettings(code, mode, tld)
  showMessage('Saved')
})

// Save open mode when changed
document.querySelectorAll('input[name=openMode]').forEach(r => {
  r.addEventListener('change', () => {
    chrome.storage.sync.get(DEFAULTS, (items) => {
      const code = (items.schoolRoute || schoolRouteInput.value.trim())
      const tld = (items.tld || (tldSelect ? tldSelect.value : DEFAULTS.tld))
      saveSettings(code, getOpenMode(), tld)
    })
  })
})

// Persist TLD when user changes it
tldSelect.addEventListener('change', () => {
  // Show/hide custom input when selecting Other
  if (tldSelect.value === 'other' && tldCustom) {
    tldCustom.style.display = 'inline-block'
    tldCustom.focus()
  } else if (tldCustom) {
    tldCustom.style.display = 'none'
  }

  chrome.storage.sync.get(DEFAULTS, (items) => {
    const code = (items.schoolRoute || schoolRouteInput.value.trim())
    let tld = tldSelect.value
    if (tld === 'other' && tldCustom) {
      const custom = tldCustom.value.trim()
      if (custom) tld = custom
    }
    saveSettings(code, getOpenMode(), tld)
    showMessage('Saved')
  })
})


tldCustom.addEventListener('blur', () => {
  chrome.storage.sync.get(DEFAULTS, (items) => {
    const code = (items.schoolRoute || schoolRouteInput.value.trim())
    const custom = tldCustom.value.trim()
    if (custom) saveSettings(code, getOpenMode(), custom)
    showMessage('Saved')
  })
})


// Allow pressing Enter to submit when focus is inside id input
idInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { submitButton.click(); e.preventDefault(); } })

// Main page initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load TLD resource first so we can match saved selection against options
  loadTldList().then(() => {
    loadSettings(() => {
      // Focus the Person ID input after settings are applied
      try {
        idInput.focus()
        idInput.select()
      } catch (e) {
        // Otherwise, ignore focus failures 
      }
      // If saved tld was not among options, enable custom input and show value
      try {
        chrome.storage.sync.get(DEFAULTS, (items) => {
          const saved = items.tld || DEFAULTS.tld
          const option = tldSelect && Array.from(tldSelect.options).find(o => o.value === saved)
          if (tldSelect && option) {
            tldSelect.value = saved
            if (tldCustom) tldCustom.style.display = 'none'
          } else if (tldSelect) {
            tldSelect.value = 'other'
            if (tldCustom) {
              tldCustom.style.display = 'inline-block'
              tldCustom.value = saved
            }
          }
        })
      } catch (e) {
        // ignore
      }
    })
  }).catch(() => {
    // If the TLD list failed to load, still restore settings
    loadSettings(() => {
      try { idInput.focus(); idInput.select() } catch (e) { }
    })
  })

  // Show the popout button only when the popup was NOT created via the keyboard shortcut or popout button.
  // The popout button & service worker/Alt-V-created popups with ?from=shortcut
  const openedByShortcut = new URLSearchParams(location.search).get('from') === 'shortcut'
  if (!openedByShortcut && popoutBtn) {
    popoutBtn.hidden = false
    popoutBtn.addEventListener('click', () => {
      const popupUrl = chrome.runtime.getURL('popup.html') + '?from=shortcut';

      // Try to find an existing tab with the popup open
      chrome.tabs.query({ url: popupUrl }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error('tabs.query error', chrome.runtime.lastError);
          return;
        }

        if (tabs && tabs.length > 0) {
          // Focus the first matching tab and its window
          const tab = tabs[0];
          chrome.windows.update(tab.windowId, { focused: true }, () => {
            chrome.tabs.update(tab.id, { active: true });
          });
          return;
        }

        // No existing tab: create a small popup window with the popup page
        const width = 420;
        const height = 320;
        chrome.windows.create({ url: popupUrl, type: 'popup', width, height }, (win) => {
          if (chrome.runtime.lastError) {
            console.error('windows.create error', chrome.runtime.lastError);
          }
        });
      });
    })
  }
})



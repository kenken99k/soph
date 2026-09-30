/* =====================================================================
   North Star Bakery - Touchstone 4
   js/storage.js
   Thin wrapper around localStorage and sessionStorage.

   Why a wrapper: localStorage throws in private browsing modes and when
   a site is opened from a file:// URL in some browsers. Every call is
   guarded so a storage failure can never break the page.
   ===================================================================== */

/* Returns the storage area we want, or null when the browser refuses it. */
function getStorageArea(type) {
    try {
        const area = type === 'session' ? window.sessionStorage : window.localStorage;
        const probe = '__nsb_probe__';
        area.setItem(probe, '1');
        area.removeItem(probe);
        return area;
    } catch (error) {
        return null;
    }
}

let localArea = getStorageArea('local');
let sessionArea = getStorageArea('session');

/* True when the browser let us have persistent storage. */
function isStorageAvailable() {
    return localArea !== null;
}

/* Reads and parses a JSON value. Returns the fallback on any problem,
   including data that was corrupted by an older version of the site. */
function readJSON(area, key, fallback) {
    if (!area) {
        return fallback;
    }
    try {
        const raw = area.getItem(key);
        if (raw === null) {
            return fallback;
        }
        const parsed = JSON.parse(raw);
        return parsed === null ? fallback : parsed;
    } catch (error) {
        return fallback;
    }
}

/* Serialises and stores a value. Returns true when the write landed. */
function writeJSON(area, key, value) {
    if (!area) {
        return false;
    }
    try {
        area.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        return false;
    }
}

function removeKey(area, key) {
    if (!area) {
        return false;
    }
    try {
        area.removeItem(key);
        return true;
    } catch (error) {
        return false;
    }
}

/* ---- The pre-order list: an array of { id, qty } objects ---- */

function readOrderList() {
    const stored = readJSON(localArea, STORAGE_KEYS.orderList, []);
    if (!Array.isArray(stored)) {
        return [];
    }
    return stored.filter(function (entry) {
        return entry && typeof entry.id === 'string' && Number.isFinite(entry.qty) && entry.qty > 0;
    });
}

function saveOrderList(items) {
    return writeJSON(localArea, STORAGE_KEYS.orderList, items);
}

function clearOrderList() {
    removeKey(localArea, STORAGE_KEYS.orderList);
}

/* ---- Remembered customer details for the order form ---- */

function readCustomer() {
    const stored = readJSON(localArea, STORAGE_KEYS.customer, {});
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
}

function saveCustomer(details) {
    return writeJSON(localArea, STORAGE_KEYS.customer, details);
}

function clearCustomer() {
    removeKey(localArea, STORAGE_KEYS.customer);
}

/* ---- One-shot handoff from the product list to the contact form ----
   sessionStorage is the right tool here: the list only needs to survive
   the single navigation from products.html to contact.html, and it
   should not outlive the browser session. */

function savePendingOrder(summary) {
    return writeJSON(sessionArea, STORAGE_KEYS.pendingOrder, summary);
}

/* Reads the handoff and clears it in one step so reloading the contact
   page does not overwrite whatever the customer has since typed. */
function takePendingOrder() {
    const summary = readJSON(sessionArea, STORAGE_KEYS.pendingOrder, null);
    removeKey(sessionArea, STORAGE_KEYS.pendingOrder);
    return summary;
}

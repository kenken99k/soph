/* =====================================================================
   North Star Bakery - Touchstone 4
   js/order-list.js
   The interactive feature: a pre-order list builder.

   Visitors add baked goods to a list, change quantities, and see an
   estimated total. The list survives page loads, shows a count badge in
   the navigation on every page, and can be carried into the order
   request form on the contact page.
   ===================================================================== */

/* Maximum quantity of one item we will let a visitor add. Real orders
   above this come through the catering path instead. */
const MAX_QTY = 12;

/* In-memory copy so we never read localStorage on every click. */
let orderItems = [];
let activeCategory = 'all';

/* ---------- small helpers ---------- */

function makeElement(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) {
        node.className = className;
    }
    if (textContent !== undefined && textContent !== null) {
        node.textContent = textContent;
    }
    return node;
}

function getProductById(id) {
    return PRODUCTS.find(function (product) {
        return product.id === id;
    }) || null;
}

function getCategoryLabel(categoryId) {
    const match = CATEGORIES.find(function (category) {
        return category.id === categoryId;
    });
    return match ? match.label : '';
}

function formatMoney(amount) {
    return '$' + amount.toFixed(2);
}

function quantityInList(id) {
    const entry = orderItems.find(function (item) {
        return item.id === id;
    });
    return entry ? entry.qty : 0;
}

/* Adds days to today and returns a local YYYY-MM-DD string, which is the
   format the date input expects. */
function isoDateDaysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

/* ---------- list logic, kept separate from anything DOM related ---------- */

/* Adds or subtracts from a row's quantity and saves the result.
   Returns { status, product, qty, added } so the caller can decide what
   to say without having to know how the list is stored.
   status is 'changed' or 'limit'. */
function changeQuantity(id, step) {
    const product = getProductById(id);
    if (!product) {
        return null;
    }
    const current = quantityInList(id);
    const next = current + step;

    /* Stepping below zero deletes the row, which is less surprising
       than leaving an empty line the customer has to remove. */
    if (next <= 0) {
        removeItemFromList(id);
        return { status: 'changed', product: product, qty: 0, added: false };
    }

    if (next > MAX_QTY) {
        return { status: 'limit', product: product };
    }

    const existing = orderItems.find(function (item) {
        return item.id === id;
    });
    if (existing) {
        existing.qty = next;
    } else {
        orderItems.push({ id: id, qty: next });
    }
    saveOrderList(orderItems);
    return { status: 'changed', product: product, qty: next, added: step > 0 };
}

function removeItemFromList(id) {
    const product = getProductById(id);
    const before = orderItems.length;
    orderItems = orderItems.filter(function (item) {
        return item.id !== id;
    });
    if (orderItems.length !== before) {
        saveOrderList(orderItems);
        return product;
    }
    return null;
}

function clearList() {
    orderItems = [];
    clearOrderList();
}

/* Number of individual items, which is not the same as the row count. */
function getItemCount(items) {
    return items.reduce(function (sum, item) {
        return sum + item.qty;
    }, 0);
}

function getEstimatedTotal(items) {
    return items.reduce(function (sum, item) {
        const product = getProductById(item.id);
        return sum + (product ? product.price * item.qty : 0);
    }, 0);
}

/* The longest lead time on the list decides the earliest pickup date,
   because every item on one order has to be ready together. */
function getRequiredNoticeDays(items) {
    return items.reduce(function (longest, item) {
        const product = getProductById(item.id);
        return product && product.notice > longest ? product.notice : longest;
    }, 0);
}

/* Turns the list into the plain text that gets dropped into the
   item details box on the contact form. */
function describeOrderList(items) {
    if (items.length === 0) {
        return '';
    }
    const lines = items.map(function (item) {
        const product = getProductById(item.id);
        const name = product ? product.name : item.id;
        const unit = product ? product.unit : '';
        return name + ' x' + item.qty + ' (' + unit + ')';
    });
    const total = getEstimatedTotal(items);
    const notice = getRequiredNoticeDays(items);
    let summary = 'Pre-order request:\n' + lines.join('\n');
    summary += '\n\nEstimated total: ' + formatMoney(total);
    if (notice > 0) {
        summary += '\nEarliest pickup we can offer: ' + isoDateDaysFromNow(notice);
    }
    return summary;
}

/* ---------- rendering ---------- */

function renderCategoryFilters() {
    const container = document.getElementById('category-filter');
    if (!container) {
        return;
    }
    container.innerHTML = '';
    CATEGORIES.forEach(function (category) {
        const button = makeElement('button', 'chip', category.label);
        button.type = 'button';
        button.dataset.category = category.id;
        if (category.id === activeCategory) {
            button.classList.add('chip--active');
            button.setAttribute('aria-current', 'true');
        }
        container.appendChild(button);
    });
}

function createProductCard(product) {
    const card = makeElement('article', 'card product-card');
    card.appendChild(makeElement('p', 'product-category', getCategoryLabel(product.category)));
    card.appendChild(makeElement('h3', 'product-name', product.name));
    card.appendChild(makeElement('p', 'product-blurb', product.blurb));

    const meta = makeElement('p', 'product-meta');
    meta.appendChild(makeElement('span', 'product-price', formatMoney(product.price) + ' / ' + product.unit));
    if (product.preorder) {
        meta.appendChild(makeElement('span', 'tag tag--preorder', 'Pre-order'));
    }
    if (product.notice > 0 && !product.preorder) {
        meta.appendChild(makeElement('span', 'tag', product.notice + ' day notice'));
    }
    card.appendChild(meta);

    const button = makeElement('button', 'add-button', 'Add to list');
    button.type = 'button';
    button.dataset.add = product.id;
    card.appendChild(button);
    return card;
}

function renderCatalog() {
    const container = document.getElementById('catalog');
    if (!container) {
        return;
    }
    container.innerHTML = '';

    const visible = PRODUCTS.filter(function (product) {
        return activeCategory === 'all' || product.category === activeCategory;
    });

    visible.forEach(function (product) {
        container.appendChild(createProductCard(product));
    });

    const count = document.getElementById('catalog-count');
    if (count) {
        const label = getCategoryLabel(activeCategory);
        count.textContent = visible.length + (visible.length === 1 ? ' item' : ' items') +
            (activeCategory === 'all' ? ' we bake' : ' in ' + label);
    }

    const empty = document.getElementById('catalog-empty');
    if (empty) {
        empty.hidden = visible.length > 0;
    }
}

function renderOrderPanel() {
    const list = document.getElementById('order-items');
    const emptyNote = document.getElementById('order-empty');
    const countOut = document.getElementById('order-count');
    const totalOut = document.getElementById('order-total');
    const noticeOut = document.getElementById('order-notice');
    const useButton = document.getElementById('use-list');
    const clearButton = document.getElementById('clear-list');
    if (!list) {
        return;
    }

    list.innerHTML = '';
    orderItems.forEach(function (entry) {
        const product = getProductById(entry.id);
        if (!product) {
            return;
        }

        const row = makeElement('li', 'order-item');

        row.appendChild(makeElement('span', 'order-item-name', product.name));

        const stepper = makeElement('span', 'qty');
        const minus = makeElement('button', 'qty-button', '\u2212');
        minus.type = 'button';
        minus.dataset.step = '-1';
        minus.dataset.target = product.id;
        minus.setAttribute('aria-label', 'Remove one ' + product.name);

        const amount = makeElement('span', 'qty-amount', String(entry.qty));
        amount.setAttribute('aria-live', 'off');

        const plus = makeElement('button', 'qty-button', '+');
        plus.type = 'button';
        plus.dataset.step = '1';
        plus.dataset.target = product.id;
        plus.setAttribute('aria-label', 'Add one ' + product.name);

        stepper.appendChild(minus);
        stepper.appendChild(amount);
        stepper.appendChild(plus);
        row.appendChild(stepper);

        row.appendChild(makeElement('span', 'order-item-price', formatMoney(product.price * entry.qty)));

        const remove = makeElement('button', 'remove-button', 'Remove');
        remove.type = 'button';
        remove.dataset.remove = product.id;
        remove.setAttribute('aria-label', 'Remove ' + product.name + ' from your list');
        row.appendChild(remove);

        list.appendChild(row);
    });

    const hasItems = orderItems.length > 0;
    if (emptyNote) {
        emptyNote.hidden = hasItems;
        emptyNote.textContent = MESSAGES.empty;
    }
    if (countOut) {
        countOut.textContent = String(getItemCount(orderItems));
    }
    if (totalOut) {
        totalOut.textContent = formatMoney(getEstimatedTotal(orderItems));
    }

    const notice = getRequiredNoticeDays(orderItems);
    if (noticeOut) {
        noticeOut.hidden = notice === 0;
        noticeOut.textContent = notice === 0 ? '' : MESSAGES.noticeNeeded(notice);
    }
    if (useButton) {
        useButton.disabled = !hasItems;
    }
    if (clearButton) {
        clearButton.disabled = !hasItems;
    }
}

/* The badge sits in the navigation on every page, so a visitor can see
   the list survived a move between pages. */
function updateBadges() {
    const count = getItemCount(orderItems);
    document.querySelectorAll('[data-order-badge]').forEach(function (badge) {
        badge.textContent = String(count);
        badge.hidden = count === 0;
    });
}

function announce(message) {
    const live = document.getElementById('order-live');
    if (live) {
        live.textContent = message;
    }
}

function showNotice(message) {
    const note = document.getElementById('order-message');
    if (note) {
        note.textContent = message;
        note.hidden = message === '';
    }
}

function renderEverything() {
    renderCategoryFilters();
    renderCatalog();
    renderOrderPanel();
    updateBadges();
}

/* ---------- wiring ---------- */

function handleCatalogClick(event) {
    const button = event.target.closest('[data-add]');
    if (!button) {
        return;
    }
    const result = changeQuantity(button.dataset.add, 1);
    if (!result) {
        return;
    }
    if (result.status === 'limit') {
        showNotice(MESSAGES.limit);
        announce(MESSAGES.limit);
        return;
    }
    showNotice(MESSAGES.added(result.product.name));
    announce(MESSAGES.added(result.product.name));
    renderOrderPanel();
    updateBadges();
}

function handleListClick(event) {
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
        const product = removeItemFromList(removeButton.dataset.remove);
        if (product) {
            showNotice(MESSAGES.removed(product.name));
            announce(MESSAGES.removed(product.name));
            renderOrderPanel();
            updateBadges();
        }
        return;
    }

    const stepButton = event.target.closest('[data-step]');
    if (stepButton) {
        const id = stepButton.dataset.target;
        const before = quantityInList(id);
        const result = changeQuantity(id, Number(stepButton.dataset.step));
        if (!result || before === result.qty) {
            return;
        }
        if (result.status === 'limit') {
            showNotice(MESSAGES.limit);
            announce(MESSAGES.limit);
            return;
        }
        const message = result.added
            ? MESSAGES.added(result.product.name)
            : MESSAGES.removed(result.product.name);
        showNotice(message);
        announce(message);
        renderOrderPanel();
        updateBadges();
    }
}

function handleFilterClick(event) {
    const button = event.target.closest('[data-category]');
    if (!button) {
        return;
    }
    activeCategory = button.dataset.category;
    renderCategoryFilters();
    renderCatalog();
}

function handleUseList() {
    if (orderItems.length === 0) {
        showNotice(MESSAGES.handoffEmpty);
        announce(MESSAGES.handoffEmpty);
        return;
    }
    const summary = {
        text: describeOrderList(orderItems),
        itemCount: getItemCount(orderItems),
        noticeDays: getRequiredNoticeDays(orderItems)
    };
    const saved = savePendingOrder(summary);
    if (!saved) {
        showNotice(MESSAGES.handoffSaved(summary.itemCount));
    }
    window.location.href = 'contact.html#order-request';
}

function handleClearList() {
    if (orderItems.length === 0) {
        return;
    }
    clearList();
    showNotice(MESSAGES.cleared);
    announce(MESSAGES.cleared);
    renderOrderPanel();
    updateBadges();
}

/* ---------- start up ---------- */

function initOrderList() {
    orderItems = readOrderList();
    renderCategoryFilters();
    renderCatalog();
    renderOrderPanel();
    updateBadges();

    const restored = getItemCount(orderItems);
    if (restored > 0) {
        showNotice(MESSAGES.restored(restored));
        announce(MESSAGES.restored(restored));
    }
    if (!isStorageAvailable()) {
        showNotice(MESSAGES.storageUnavailable);
    }

    const filter = document.getElementById('category-filter');
    if (filter) {
        filter.addEventListener('click', handleFilterClick);
    }
    const catalog = document.getElementById('catalog');
    if (catalog) {
        catalog.addEventListener('click', handleCatalogClick);
    }
    const list = document.getElementById('order-items');
    if (list) {
        list.addEventListener('click', handleListClick);
    }
    const useButton = document.getElementById('use-list');
    if (useButton) {
        useButton.addEventListener('click', handleUseList);
    }
    const clearButton = document.getElementById('clear-list');
    if (clearButton) {
        clearButton.addEventListener('click', handleClearList);
    }
}

document.addEventListener('DOMContentLoaded', initOrderList);

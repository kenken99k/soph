/* =====================================================================
   North Star Bakery - Touchstone 4
   js/validate.js
   Validation and remember-me behaviour for the order request form on
   contact.html.

   The markup keeps its native HTML validation attributes, but the form
   carries novalidate so this script can show its own messages next to
   each field instead of a browser alert bubble. If this file ever fails
   to load, the attributes are still there as a fallback.
   ===================================================================== */

/* Patterns kept here so they can be reused and tested in one place. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;

function todayIso() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

function addDaysIso(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
}

/* The earliest pickup the order list can actually be baked for.
   Depends on whichever item in the pre-order list needs the longest
   lead time, which is why this reads the stored list. */
function earliestPickupIso() {
    let noticeDays = 0;
    if (typeof getRequiredNoticeDays === 'function') {
        noticeDays = getRequiredNoticeDays(readOrderList());
    }
    return noticeDays > 0 ? addDaysIso(noticeDays) : todayIso();
}

/* One object per field. Each holds an array of checks, so adding a rule
   means adding a line here rather than editing a chain of if statements. */
const VALIDATION_RULES = [
    {
        id: 'name',
        label: 'full name',
        checks: [
            { type: 'required', message: 'Please enter the name we should put on your order label.' },
            { type: 'minLength', value: 2, message: 'Please enter at least 2 characters for your name.' }
        ]
    },
    {
        id: 'email',
        label: 'email address',
        checks: [
            { type: 'required', message: 'We need an email address to send your pickup confirmation.' },
            {
                type: 'pattern',
                pattern: EMAIL_PATTERN,
                message: 'That does not look like an email address. Try something like name@example.com.'
            }
        ]
    },
    {
        id: 'phone',
        label: 'phone number',
        checks: [
            { type: 'pattern', pattern: PHONE_PATTERN, message: 'Use the format 555-555-5554, or leave this blank.' }
        ]
    },
    {
        id: 'request-type',
        label: 'type of request',
        checks: [
            { type: 'required', message: 'Please choose what this request is about.' }
        ]
    },
    {
        id: 'pickup-date',
        label: 'pickup date',
        checks: [
            { type: 'required', message: 'Please choose a pickup date.' },
            {
                type: 'notPast',
                message: 'Pickup cannot be in the past. Choose today or a later date.'
            },
            {
                type: 'notBeforeNotice',
                message: 'Something on your pre-order list needs more time in the oven. Please move the date later, or call us and we will see what we can do.'
            }
        ]
    },
    {
        id: 'item-details',
        label: 'item details',
        checks: [
            { type: 'required', message: 'Please tell us what you would like to order.' },
            {
                type: 'minLength',
                value: 10,
                message: 'Please add a little more detail, at least 10 characters, so we bake the right thing.'
            }
        ]
    }
];

/* Runs one check against one value and returns a message, or '' when
   the value is acceptable. Checks other than 'required' always pass an
   empty value so optional fields can be left blank. */
function runCheck(check, value) {
    switch (check.type) {
        case 'required':
            return value === '' ? check.message : '';
        case 'minLength':
            return value !== '' && value.length < check.value ? check.message : '';
        case 'pattern':
            return value !== '' && !check.pattern.test(value) ? check.message : '';
        case 'notPast':
            return value !== '' && value < todayIso() ? check.message : '';
        case 'notBeforeNotice':
            return value !== '' && value < earliestPickupIso() ? check.message : '';
        default:
            return '';
    }
}

/* Validates a single field and returns its first error message, or
   '' when the field is fine. */
function validateField(rule, element) {
    const value = (element.value || '').trim();
    for (let i = 0; i < rule.checks.length; i += 1) {
        const message = runCheck(rule.checks[i], value);
        if (message) {
            return message;
        }
    }
    return '';
}

/* Puts an error next to a field and marks the input for assistive tech. */
function showFieldError(rule, message, hasAnyError) {
    const element = document.getElementById(rule.id);
    const errorBox = document.getElementById(rule.id + '-error');
    if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
    }
    if (element) {
        element.classList.toggle('is-invalid', message !== '');
        element.classList.toggle('is-valid', message === '' && hasAnyError);
        if (message) {
            element.setAttribute('aria-invalid', 'true');
        } else {
            element.removeAttribute('aria-invalid');
        }
    }
}

/* Validates every field and returns the array of problems found. */
function validateAll() {
    const problems = [];
    VALIDATION_RULES.forEach(function (rule) {
        const element = document.getElementById(rule.id);
        if (!element) {
            return;
        }
        const message = validateField(rule, element);
        showFieldError(rule, message, true);
        if (message) {
            problems.push({ id: rule.id, label: rule.label, message: message });
        }
    });
    return problems;
}

function showProblemList(problems) {
    const box = document.getElementById('form-summary');
    const list = document.getElementById('form-summary-list');
    if (!box || !list) {
        return;
    }
    list.innerHTML = '';
    problems.forEach(function (problem) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#' + problem.id;
        link.textContent = problem.label + ': ' + problem.message;
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const field = document.getElementById(problem.id);
            if (field) {
                field.focus();
            }
        });
        item.appendChild(link);
        list.appendChild(item);
    });
    box.hidden = problems.length === 0;
}

function hideProblemList() {
    const box = document.getElementById('form-summary');
    if (box) {
        box.hidden = true;
    }
}

/* Re-checks one field as the customer types, but only after they have
   already tried to submit once. Validating while someone is halfway
   through typing an email address is hostile. */
function setUpLiveValidation(element, rule) {
    if (!element) {
        return;
    }
    const revalidate = function () {
        if (!formHasBeenSubmitted) {
            return;
        }
        const message = validateField(rule, element);
        showFieldError(rule, message, true);
        const remaining = document.querySelectorAll('form .is-invalid').length;
        if (remaining === 0) {
            hideProblemList();
        }
    };
    element.addEventListener('blur', revalidate);
    element.addEventListener('input', revalidate);
}

/* ---------- storage-backed convenience ---------- */

/* Fills the form from the previous visit, and from the pre-order list
   the customer built on the products page. */
function prefillFromStorage() {
    const saved = readCustomer();

    const setValue = function (id, value) {
        const element = document.getElementById(id);
        if (element && typeof value === 'string' && value !== '') {
            element.value = value;
        }
    };

    setValue('name', saved.name);
    setValue('email', saved.email);
    setValue('phone', saved.phone);
    setValue('request-type', saved.requestType);
    setValue('pickup-time', saved.pickupTime);

    const rememberBox = document.getElementById('remember-details');
    if (rememberBox) {
        rememberBox.checked = saved.remember === true;
    }

    const pending = takePendingOrder();
    const details = document.getElementById('item-details');
    const handoff = document.getElementById('order-handoff');

    if (pending && details && !details.value.trim()) {
        details.value = pending.text;
        const typeField = document.getElementById('request-type');
        if (typeField) {
            typeField.value = 'pre-order';
        }
        const dateField = document.getElementById('pickup-date');
        if (dateField) {
            dateField.min = earliestPickupIso();
        }
        if (handoff) {
            handoff.hidden = false;
            handoff.textContent =
                'We filled this in from the pre-order list you built: ' + pending.itemCount +
                (pending.itemCount === 1 ? ' item' : ' items') +
                '. Edit it however you like before sending.';
        }
    }

    const dateField = document.getElementById('pickup-date');
    if (dateField && !dateField.min) {
        dateField.min = todayIso();
    }
}

/* Honours the remember-me checkbox either way, so unchecking it
   genuinely erases what was stored. */
function persistCustomerDetails() {
    const rememberBox = document.getElementById('remember-details');
    const wantsSaved = rememberBox ? rememberBox.checked : false;

    if (!wantsSaved) {
        clearCustomer();
        return;
    }

    const getValue = function (id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    };

    saveCustomer({
        name: getValue('name'),
        email: getValue('email'),
        phone: getValue('phone'),
        requestType: getValue('request-type'),
        pickupTime: getValue('pickup-time'),
        remember: true
    });
}

/* ---------- success panel ---------- */

function showSuccess(details) {
    const panel = document.getElementById('form-success');
    const form = document.getElementById('order-request');
    if (!panel) {
        return;
    }
    panel.innerHTML = '';
    panel.hidden = false;

    const heading = document.createElement('h3');
    heading.textContent = 'Thanks, ' + details.name + '. Your request is ready to send.';

    const body = document.createElement('p');
    body.textContent =
        'We have your request for ' + details.requestTypeLabel +
        ', pickup on ' + details.pickupDate + '. We will email ' + details.email +
        ' to confirm the final price and a pickup time.';

    const note = document.createElement('p');
    note.className = 'form-success-note';
    note.textContent =
        'Demonstration only: this is a front-end coursework site with no server, so nothing is actually transmitted.';

    const again = document.createElement('button');
    again.type = 'button';
    again.textContent = 'Start another request';
    again.addEventListener('click', function () {
        panel.hidden = true;
        if (form) {
            form.reset();
        }
        document.getElementById('name').focus();
    });

    panel.appendChild(heading);
    panel.appendChild(body);
    panel.appendChild(note);
    panel.appendChild(again);
    panel.focus();
}

/* ---------- start up ---------- */

let formHasBeenSubmitted = false;

function initValidation() {
    const form = document.getElementById('order-request');
    if (!form) {
        return;
    }

    prefillFromStorage();

    VALIDATION_RULES.forEach(function (rule) {
        setUpLiveValidation(document.getElementById(rule.id), rule);
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        formHasBeenSubmitted = true;

        const problems = validateAll();
        if (problems.length > 0) {
            showProblemList(problems);
            const first = document.getElementById(problems[0].id);
            if (first) {
                first.focus();
            }
            return;
        }

        hideProblemList();
        persistCustomerDetails();

        const typeField = document.getElementById('request-type');
        const dateField = document.getElementById('pickup-date');
        const option = typeField ? typeField.options[typeField.selectedIndex] : null;

        showSuccess({
            name: (document.getElementById('name').value || '').trim().split(' ')[0],
            email: (document.getElementById('email').value || '').trim(),
            requestTypeLabel: option ? option.textContent : 'your request',
            pickupDate: dateField ? dateField.value : 'your chosen date'
        });
    });

    const forgetButton = document.getElementById('forget-details');
    if (forgetButton) {
        forgetButton.addEventListener('click', function () {
            clearCustomer();
            const rememberBox = document.getElementById('remember-details');
            if (rememberBox) {
                rememberBox.checked = false;
            }
            const savedNote = document.getElementById('forget-note');
            if (savedNote) {
                savedNote.hidden = false;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initValidation);

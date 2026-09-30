/* =====================================================================
   North Star Bakery - Touchstone 4
   js/data.js
   All static data for the pre-order builder lives here so the rest of
   the JavaScript never hard-codes a product name, price, or message.
   ===================================================================== */

/* Filter options for the catalog, in the order they appear as buttons. */
const CATEGORIES = [
    { id: 'all', label: 'Everything' },
    { id: 'breads', label: 'Breads' },
    { id: 'pastries', label: 'Pastries' },
    { id: 'cakes', label: 'Cakes' }
];

/* The catalog. Each product is one object in this array:
     notice = days of lead time the bakery needs before pickup
     preorder = true when it must be ordered ahead
   Prices are in dollars and are only an estimate until staff confirm. */
const PRODUCTS = [
    {
        id: 'signature-loaf',
        name: 'Signature Loaf',
        category: 'breads',
        price: 8.00,
        unit: 'loaf',
        notice: 1,
        preorder: false,
        blurb: 'Two-day slow-fermented sourdough with a dark crackled crust and an open crumb.'
    },
    {
        id: 'country-white',
        name: 'Country White',
        category: 'breads',
        price: 6.50,
        unit: 'loaf',
        notice: 0,
        preorder: false,
        blurb: 'Soft and mild. Our best loaf for sandwiches and for kids.'
    },
    {
        id: 'honey-whole-wheat',
        name: 'Honey Whole Wheat',
        category: 'breads',
        price: 7.50,
        unit: 'loaf',
        notice: 0,
        preorder: false,
        blurb: 'Whole wheat loaf lightly sweetened with honey from Meadowlark Creamery.'
    },
    {
        id: 'seeded-rye',
        name: 'Seeded Rye',
        category: 'breads',
        price: 8.25,
        unit: 'loaf',
        notice: 1,
        preorder: false,
        blurb: 'Dense and earthy, packed with sunflower, flax, and sesame.'
    },
    {
        id: 'gluten-reduced',
        name: 'Gluten-Reduced Country',
        category: 'breads',
        price: 9.50,
        unit: 'loaf',
        notice: 1,
        preorder: false,
        blurb: 'Baked in our dedicated gluten-free zone, which is cleaned down before every bake.'
    },
    {
        id: 'rosemary-focaccia',
        name: 'Rosemary Focaccia Slab',
        category: 'breads',
        price: 10.00,
        unit: 'slab',
        notice: 1,
        preorder: false,
        blurb: 'Half a slab, olive oil and rosemary. Made for sharing.'
    },
    {
        id: 'butter-croissant',
        name: 'Butter Croissant',
        category: 'pastries',
        price: 4.25,
        unit: 'each',
        notice: 0,
        preorder: false,
        blurb: 'Laminated over two days into twenty-seven layers. Sells out early.'
    },
    {
        id: 'almond-croissant',
        name: 'Almond Croissant',
        category: 'pastries',
        price: 5.25,
        unit: 'each',
        notice: 0,
        preorder: false,
        blurb: "Yesterday's croissant filled with frangipane and toasted almonds."
    },
    {
        id: 'morning-bun',
        name: 'Morning Bun',
        category: 'pastries',
        price: 4.50,
        unit: 'each',
        notice: 0,
        preorder: false,
        blurb: 'Croissant dough rolled with cinnamon sugar and baked until caramelized.'
    },
    {
        id: 'cinnamon-bun',
        name: 'Seven-Layer Cinnamon Bun',
        category: 'pastries',
        price: 4.25,
        unit: 'each',
        notice: 0,
        preorder: false,
        blurb: 'Our Saturday market feature. Two trays every morning, and that is all we bake.'
    },
    {
        id: 'sea-salt-cookie',
        name: 'Sea Salt Chocolate Chip Cookie',
        category: 'pastries',
        price: 3.75,
        unit: 'each',
        notice: 0,
        preorder: false,
        blurb: 'Warm with a crisp edge and a soft centre. A customer favourite.'
    },
    {
        id: 'cinnamon-babka',
        name: 'Cinnamon Babka',
        category: 'pastries',
        price: 17.50,
        unit: 'loaf',
        notice: 1,
        preorder: true,
        blurb: 'A whole loaf of spiced babka. Pre-order only.'
    },
    {
        id: 'buttercream-cake',
        name: 'Classic Buttercream Cake',
        category: 'cakes',
        price: 64.00,
        unit: '8 inch cake',
        notice: 3,
        preorder: true,
        blurb: 'Vanilla, chocolate, or marble. Handwriting on the cake is free.'
    },
    {
        id: 'fruit-tart',
        name: 'Seasonal Fruit Tart',
        category: 'cakes',
        price: 48.00,
        unit: '9 inch tart',
        notice: 3,
        preorder: true,
        blurb: 'Shortcrust tart finished to order with whatever fruit is best that week.'
    },
    {
        id: 'sheet-cake',
        name: 'Chocolate Celebration Sheet Cake',
        category: 'cakes',
        price: 66.00,
        unit: 'serves 24-36',
        notice: 3,
        preorder: true,
        blurb: 'Our most requested birthday cake. Serves twenty-four to thirty-six.'
    },
    {
        id: 'cupcakes',
        name: 'Cupcakes',
        category: 'cakes',
        price: 33.00,
        unit: 'dozen',
        notice: 2,
        preorder: true,
        blurb: 'A dozen, any flavour on the seasonal board that week.'
    },
    {
        id: 'mini-pies',
        name: 'Mini Pies',
        category: 'cakes',
        price: 28.00,
        unit: 'six pies',
        notice: 2,
        preorder: true,
        blurb: 'Six hand pies. Apple or cherry, or a mix of both.'
    }
];

/* Keys used by js/storage.js. Versioned so a future change to the
   stored shape can be rolled out without breaking old saved lists. */
const STORAGE_KEYS = {
    orderList: 'nsb.orderList.v1',
    customer: 'nsb.customer.v1',
    pendingOrder: 'nsb.pendingOrder.v1'
};

/* Every message the interface can show, kept in one object so the copy
   is edited in a single place instead of being scattered through the
   event handlers. */
const MESSAGES = {
    added: (name) => name + ' added to your pre-order list.',
    removed: (name) => name + ' removed from your pre-order list.',
    cleared: 'Pre-order list cleared.',
    limit: 'That is the most we can bake in one day. Call us for larger orders.',
    empty: 'Your pre-order list is empty. Choose something above to get started.',
    noticeNeeded: (days) =>
        'One item on your list needs ' + days + (days === 1 ? ' day' : ' days') +
        " of notice, so the earliest pickup we can offer is shown in the order form.",
    handoffSaved: (count) =>
        'Your list of ' + count + (count === 1 ? ' item is' : ' items are') +
        ' ready in the order request form.',
    handoffEmpty: 'Add something to your list first.',
    restored: (count) =>
        count + (count === 1 ? ' item' : ' items') + ' restored from your last visit.',
    storageUnavailable:
        'We could not save your list in this browser, so it will be lost when you close the tab.'
};

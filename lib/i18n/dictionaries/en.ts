export const en = {
  nav: { new: 'New', men: 'Men', women: 'Women', sport: 'Sport', accessories: 'Accessories', sale: 'Sale' },
  common: { shopNow: 'Shop Now', seeMore: 'See more', addToCart: 'Add to cart', search: 'Search...' },
  announcement: { freeShipping: 'Free shipping on orders over $50' },
  collection: {
    newArrivals: 'New Arrivals', bestsellers: 'Bestsellers', sale: 'Sale',
    colored: 'Colored Lenses', daily: 'Daily Lenses',
  },
  filters: {
    type: 'Lens type', replacement: 'Replacement', color: 'Color', sort: 'Sort', clear: 'Clear filters',
    types: { clear: 'Clear', colored: 'Colored', toric: 'Toric', multifocal: 'Multifocal' },
    replacements: { daily: 'Daily', biweekly: 'Bi-weekly', monthly: 'Monthly' },
    sorts: { newest: 'Newest', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', bestselling: 'Best selling' },
  },
  pdp: {
    specs: 'Specifications', related: 'You might also like', reviews: 'Reviews',
    material: 'Material', waterContent: 'Water content', baseCurve: 'Base curve',
    diameter: 'Diameter', uvProtection: 'UV protection', manufacturer: 'Manufacturer',
    packSize: 'Pack size', color: 'Color', quantity: 'Quantity', freeship: 'Freeship',
  },
  cart: {
    title: 'Your Cart', empty: 'Your cart is empty', subtotal: 'Subtotal',
    checkout: 'Checkout', remove: 'Remove',
  },
  checkout: {
    title: 'Checkout', fullName: 'Full name', email: 'Email', address: 'Address',
    city: 'City', phone: 'Phone', placeOrder: 'Place order', payNote: 'Payment is simulated in this demo.',
    success: 'Thank you! Your order is confirmed.', orderId: 'Order ID',
    errors: { required: 'Required', invalidEmail: 'Invalid email' },
  },
  footer: {
    policies: 'Policies', about: 'About Vivimoon', customerCare: 'Customer Care',
    tagline: 'Vivimoon — high-quality contact lenses.',
    shipping: 'Shipping', returns: 'Returns', privacy: 'Privacy',
    hotline: 'Hotline', rights: '© 2026 Vivimoon',
  },
};

export type Dictionary = typeof en;

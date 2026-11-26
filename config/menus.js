// Menús de la tienda y del panel.
// enabled: false => el enlace no se muestra (la pantalla aún no está implementada).
// Cuando una funcionalidad esté terminada, cambia su enabled a true.
const STORE_MENU = [
  { key: 'home', href: '/', label: 'layout.nav.home', enabled: true },
  { key: 'products', href: '/products', label: 'layout.nav.products', enabled: true },
  { key: 'orders', href: '/my/orders', label: 'layout.nav.orders', enabled: false },
  { key: 'cart', href: '/cart', label: 'layout.nav.cart', icon: 'bi-bag', enabled: false }
];

const ADMIN_MENU = [
  { key: 'dashboard', href: '/admin', icon: 'bi-grid', label: 'admin.nav.dashboard', resource: 'products', enabled: false },
  { key: 'products', href: '/admin/products', icon: 'bi-box-seam', label: 'admin.nav.products', resource: 'products', enabled: false },
  { key: 'variants', href: '/admin/variants', icon: 'bi-tags', label: 'admin.nav.variants', resource: 'variants', enabled: false },
  { key: 'inventory', href: '/admin/inventory', icon: 'bi-stack', label: 'admin.nav.inventory', resource: 'inventory', enabled: false },
  { key: 'orders', href: '/admin/orders', icon: 'bi-receipt', label: 'admin.nav.orders', resource: 'orders', enabled: false },
  { key: 'customers', href: '/admin/customers', icon: 'bi-people', label: 'admin.nav.customers', resource: 'customers', enabled: false },
  { key: 'users', href: '/admin/users', icon: 'bi-person-badge', label: 'admin.nav.users', resource: 'users', enabled: false },
  { key: 'roles', href: '/admin/roles', icon: 'bi-key', label: 'admin.nav.roles', resource: 'roles', enabled: false }
];

module.exports = { STORE_MENU, ADMIN_MENU };
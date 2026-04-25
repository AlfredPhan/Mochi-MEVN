<template>
  <div class="admin-layout admin-shell">
    <aside class="admin-rail">
      <div class="brand-block">
        <router-link to="/admin/dashboard" class="brand-mark">
          <span class="brand-symbol">M</span>
          <span>
            <strong>Mochi House</strong>
            <small>Back office</small>
          </span>
        </router-link>
      </div>

      <nav class="admin-nav" aria-label="Admin navigation">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
        >
          <span class="nav-code">{{ item.code }}</span>
          <span class="nav-copy">
            <strong>{{ item.label }}</strong>
            <small>{{ item.caption }}</small>
          </span>
        </router-link>
      </nav>

      <div class="rail-note">
        <span class="note-kicker">Studio note</span>
        <p>Keep the dashboard calm. The data should speak first.</p>
      </div>

      <div class="sidebar-footer">
        <router-link to="/" class="shop-link">Open storefront</router-link>

        <button @click="handleLogout" class="logout-btn">
          <span>Logout</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </aside>

    <main class="content admin-main">
      <header class="admin-topbar">
        <div>
          <p class="eyebrow">Admin Console</p>
          <h1>{{ currentTitle }}</h1>
        </div>

        <div class="topbar-status">
          <span class="status-dot"></span>
          <span>Live system</span>
        </div>
      </header>

      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const logout = inject('logout')
const router = useRouter()
const route = useRoute()

const navItems = [
  {
    to: '/admin/dashboard',
    code: '01',
    label: 'Dashboard',
    caption: 'Overview'
  },
  {
    to: '/admin/products',
    code: '02',
    label: 'Products',
    caption: 'Catalog'
  },
  {
    to: '/admin/orders',
    code: '03',
    label: 'Orders',
    caption: 'Fulfillment'
  },
  {
    to: '/admin/users',
    code: '04',
    label: 'Users',
    caption: 'Accounts'
  },
  {
    to: '/admin/reviews',
    code: '05',
    label: 'Reviews',
    caption: 'Feedback'
  },
  {
    to: '/admin/chats',
    code: '06',
    label: 'Chatbot',
    caption: 'Conversations'
  }
]

const currentTitle = computed(() => {
  const found = navItems.find(item => route.path.startsWith(item.to))
  return found?.label || 'Admin'
})

const handleLogout = () => {
  if (logout) logout()
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.admin-shell {
  --paper: #f4efe7;
  --paper-soft: #fbf7ef;
  --paper-card: rgba(255, 252, 246, 0.84);
  --ink: #211d18;
  --muted: #756c60;
  --faint: #a79b8d;
  --line: rgba(33, 29, 24, 0.14);
  --line-strong: rgba(33, 29, 24, 0.24);
  --accent: #8b4a2f;
  --accent-soft: #efe0d3;
  --danger: #9f2d20;
  --success: #426a4f;
  --warning: #9a6a21;

  min-height: 100vh;
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba(139, 74, 47, 0.12), transparent 34rem),
    linear-gradient(135deg, #f7f1e8 0%, #efe7da 100%);
  color: var(--ink);
  font-family: 'Instrument Sans', system-ui, sans-serif;
}

.admin-rail {
  min-height: 100vh;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: rgba(247, 241, 232, 0.72);
  backdrop-filter: blur(18px);
}

.brand-block {
  padding-bottom: 28px;
  border-bottom: 1px solid var(--line);
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}

.brand-symbol {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 1px solid var(--ink);
  border-radius: 50%;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.65rem;
  font-weight: 700;
  line-height: 1;
}

.brand-mark strong {
  display: block;
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.45rem;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.brand-mark small {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.admin-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 28px;
}

.nav-item {
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 14px;
  align-items: center;
  padding: 14px 12px;
  color: var(--ink);
  text-decoration: none;
  border-radius: 2px;
  border: 1px solid transparent;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.nav-item:hover {
  background: rgba(255, 252, 246, 0.66);
  border-color: var(--line);
  transform: translateX(3px);
}

.nav-item.router-link-active {
  background: var(--paper-card);
  border-color: var(--line-strong);
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: -21px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: var(--accent);
}

.nav-code {
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.nav-copy strong {
  display: block;
  font-size: 0.94rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.nav-copy small {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 0.76rem;
}

.rail-note {
  margin-top: auto;
  padding: 18px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.note-kicker {
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.66rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.rail-note p {
  margin: 8px 0 0;
  color: var(--muted);
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.25rem;
  line-height: 1.1;
}

.sidebar-footer {
  padding-top: 18px;
  display: grid;
  gap: 10px;
}

.shop-link,
.logout-btn {
  width: 100%;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.logout-btn:hover,
.shop-link:hover {
  background: var(--ink);
  color: var(--paper-soft);
  border-color: var(--ink);
}

.admin-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-topbar {
  height: 92px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 34px;
  border-bottom: 1px solid var(--line);
  background: rgba(247, 241, 232, 0.72);
  backdrop-filter: blur(16px);
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.13em;
}

.admin-topbar h1 {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 3vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.045em;
  line-height: 0.92;
}

.topbar-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 252, 246, 0.66);
  color: var(--muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--success);
}

.content-wrapper {
  flex: 1;
  padding: 34px;
  overflow-y: auto;
}

.content-wrapper::-webkit-scrollbar {
  width: 10px;
}

.content-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: rgba(33, 29, 24, 0.18);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 999px;
}

@media (max-width: 920px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-rail {
    min-height: auto;
    padding: 18px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .brand-block {
    padding-bottom: 16px;
  }

  .admin-nav {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .nav-item {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .nav-item.router-link-active::before,
  .rail-note {
    display: none;
  }

  .sidebar-footer {
    grid-template-columns: 1fr 1fr;
  }

  .admin-topbar {
    height: auto;
    padding: 18px;
  }

  .content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 560px) {
  .admin-nav,
  .sidebar-footer {
    grid-template-columns: 1fr 1fr;
  }

  .topbar-status {
    display: none;
  }
}
</style>

<style>
/* 
  Global polish layer for existing admin pages.
  Keep this unscoped so it can restyle router-view children.
*/

.admin-shell .content-wrapper .admin-chats,
.admin-shell .content-wrapper .admin-orders,
.admin-shell .content-wrapper .admin-products,
.admin-shell .content-wrapper .admin-reviews,
.admin-shell .content-wrapper .admin-users,
.admin-shell .content-wrapper .dashboard {
  max-width: 1440px;
  margin: 0 auto;
  color: var(--ink);
  font-family: 'Instrument Sans', system-ui, sans-serif;
}

/* Remove the generated-looking emoji system without touching templates */
.admin-shell .title-icon,
.admin-shell .card-icon,
.admin-shell .modal-icon,
.admin-shell .items-icon,
.admin-shell .empty-icon,
.admin-shell .stat-icon,
.admin-shell .contact-icon,
.admin-shell .meta-icon,
.admin-shell .preview-icon,
.admin-shell .kpi-icon,
.admin-shell .qi-icon {
  display: none !important;
}

.admin-shell .page-header {
  margin: 0 0 28px !important;
  padding: 0 0 26px !important;
  text-align: left !important;
  background: transparent !important;
  border: 0 !important;
  border-bottom: 1px solid var(--line) !important;
  border-radius: 0 !important;
}

.admin-shell .page-header::before {
  content: 'Management';
  display: block;
  margin-bottom: 10px;
  color: var(--accent);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.admin-shell .page-title,
.admin-shell .dash-title {
  margin: 0 !important;
  justify-content: flex-start !important;
  color: var(--ink) !important;
  font-family: 'Cormorant Garamond', serif !important;
  font-size: clamp(2.55rem, 5vw, 5.2rem) !important;
  font-weight: 500 !important;
  line-height: 0.92 !important;
  letter-spacing: -0.06em !important;
}

.admin-shell .page-subtitle,
.admin-shell .dash-sub,
.admin-shell .card-sub {
  max-width: 620px;
  margin-top: 12px !important;
  color: var(--muted) !important;
  font-size: 0.98rem !important;
  line-height: 1.55 !important;
}

/* Dashboard header */
.admin-shell .dash-header {
  margin-bottom: 28px !important;
  padding: 0 0 26px !important;
  align-items: flex-end !important;
  background: transparent !important;
  color: var(--ink) !important;
  border-radius: 0 !important;
  border-bottom: 1px solid var(--line) !important;
}

.admin-shell .dash-header::before {
  content: none !important;
}

.admin-shell .dash-date {
  color: var(--muted) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.72rem !important;
}

/* Cards */
.admin-shell .stats-row,
.admin-shell .kpi-grid {
  gap: 12px !important;
  margin-bottom: 26px !important;
}

.admin-shell .stat-card,
.admin-shell .kpi-card,
.admin-shell .table-card,
.admin-shell .form-card,
.admin-shell .chart-card,
.admin-shell .topsell-card,
.admin-shell .recent-card,
.admin-shell .quick-card {
  background: var(--paper-card) !important;
  border: 1px solid var(--line) !important;
  border-radius: 2px !important;
  box-shadow: none !important;
  backdrop-filter: blur(10px);
}

.admin-shell .stat-card,
.admin-shell .kpi-card {
  min-height: 132px;
  display: flex !important;
  align-items: flex-end !important;
  padding: 20px !important;
  position: relative;
  overflow: hidden;
}

.admin-shell .stat-card::before,
.admin-shell .kpi-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  height: auto !important;
  background: var(--accent) !important;
}

.admin-shell .stat-number,
.admin-shell .kpi-value {
  color: var(--ink) !important;
  font-family: 'Cormorant Garamond', serif !important;
  font-size: clamp(2.2rem, 4vw, 3.4rem) !important;
  font-weight: 500 !important;
  line-height: 0.9 !important;
  letter-spacing: -0.05em !important;
}

.admin-shell .stat-label,
.admin-shell .kpi-label {
  margin-top: 10px !important;
  color: var(--muted) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.12em !important;
}

.admin-shell .card-header,
.admin-shell .card-head {
  padding: 20px 22px !important;
  border-bottom: 1px solid var(--line) !important;
  background: transparent !important;
}

.admin-shell .card-title {
  margin: 0 !important;
  color: var(--ink) !important;
  font-family: 'Cormorant Garamond', serif !important;
  font-size: 1.55rem !important;
  font-weight: 600 !important;
  letter-spacing: -0.03em !important;
}

.admin-shell .products-count,
.admin-shell .orders-count,
.admin-shell .reviews-count,
.admin-shell .users-count,
.admin-shell .chats-count {
  color: var(--muted) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 400 !important;
}

/* Tables */
.admin-shell .table-container {
  overflow-x: auto;
}

.admin-shell table {
  width: 100%;
  border-collapse: collapse !important;
}

.admin-shell thead {
  background: rgba(33, 29, 24, 0.035) !important;
}

.admin-shell th {
  padding: 14px 16px !important;
  color: var(--muted) !important;
  border-bottom: 1px solid var(--line) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.66rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.12em !important;
}

.admin-shell td {
  padding: 16px !important;
  color: var(--ink) !important;
  border-bottom: 1px solid rgba(33, 29, 24, 0.08) !important;
  font-size: 0.9rem !important;
}

.admin-shell tbody tr {
  transition: background 140ms ease;
}

.admin-shell tbody tr:hover {
  background: rgba(139, 74, 47, 0.055) !important;
}

.admin-shell .product-name,
.admin-shell .customer-name,
.admin-shell .user-name,
.admin-shell .recent-name,
.admin-shell .ts-name {
  color: var(--ink) !important;
  font-weight: 650 !important;
  letter-spacing: -0.015em;
}

.admin-shell .product-description,
.admin-shell .customer-address,
.admin-shell .contact-email,
.admin-shell .contact-phone,
.admin-shell .user-id,
.admin-shell .product-id,
.admin-shell .time-ago,
.admin-shell .date,
.admin-shell .recent-date {
  color: var(--muted) !important;
}

/* Inputs, selects, form */
.admin-shell .product-form {
  padding: 22px !important;
}

.admin-shell .form-grid {
  gap: 16px !important;
}

.admin-shell label {
  margin-bottom: 8px !important;
  color: var(--muted) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.11em !important;
}

.admin-shell input,
.admin-shell select,
.admin-shell textarea,
.admin-shell .form-input,
.admin-shell .status-select,
.admin-shell .role-select {
  min-height: 42px;
  border: 1px solid var(--line-strong) !important;
  border-radius: 2px !important;
  background: rgba(255, 252, 246, 0.74) !important;
  color: var(--ink) !important;
  box-shadow: none !important;
  font: inherit !important;
  outline: none !important;
}

.admin-shell input:focus,
.admin-shell select:focus,
.admin-shell textarea:focus,
.admin-shell .form-input:focus {
  border-color: var(--accent) !important;
  background: #fffaf2 !important;
}

.admin-shell .form-actions {
  margin-top: 20px !important;
  display: flex;
  gap: 10px;
}

/* Buttons */
.admin-shell .btn,
.admin-shell .btn-primary,
.admin-shell .btn-secondary,
.admin-shell .btn-danger,
.admin-shell .period-pill,
.admin-shell .view-all,
.admin-shell .read-more-btn,
.admin-shell .btn-toggle {
  min-height: 38px;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px !important;
  border: 1px solid var(--line-strong) !important;
  border-radius: 999px !important;
  background: transparent !important;
  color: var(--ink) !important;
  box-shadow: none !important;
  font-family: 'Instrument Sans', system-ui, sans-serif !important;
  font-size: 0.82rem !important;
  font-weight: 650 !important;
  text-decoration: none !important;
  cursor: pointer;
}

.admin-shell .btn:hover,
.admin-shell .btn-primary:hover,
.admin-shell .btn-secondary:hover,
.admin-shell .period-pill:hover,
.admin-shell .view-all:hover,
.admin-shell .read-more-btn:hover,
.admin-shell .btn-toggle:hover {
  background: var(--ink) !important;
  color: var(--paper-soft) !important;
}

.admin-shell .btn-danger,
.admin-shell .btn-delete {
  border-color: rgba(159, 45, 32, 0.35) !important;
  color: var(--danger) !important;
}

.admin-shell .btn-danger:hover,
.admin-shell .btn-delete:hover:not(:disabled) {
  background: var(--danger) !important;
  color: #fffaf2 !important;
}

/* Existing emoji action buttons become text */
.admin-shell .btn-action {
  min-width: auto !important;
  height: 34px !important;
  padding: 0 11px !important;
  border: 1px solid var(--line) !important;
  border-radius: 999px !important;
  background: transparent !important;
  color: var(--ink) !important;
  font-size: 0 !important;
}

.admin-shell .btn-edit::before,
.admin-shell .btn-detail::before,
.admin-shell .btn-view::before,
.admin-shell .btn-delete::before {
  font-size: 0.72rem;
  font-weight: 650;
}

.admin-shell .btn-edit::before {
  content: 'Edit';
}

.admin-shell .btn-detail::before,
.admin-shell .btn-view::before {
  content: 'View';
}

.admin-shell .btn-delete::before {
  content: 'Delete';
}

/* Badges */
.admin-shell .status-badge,
.admin-shell .stock-badge,
.admin-shell .flavor-tag,
.admin-shell .payment-method,
.admin-shell .chip,
.admin-shell .badge,
.admin-shell .role-select,
.admin-shell .status-select {
  border-radius: 999px !important;
  border: 1px solid var(--line) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em;
}

.admin-shell .status-paid,
.admin-shell .badge-paid,
.admin-shell .in-stock,
.admin-shell .chip-green,
.admin-shell .role-user,
.admin-shell .status-badge.active {
  background: rgba(66, 106, 79, 0.12) !important;
  color: var(--success) !important;
  border-color: rgba(66, 106, 79, 0.28) !important;
}

.admin-shell .status-pending,
.admin-shell .badge-pending,
.admin-shell .low-stock,
.admin-shell .chip-yellow,
.admin-shell .role-admin {
  background: rgba(154, 106, 33, 0.12) !important;
  color: var(--warning) !important;
  border-color: rgba(154, 106, 33, 0.28) !important;
}

.admin-shell .status-cancelled,
.admin-shell .badge-cancelled,
.admin-shell .out-of-stock {
  background: rgba(159, 45, 32, 0.1) !important;
  color: var(--danger) !important;
  border-color: rgba(159, 45, 32, 0.26) !important;
}

/* Avatars */
.admin-shell .customer-avatar,
.admin-shell .user-avatar,
.admin-shell .recent-avatar,
.admin-shell .message-avatar {
  border: 1px solid var(--line-strong) !important;
  border-radius: 50% !important;
  background: var(--paper-soft) !important;
  color: var(--ink) !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.72rem !important;
  font-weight: 600 !important;
  box-shadow: none !important;
}

.admin-shell .message-avatar span {
  font-size: 0 !important;
}

.admin-shell .message-avatar::before {
  content: 'U';
}

.admin-shell .message-avatar.bot-avatar::before {
  content: 'B';
}

/* Product images */
.admin-shell .product-thumb,
.admin-shell .avatar-img {
  border-radius: 2px !important;
  border: 1px solid var(--line) !important;
  box-shadow: none !important;
}

/* Empty and loading */
.admin-shell .empty-state,
.admin-shell .loading-state,
.admin-shell .chart-loading {
  padding: 64px 24px !important;
  color: var(--muted) !important;
  background: transparent !important;
}

.admin-shell .empty-state h3 {
  margin: 0 0 8px !important;
  color: var(--ink) !important;
  font-family: 'Cormorant Garamond', serif !important;
  font-size: 2rem !important;
  font-weight: 600 !important;
  letter-spacing: -0.04em !important;
}

.admin-shell .loading-spinner,
.admin-shell .spinner {
  border-color: rgba(33, 29, 24, 0.12) !important;
  border-top-color: var(--accent) !important;
}

/* Modal */
.admin-shell .modal-overlay {
  background: rgba(33, 29, 24, 0.46) !important;
  backdrop-filter: blur(8px);
}

.admin-shell .modal-content {
  border: 1px solid var(--line) !important;
  border-radius: 2px !important;
  background: var(--paper-soft) !important;
  box-shadow: 0 30px 90px rgba(33, 29, 24, 0.25) !important;
}

.admin-shell .modal-header,
.admin-shell .modal-footer {
  background: transparent !important;
  border-color: var(--line) !important;
}

.admin-shell .modal-title {
  color: var(--ink) !important;
  font-family: 'Cormorant Garamond', serif !important;
  font-size: 2rem !important;
  font-weight: 600 !important;
  letter-spacing: -0.04em !important;
}

.admin-shell .modal-close {
  border: 1px solid var(--line) !important;
  border-radius: 50% !important;
  background: transparent !important;
  color: var(--ink) !important;
}

.admin-shell .summary-item,
.admin-shell .detail-item,
.admin-shell .item-card,
.admin-shell .warning-info,
.admin-shell .comment-content {
  border: 1px solid var(--line) !important;
  border-radius: 2px !important;
  background: rgba(255, 252, 246, 0.58) !important;
}

.admin-shell .warning-note {
  border-color: rgba(159, 45, 32, 0.24) !important;
  border-radius: 2px !important;
  background: rgba(159, 45, 32, 0.08) !important;
  color: var(--danger) !important;
}

/* Chat sessions */
.admin-shell .chat-session {
  border: 1px solid var(--line) !important;
  border-radius: 2px !important;
  background: var(--paper-card) !important;
  box-shadow: none !important;
}

.admin-shell .session-header,
.admin-shell .message-preview,
.admin-shell .messages-container {
  border-color: var(--line) !important;
  background: transparent !important;
}

.admin-shell .message-bubble {
  border: 1px solid var(--line) !important;
  border-radius: 2px !important;
  box-shadow: none !important;
}

.admin-shell .message.user .message-bubble {
  background: var(--ink) !important;
  color: var(--paper-soft) !important;
}

.admin-shell .message.bot .message-bubble {
  background: rgba(255, 252, 246, 0.74) !important;
  color: var(--ink) !important;
}

/* Stars without emoji heaviness */
.admin-shell .star {
  font-size: 0 !important;
}

.admin-shell .star::before {
  content: '○';
  color: var(--faint);
  font-size: 0.82rem;
}

.admin-shell .star.filled::before {
  content: '●';
  color: var(--accent);
}

/* Dashboard-specific charts */
.admin-shell .period-pill.active {
  background: var(--ink) !important;
  color: var(--paper-soft) !important;
}

.admin-shell .bar-wrap,
.admin-shell .ts-bar-wrap,
.admin-shell .sb-bar-wrap {
  background: rgba(33, 29, 24, 0.08) !important;
  border-radius: 999px !important;
}

.admin-shell .bar-fill,
.admin-shell .ts-bar,
.admin-shell .sb-bar {
  background: var(--accent) !important;
  border-radius: 999px !important;
}

.admin-shell .quick-item {
  border: 1px solid var(--line) !important;
  border-radius: 2px !important;
  background: rgba(255, 252, 246, 0.58) !important;
  color: var(--ink) !important;
  box-shadow: none !important;
}

.admin-shell .quick-item:hover {
  background: var(--ink) !important;
  color: var(--paper-soft) !important;
  transform: none !important;
}

/* Responsive polish */
@media (max-width: 768px) {
  .admin-shell .page-title,
  .admin-shell .dash-title {
    font-size: 3rem !important;
  }

  .admin-shell .stats-row,
  .admin-shell .kpi-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .admin-shell .card-header,
  .admin-shell .card-head,
  .admin-shell .product-form {
    padding: 16px !important;
  }

  .admin-shell th,
  .admin-shell td {
    padding: 12px !important;
  }
}

@media (max-width: 520px) {
  .admin-shell .stats-row,
  .admin-shell .kpi-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
import React, { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

// ── Nav structure with nested collapsible groups ─────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Dashboard',
    to:    '/buyer/dashboard',
    icon:  (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Marketplace',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    children: [
      { label: 'Browse Crops',       to: '/buyer/marketplace' },
      { label: 'Shortlisted Crops',  to: '/buyer/marketplace/shortlisted' },
    ],
  },
  {
    label: 'Requirements',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    children: [
      { label: 'My Requirements',     to: '/buyer/requirements' },
      { label: 'Create Requirement', to: '/buyer/requirements/create' },
    ],
  },
  {
    label: 'AI Centre',
    badge: 'AI',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    children: [
      { label: 'Buyer Match',     to: '/buyer/ai' },
      { label: 'Demand Forecast', to: '/buyer/ai/demand-forecast' },
    ],
  },
  {
    label: 'Bookings & Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    children: [
      { label: 'Bookings',          to: '/buyer/bookings' },
      { label: 'Orders',           to: '/buyer/orders' },
      { label: 'Delivery Tracking', to: '/buyer/delivery' },
      { label: 'Payments',         to: '/buyer/payments' },
      { label: 'Traceability',     to: '/buyer/traceability' },
    ],
  },
  {
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    children: [
      { label: 'Personal / Business',  to: '/buyer/profile' },
      { label: 'Verification',         to: '/buyer/profile/verification' },
      { label: 'Payment Details',     to: '/buyer/profile/payment-details' },
      { label: 'Notifications',       to: '/buyer/profile/notifications' },
      { label: 'Settings',            to: '/buyer/profile/settings' },
    ],
  },
]

// ── Collapsible nav group ─────────────────────────────────────────────────────
function NavGroup({ group, onClose }) {
  const location = useLocation()
  const hasChildren = group.children && group.children.length > 0
  const childPaths = hasChildren ? group.children.map(c => c.to) : [group.to]

  // Auto-expand if any child route is active
  const isChildActive = childPaths.some(path => location.pathname === path || location.pathname.startsWith(path + '/'))
  const [open, setOpen] = useState(isChildActive)

  if (!hasChildren) {
    return (
      <NavLink
        to={group.to}
        onClick={onClose}
        className={({ isActive }) =>
          isActive ? 'sidebar-link-active' : 'sidebar-link'
        }
      >
        {group.icon}
        <span className="flex-1">{group.label}</span>
      </NavLink>
    )
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen(!open)}
        className={`sidebar-link w-full text-left ${isChildActive ? 'text-agri-green font-semibold' : ''}`}
      >
        {group.icon}
        <span className="flex-1">{group.label}</span>
        {group.badge && (
          <span className="bg-agri-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {group.badge}
          </span>
        )}
        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <div className="ml-5 pl-4 border-l border-gray-100 space-y-0.5">
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-xs font-medium transition-colors
                ${isActive
                  ? 'text-agri-green bg-agri-light font-semibold'
                  : 'text-gray-500 hover:text-agri-green hover:bg-gray-50'}`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BuyerSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-agri-green rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">AF</span>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900">AgriFlow</span>
            <span className="text-base font-bold text-agri-green"> AI</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1 pl-10">Buyer Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <NavGroup key={group.label} group={group} onClose={onClose} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 space-y-0.5">
        <NavLink to="/buyer/profile" onClick={onClose} className="sidebar-link">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative w-72 bg-white h-full shadow-2xl z-50">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}

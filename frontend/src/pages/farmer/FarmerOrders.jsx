import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/farmer/orders',           label: 'Bookings',         end: true  },
  { to: '/farmer/orders/active',    label: 'Orders',           end: false },
  { to: '/farmer/pickup-delivery',  label: 'Pickup & Delivery',end: false },
  { to: '/farmer/earnings',         label: 'Earnings',         end: false },
  { to: '/farmer/traceability',    label: 'Traceability',      end: false },
]

export default function FarmerOrders() {
  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${isActive
                ? 'bg-white text-agri-green shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-700'}`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}

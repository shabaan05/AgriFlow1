import React from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { DemandProvider } from '../../context/DemandContext.jsx'

const TABS = [
  { to: '/farmer/demand',              label: 'Market Demand',      end: true  },
  { to: '/farmer/demand/buyers',       label: 'Buyer Requirements', end: false },
  { to: '/farmer/demand/opportunities',label: 'Opportunities',      end: false },
]

export default function FarmerDemand() {
  const { pathname } = useLocation()

  // Redirect /farmer/demand base to itself (Outlet handles the index)
  return (
    <DemandProvider>
      <div>
        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit flex-wrap">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-white text-agri-green shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-700'}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* Page content */}
        <Outlet />
      </div>
    </DemandProvider>
  )
}

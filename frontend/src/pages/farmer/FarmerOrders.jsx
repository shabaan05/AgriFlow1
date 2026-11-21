import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from '../../context/LanguageContext.jsx'

export default function FarmerOrders() {
  const { t } = useTranslation()
  const TABS = [
    { to: '/farmer/orders',           label: t('bookings_tab','Bookings'),           end: true  },
    { to: '/farmer/orders/active',    label: t('orders_tab','Orders'),               end: false },
    { to: '/farmer/pickup-delivery',  label: t('pickup_delivery_tab','Pickup & Delivery'), end: false },
    { to: '/farmer/earnings',         label: t('earnings_tab','Earnings'),           end: false },
    { to: '/farmer/traceability',     label: t('traceability_tab','Traceability'),   end: false },
  ]

  return (
    <div>
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

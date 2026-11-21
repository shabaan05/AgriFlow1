import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { DemandProvider } from '../../context/DemandContext.jsx'
import { useTranslation } from '../../context/LanguageContext.jsx'

export default function FarmerDemand() {
  const { t } = useTranslation()
  const TABS = [
    { to: '/farmer/demand',               label: t('market_demand_tab','Market Demand'),          end: true  },
    { to: '/farmer/demand/buyers',        label: t('buyer_requirements_tab','Buyer Requirements'), end: false },
    { to: '/farmer/demand/opportunities', label: t('opportunities_tab','Opportunities'),           end: false },
  ]

  return (
    <DemandProvider>
      <div>
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
        <Outlet />
      </div>
    </DemandProvider>
  )
}

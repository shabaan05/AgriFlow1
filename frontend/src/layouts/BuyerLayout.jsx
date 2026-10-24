import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BuyerSidebar from '../components/buyer/BuyerSidebar.jsx'
import BuyerHeader  from '../components/buyer/BuyerHeader.jsx'

export default function BuyerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <BuyerSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <BuyerHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

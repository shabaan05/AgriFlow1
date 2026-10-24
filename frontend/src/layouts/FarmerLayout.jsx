import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import FarmerSidebar from '../components/farmer/FarmerSidebar.jsx'
import FarmerHeader  from '../components/farmer/FarmerHeader.jsx'

export default function FarmerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FarmerSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <FarmerHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

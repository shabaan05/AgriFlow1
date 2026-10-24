import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TransporterSidebar from '../components/transporter/TransporterSidebar.jsx'
import TransporterHeader  from '../components/transporter/TransporterHeader.jsx'

export default function TransporterLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TransporterSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TransporterHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

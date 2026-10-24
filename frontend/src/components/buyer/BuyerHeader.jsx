import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function BuyerHeader({ onMenuClick }) {
  const { user } = useAuth()
  const [notifOpen, setNotifOpen] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'BK'

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      {/* Left: hamburger + search */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="relative hidden sm:flex items-center max-w-xs w-full">
          <svg className="absolute left-3 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search crops, suppliers..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl w-full
                       focus:outline-none focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green/50
                       placeholder-gray-400 transition-all"
          />
        </div>
      </div>

      {/* Right: notifications + profile */}
      <div className="flex items-center gap-2 ml-3">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-lg border border-gray-100 z-50">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">🌾</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">New crop available matching your requirement</p>
                    <p className="text-xs text-gray-400 mt-0.5">1 hour ago</p>
                  </div>
                </div>
                <div className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs">📦</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-800">Your booking was accepted by the farmer</p>
                    <p className="text-xs text-gray-400 mt-0.5">3 hours ago</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-gray-100">
                <button className="text-xs text-agri-green font-medium w-full text-center hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 bg-agri-green rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || 'Buyer'}</p>
            <p className="text-xs text-gray-400 leading-tight">Buyer Portal</p>
          </div>
        </div>
      </div>
    </header>
  )
}

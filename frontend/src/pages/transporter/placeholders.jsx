import React from 'react'
import PlaceholderPage from '../../components/common/PlaceholderPage.jsx'

export function TransporterPickups() {
  return (
    <PlaceholderPage
      title="Pickup Requests"
      icon="📋"
      subtitle="View and accept available pickup requests from farmers whose orders are ready for collection."
      comingNext
    />
  )
}

export function TransporterTrips() {
  return (
    <PlaceholderPage
      title="My Trips"
      icon="🚛"
      subtitle="Manage your upcoming, active, and completed delivery trips."
      comingNext
    />
  )
}

export function TransporterRoutes() {
  return (
    <PlaceholderPage
      title="Route Optimization"
      icon="🗺️"
      subtitle="AI-powered route planning to reduce travel time, fuel costs, and maximise deliveries."
      comingNext
    />
  )
}

export function TransporterEarnings() {
  return (
    <PlaceholderPage
      title="Earnings"
      icon="💰"
      subtitle="Track your delivery earnings, completed trips, pending payments, and payout history."
      comingNext
    />
  )
}

export function TransporterProfile() {
  return (
    <PlaceholderPage
      title="Profile"
      icon="👤"
      subtitle="Manage your personal information, vehicle details, verification status, and payment details."
      comingNext
    />
  )
}

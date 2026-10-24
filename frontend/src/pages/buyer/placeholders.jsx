/**
 * Buyer placeholder pages — lightweight pages for routes that aren't built yet.
 * Each exports a default component that renders the existing PlaceholderPage.
 */
import React from 'react'
import PlaceholderPage from '../../components/common/PlaceholderPage.jsx'

// ── Marketplace ──────────────────────────────────────────────────────────────
export function MarketplaceBrowse() {
  return (
    <PlaceholderPage
      title="Marketplace — Browse Crops"
      icon="🛒"
      subtitle="Browse available crops from verified farmers across your region. Search, filter and shortlist crops that match your procurement needs."
      comingNext
    />
  )
}

export function MarketplaceShortlisted() {
  return (
    <PlaceholderPage
      title="Shortlisted Crops"
      icon="⭐"
      subtitle="Crops you've shortlisted for quick access and comparison."
      comingNext
    />
  )
}

// ── Requirements ──────────────────────────────────────────────────────────────
export function MyRequirements() {
  return (
    <PlaceholderPage
      title="My Requirements"
      icon="📋"
      subtitle="View and manage your crop requirements. Track matching supply and requirement status."
      comingNext
    />
  )
}

export function CreateRequirement() {
  return (
    <PlaceholderPage
      title="Create Requirement"
      icon="➕"
      subtitle="Post a new crop requirement with quantity, quality, delivery date and location preferences."
      comingNext
    />
  )
}

// ── AI Centre ────────────────────────────────────────────────────────────────
export function BuyerAICentre() {
  return (
    <PlaceholderPage
      title="AI Centre — Buyer Match"
      icon="🤖"
      subtitle="AI-powered buyer matching recommends the best crops and farmers based on your requirements, quality needs and budget."
      comingNext
    />
  )
}

export function DemandForecast() {
  return (
    <PlaceholderPage
      title="Demand Forecast"
      icon="📊"
      subtitle="AI-driven demand forecasting to help you plan procurement ahead of market trends."
      comingNext
    />
  )
}

// ── Bookings & Orders ─────────────────────────────────────────────────────────
export function BuyerBookings() {
  return (
    <PlaceholderPage
      title="Bookings"
      icon="📋"
      subtitle="Track booking requests you've sent to farmers. View status, accept responses and convert to orders."
      comingNext
    />
  )
}

export function BuyerOrders() {
  return (
    <PlaceholderPage
      title="Orders"
      icon="📦"
      subtitle="View all your active and completed orders with full status tracking."
      comingNext
    />
  )
}

export function DeliveryTracking() {
  return (
    <PlaceholderPage
      title="Delivery Tracking"
      icon="🚛"
      subtitle="Track your deliveries from pickup to drop-off. Real-time GPS tracking coming soon."
      comingNext
    />
  )
}

export function BuyerPayments() {
  return (
    <PlaceholderPage
      title="Payments"
      icon="💰"
      subtitle="View payment history, pending payments and transaction records for your orders."
      comingNext
    />
  )
}

export function BuyerTraceability() {
  return (
    <PlaceholderPage
      title="Traceability"
      icon="🔗"
      subtitle="Track the complete journey of your purchased crops from harvest to delivery."
      comingNext
    />
  )
}

// ── Profile ──────────────────────────────────────────────────────────────────
export function BuyerProfile() {
  return (
    <PlaceholderPage
      title="Personal / Business Profile"
      icon="👤"
      subtitle="Manage your personal contact details and business information."
      comingNext
    />
  )
}

export function BuyerVerification() {
  return (
    <PlaceholderPage
      title="Verification"
      icon="✓"
      subtitle="Verify your buyer account and business credentials."
      comingNext
    />
  )
}

export function BuyerPaymentDetails() {
  return (
    <PlaceholderPage
      title="Payment Details"
      icon="🏦"
      subtitle="Manage your bank account and UPI payment details for transactions."
      comingNext
    />
  )
}

export function BuyerNotifications() {
  return (
    <PlaceholderPage
      title="Notifications"
      icon="🔔"
      subtitle="View and manage your notifications and notification preferences."
      comingNext
    />
  )
}

export function BuyerSettings() {
  return (
    <PlaceholderPage
      title="Settings"
      icon="⚙️"
      subtitle="Change your password, manage preferences and account settings."
      comingNext
    />
  )
}

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }        from 'react-router-dom'
import { fetchMarketplaceCropById }      from '../../../services/marketplaceApi.js'
import { ShortlistProvider, useShortlist } from '../../../context/ShortlistContext.jsx'
import BookingModal                      from '../../../components/buyer/BookingModal.jsx'

function Section({ title, children }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value, highlight, large }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right
        ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}
        ${large ? 'text-base' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}

const statusCls = {
  'Pre-Harvest':   'bg-orange-100 text-orange-700',
  'Harvest Ready': 'bg-emerald-100 text-emerald-700',
  'Harvested':     'bg-teal-100 text-teal-700',
  'Booked':        'bg-violet-100 text-violet-700',
}

function CropDetailContent() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { isShortlisted, toggleShortlist } = useShortlist()

  const [crop,         setCrop]         = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [showBooking,  setShowBooking]  = useState(false)
  const [bookingDone,  setBookingDone]  = useState(false)
  const [bookedId,     setBookedId]     = useState(null)

  useEffect(() => {
    fetchMarketplaceCropById(id)
      .then(setCrop)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  function handleBookingSuccess(booking) {
    setShowBooking(false)
    setBookingDone(true)
    setBookedId(booking.id)
  }

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-5">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        {[1,2,3].map((i) => <div key={i} className="card h-32" />)}
      </div>
    )
  }

  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Crop not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/buyer/marketplace')} className="btn-primary mt-4 text-sm px-6">
          Back to Marketplace
        </button>
      </div>
    )
  }

  const saved = isShortlisted(crop.id)
  const harvestDate = crop.expectedHarvestDate
    ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const availPct = crop.totalQty > 0 ? Math.round((crop.availableQty / crop.totalQty) * 100) : 0

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button onClick={() => navigate('/buyer/marketplace')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Marketplace
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{crop.name}</h1>
            <span className={`status-badge text-xs ${statusCls[crop.status] || 'bg-gray-100 text-gray-600'}`}>
              {crop.status}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{crop.variety || crop.category} · {crop.farmLocation}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleShortlist(crop)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors
              ${saved
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-white border-gray-200 text-gray-600 hover:border-agri-green/40 hover:text-agri-green'}`}
          >
            <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={saved ? 0 : 2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {saved ? 'Shortlisted' : 'Shortlist'}
          </button>
          {bookingDone ? (
            <button
              onClick={() => navigate('/buyer/bookings')}
              className="btn-primary text-sm px-5 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Booking Sent
            </button>
          ) : (
            <button
              onClick={() => setShowBooking(true)}
              className="btn-primary text-sm px-5"
              disabled={crop.availableQty <= 0}
              title={crop.availableQty <= 0 ? 'No stock available' : 'Book this crop'}
            >
              Book / Pre-book
            </button>
          )}
        </div>
      </div>

      {/* Booking success banner */}
      {bookingDone && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Booking request sent successfully! The farmer will review and respond.
          </div>
          <button
            onClick={() => navigate(bookedId ? `/buyer/bookings/${bookedId}` : '/buyer/bookings')}
            className="text-agri-green font-semibold hover:underline ml-4 flex-shrink-0"
          >
            View Booking →
          </button>
        </div>
      )}

      {/* Availability bar */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
          Quantity & Availability
        </h3>
        <div className="flex gap-6 mb-4 flex-wrap">
          {[
            { label: 'Total',     v: `${crop.totalQty?.toLocaleString()} ${crop.unit}`,     cls: 'text-gray-900' },
            { label: 'Available', v: `${crop.availableQty?.toLocaleString()} ${crop.unit}`,  cls: 'text-agri-green' },
          ].map(({ label, v, cls }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${cls}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Availability</span><span>{availPct}% remaining</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-agri-green rounded-full transition-all duration-700" style={{ width: `${availPct}%` }} />
        </div>
      </div>

      <Section title="Crop Details">
        <Row label="Crop Name"     value={crop.name} />
        <Row label="Variety"       value={crop.variety} />
        <Row label="Category"      value={crop.category} />
        <Row label="Quality Grade" value={crop.grade} />
        <Row label="Status"        value={crop.status} />
      </Section>

      <Section title="Pricing">
        <Row label="Listed Price"          value={`₹${crop.expectedPrice}/${crop.unit}`} highlight large />
        <Row label="Min. Acceptable Price" value={crop.minPrice ? `₹${crop.minPrice}/${crop.unit}` : '—'} />
      </Section>

      <Section title="Harvest & Freshness">
        <Row label="Expected Harvest Date" value={harvestDate} />
        <Row label="Shelf Life"            value={crop.shelfLifeDays ? `${crop.shelfLifeDays} days` : '—'} />
        <Row label="Farm Location"         value={crop.farmLocation} />
      </Section>

      {crop.notes && (
        <Section title="Notes">
          <p className="text-sm text-gray-700 leading-relaxed">{crop.notes}</p>
        </Section>
      )}

      {/* Farmer section */}
      {crop.farmer ? (
        <Section title="Farmer">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-agri-green rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                {crop.farmer.name?.charAt(0)?.toUpperCase() || 'F'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{crop.farmer.name}</p>
                <p className="text-xs text-gray-400">{crop.farmer.farmLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {crop.farmer.verification === 'Verified' && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">✓ Verified</span>
              )}
              <button
                onClick={() => navigate(`/buyer/marketplace/farmer/${crop.farmer.id}`)}
                className="btn-outline text-xs px-4 py-2"
              >
                View Farmer
              </button>
            </div>
          </div>
          <Row label="Farm Name"    value={crop.farmer.farmName} />
          <Row label="Farming Type" value={crop.farmer.farmingType} />
        </Section>
      ) : (
        <Section title="Farmer">
          <p className="text-sm text-gray-400">Farmer information not linked yet.</p>
        </Section>
      )}

      {/* Traceability note */}
      <div className="bg-agri-light border border-green-200 rounded-xl px-4 py-3 text-xs text-agri-green font-medium flex items-center gap-2">
        <span>🔗</span>
        This crop will have end-to-end traceability once booked and delivered through AgriFlow AI.
      </div>

      {/* Booking modal */}
      {showBooking && (
        <BookingModal
          crop={crop}
          onSuccess={handleBookingSuccess}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  )
}

export default function CropDetailPage() {
  return (
    <ShortlistProvider>
      <CropDetailContent />
    </ShortlistProvider>
  )
}

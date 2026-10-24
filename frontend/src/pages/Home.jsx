import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

/* ─── Navbar ──────────────────────────────────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-agri-green rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AF</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-gray-900">AgriFlow</span>
              <span className="text-agri-green"> AI</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {['About', 'How It Works', 'Features'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-sm font-medium text-gray-600 hover:text-agri-green transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/farmer/login"
              className="text-sm font-semibold text-agri-green hover:text-agri-dark transition-colors px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/farmer/login"
              className="btn-primary text-sm py-2 px-5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-gray-100 mt-1">
            {['About', 'How It Works', 'Features'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={() => setOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link
              to="/farmer/login"
              className="block px-3 py-2 text-sm font-semibold text-agri-green"
              onClick={() => setOpen(false)}
            >
              Login / Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate()
  return (
    <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px]
                        bg-gradient-to-br from-agri-light via-green-50 to-white rounded-full
                        opacity-70 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-agri-light text-agri-green
                        text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-green-200">
          <span className="w-2 h-2 bg-agri-green rounded-full animate-pulse"></span>
          AI-Powered Agricultural Platform
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
          AgriFlow <span className="text-agri-green">AI</span>
        </h1>

        <p className="text-2xl sm:text-3xl font-semibold text-gray-600 mt-3">
          Smart Agricultural Supply Chain
        </p>

        <p className="text-lg sm:text-xl font-medium text-agri-green mt-4 tracking-widest uppercase">
          Connect · Predict · Sell · Deliver
        </p>

        <p className="mt-6 text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          AgriFlow AI connects farmers, buyers and transporters through an
          intelligent supply-chain platform — using AI-driven decision support
          to improve coordination, reduce waste, and maximise farm income.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/farmer/login')}
            className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto"
          >
            Enter as Farmer
          </button>
          <a
            href="#how-it-works"
            className="btn-outline text-base px-8 py-3.5 w-full sm:w-auto"
          >
            How It Works
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Role Cards ──────────────────────────────────────────────────────────── */
function RoleCards() {
  const navigate = useNavigate()

  const roles = [
    {
      id:          'farmer',
      icon:        '🌾',
      title:       'Farmer',
      description: 'Sell smarter with AI-powered demand forecasting, buyer matching, and crop intelligence tailored to your harvest.',
      cta:         'Enter as Farmer',
      active:      true,
      onClick:     () => navigate('/farmer/login'),
      accent:      'border-agri-green',
      badge:       null,
    },
    {
      id:          'buyer',
      icon:        '🛒',
      title:       'Buyer',
      description: 'Find the right crops, quantities and suppliers. Direct access to verified farm produce across regions.',
      cta:         'Enter as Buyer',
      active:      true,
      onClick:     () => navigate('/buyer/login'),
      accent:      'border-agri-green',
      badge:       null,
    },
    {
      id:          'transporter',
      icon:        '🚛',
      title:       'Transporter',
      description: 'Manage pickups, route planning and optimise agricultural deliveries with real-time coordination tools.',
      cta:         'Enter as Transporter',
      active:      true,
      onClick:     () => navigate('/transporter/login'),
      accent:      'border-agri-green',
      badge:       null,
    },
  ]

  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Who uses AgriFlow AI?</h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            One platform connecting every stakeholder in the agricultural supply chain.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`relative rounded-2xl border-2 ${role.accent} p-7 flex flex-col gap-5
                         transition-all duration-300
                         ${role.active
                           ? 'shadow-lg hover:shadow-xl hover:-translate-y-1 bg-white'
                           : 'bg-gray-50/60 opacity-80'}`}
            >
              {role.badge && (
                <span className="absolute top-4 right-4 text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {role.badge}
                </span>
              )}
              {role.active && (
                <span className="absolute top-4 right-4 text-xs font-semibold text-agri-green bg-agri-light px-3 py-1 rounded-full">
                  Available Now
                </span>
              )}

              <div className="w-14 h-14 bg-agri-light rounded-2xl flex items-center justify-center text-3xl">
                {role.icon}
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">{role.description}</p>
              </div>

              <button
                onClick={role.onClick}
                disabled={!role.active}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200
                  ${role.active
                    ? 'bg-agri-green text-white hover:bg-agri-dark shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {role.active ? role.cta : 'Coming Soon'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ────────────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { step: '01', title: 'Register your farm',    body: 'Farmers register and list their crops with grade, quantity, and availability.' },
    { step: '02', title: 'AI analyses demand',     body: 'Our AI agents scan market demand, buyer requirements, and pricing trends.' },
    { step: '03', title: 'Get matched to buyers',  body: 'The Buyer Match Agent surfaces the most relevant buyers for your produce.' },
    { step: '04', title: 'Coordinate & deliver',   body: 'Book transport, track orders, and receive payments — all in one place.' },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            From farm registration to final delivery in four intelligent steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
              <div className="text-4xl font-extrabold text-agri-light mb-4 leading-none">{s.step}</div>
              <h3 className="font-semibold text-gray-900 text-base">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Features ────────────────────────────────────────────────────────────── */
function Features() {
  const features = [
    {
      icon: '🤖',
      title: 'Agentic AI Decision Support',
      body: 'Four specialised AI agents handle buyer matching, harvest planning, shelf-life monitoring, and wastage prevention autonomously.',
    },
    {
      icon: '📊',
      title: 'Real-Time Demand Intelligence',
      body: 'Live market demand signals help farmers decide what to grow, when to harvest, and what price to expect.',
    },
    {
      icon: '🔗',
      title: 'End-to-End Supply Chain',
      body: 'Connects every actor — farmer, buyer, and transporter — in a single coordinated platform.',
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      body: 'Fully responsive interface designed for farmers who manage their business from the field, not just the office.',
    },
    {
      icon: '🌍',
      title: 'Regional & Multi-Crop Support',
      body: 'Built for India\'s diverse agricultural landscape with support for multiple crops, languages, and regions.',
    },
    {
      icon: '🔒',
      title: 'Secure & Trustworthy',
      body: 'Tamper-resistant record-keeping for transactions, bookings, and delivery confirmations.',
    },
  ]

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Platform Features</h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            Everything you need to run a smarter agricultural supply chain.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 bg-agri-light rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-agri-green rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">AF</span>
              </div>
              <span className="text-white font-bold text-lg">AgriFlow AI</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Smart Agricultural Supply Chain. Connecting farmers, buyers, and transporters with AI-driven intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-white font-semibold mb-3">Platform</p>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Portals</p>
              <ul className="space-y-2">
                <li><a href="/farmer/login" className="hover:text-white transition-colors">Farmer Login</a></li>
                <li><a href="/buyer/login" className="hover:text-white transition-colors">Buyer Login</a></li>
                <li><span className="text-gray-600">Transporter — Coming Soon</span></li>              </ul>
            </div>
            <div>
              <p className="text-white font-semibold mb-3">Project</p>
              <ul className="space-y-2">
                <li><span className="text-gray-600">Final Year Project</span></li>
                <li><span className="text-gray-600">AgriFlow AI v0.1</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs">© 2026 AgriFlow AI. All rights reserved.</p>
          <p className="text-xs">Built with React · Vite · Tailwind CSS</p>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <RoleCards />
      <HowItWorks />
      <Features />
      <Footer />
    </div>
  )
}

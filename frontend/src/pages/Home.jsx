import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import LanguageSelector from '../components/common/LanguageSelector.jsx'
import { useTranslation } from '../context/LanguageContext.jsx'
import { translations } from '../locales/translations.js'

/* ─── Floating Centered Glassmorphic Navbar ────────────────────────────────── */
function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-3.5 sm:pt-4 pointer-events-none transition-all duration-300">
      <nav
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-300 rounded-full border ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/[0.04] border-gray-200/70 py-2 px-3 sm:px-4'
            : 'bg-white/70 backdrop-blur-lg shadow-md shadow-black/[0.03] border-white/80 py-2.5 px-3.5 sm:px-5'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2.5 group pl-1">
            <div className="w-9 h-9 bg-gradient-to-tr from-agri-green via-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-md shadow-agri-green/25 group-hover:scale-105 transition-all duration-300 ring-2 ring-white/60">
              <span className="text-white text-xs font-black tracking-widest">AF</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black tracking-tight text-gray-900 group-hover:text-agri-green transition-colors">
                AgriFlow
              </span>
              <span className="text-[10px] font-bold text-white bg-agri-green px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100/60 p-1 rounded-full border border-gray-200/50">
            <a
              href="#about"
              className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/90 rounded-full transition-all duration-200"
            >
              {t('about', 'About')}
            </a>
            <a
              href="#how-it-works"
              className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/90 rounded-full transition-all duration-200"
            >
              {t('how_it_works', 'How It Works')}
            </a>
            <a
              href="#features"
              className="px-4 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/90 rounded-full transition-all duration-200"
            >
              {t('features', 'Features')}
            </a>
          </div>

          {/* Right Actions: Language Selector + Login/CTA */}
          <div className="hidden md:flex items-center gap-2 pr-1">
            <LanguageSelector variant="pill" />
            <Link
              to="/farmer/login"
              className="text-xs font-semibold text-gray-700 hover:text-agri-green px-3 py-1.5 transition-colors"
            >
              {t('login', 'Login')}
            </Link>
            <Link
              to="/farmer/login"
              className="bg-agri-green hover:bg-agri-dark text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center gap-1.5"
            >
              <span>{t('get_started', 'Get Started')}</span>
              <span className="text-[10px]">→</span>
            </Link>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 md:hidden pr-1">
            <LanguageSelector variant="pill" />
            <button
              onClick={() => setOpen(!open)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 text-gray-700 hover:bg-gray-200 transition-colors"
              aria-label="Toggle Navigation"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Capsule */}
        {open && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 px-2 pb-2 space-y-1.5 animate-fadeIn">
            <a
              href="#about"
              className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-agri-green rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              {t('about', 'About')}
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-agri-green rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              {t('how_it_works', 'How It Works')}
            </a>
            <a
              href="#features"
              className="block px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-agri-green rounded-xl transition-colors"
              onClick={() => setOpen(false)}
            >
              {t('features', 'Features')}
            </a>
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
              <Link
                to="/farmer/login"
                className="flex-1 text-center py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl"
                onClick={() => setOpen(false)}
              >
                {t('login', 'Login')}
              </Link>
              <Link
                to="/farmer/login"
                className="flex-1 text-center py-2 text-xs font-bold text-white bg-agri-green rounded-xl shadow-xs"
                onClick={() => setOpen(false)}
              >
                {t('get_started', 'Get Started')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

/* ─── Hero Section with Dynamic Text & Floating Glassmorphic Objects ──────── */
function Hero() {
  const navigate = useNavigate()
  const { t, language } = useTranslation()

  // Dynamic rotating word state
  const words = translations[language]?.dynamic_words || [
    'AI Matching',
    'Blockchain Traceability',
    'Smart Pricing',
    'Wastage Prevention',
  ]
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length)
        setFade(true)
      }, 300)
    }, 2800)
    return () => clearInterval(timer)
  }, [words.length])

  return (
    <section className="relative pt-32 sm:pt-40 pb-20 sm:pb-24 px-4 overflow-hidden min-h-[96vh] flex items-center justify-center">
      {/* ── High-Definition Background Video ── */}
      <div className="absolute inset-0 w-full h-full -z-20 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-[0.95] contrast-[1.02]"
        >
          <source src="/bg-videos/14622136_1920_1080_30fps.mp4" type="video/mp4" />
          <source src="/bg-videos/12080449_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ── Multi-Layer Glass & Frosted Blur Overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/95 backdrop-blur-[3.5px] -z-10" />

      {/* ── Ambient Radial Lighting Auras ── */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[720px] sm:w-[1050px] h-[450px] bg-gradient-to-tr from-emerald-300/25 via-teal-200/20 to-purple-300/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative">


        {/* ── Main Content Hero Container ── */}
        <div className="text-center max-w-4xl mx-auto z-10 relative">
          {/* High-End Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-agri-green text-xs font-black px-4 py-1.5 rounded-full mb-6 border border-emerald-200/80 shadow-xs hover:border-emerald-300 transition-all duration-300 group">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agri-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-agri-green"></span>
            </span>
            <span className="tracking-wider uppercase text-[11px]">{t('hero_badge')}</span>
          </div>

          {/* Heading with Dynamic Rotating Text */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.12] tracking-tight">
            {t('hero_title_prefix')}{' '}
            <span
              className={`inline-block text-transparent bg-clip-text bg-gradient-to-r from-agri-green via-emerald-600 to-teal-700 transition-all duration-300 transform ${
                fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
              }`}
            >
              {words[index] || words[0]}
            </span>
          </h1>

          {/* Slogan */}
          <p className="text-xs sm:text-sm font-black text-agri-green tracking-widest uppercase mt-5 flex items-center justify-center gap-2">
            <span className="w-8 h-[2px] bg-agri-green/30 inline-block" />
            <span>{t('hero_tagline')}</span>
            <span className="w-8 h-[2px] bg-agri-green/30 inline-block" />
          </p>

          {/* Description */}
          <p className="mt-5 text-gray-700 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            {t('hero_desc')}
          </p>

          {/* CTA Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/farmer/login')}
              className="w-full sm:w-auto bg-agri-green hover:bg-agri-dark text-white text-sm sm:text-base font-bold px-8 py-3.5 rounded-full shadow-lg shadow-agri-green/25 hover:shadow-xl hover:shadow-agri-green/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>🌾</span>
              <span>{t('cta_farmer')}</span>
            </button>
            <button
              onClick={() => navigate('/buyer/login')}
              className="w-full sm:w-auto bg-white/95 hover:bg-white text-gray-800 text-sm sm:text-base font-bold px-8 py-3.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>🛒</span>
              <span>{t('cta_buyer')}</span>
            </button>
            <a
              href="#how-it-works"
              className="px-5 py-3.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-agri-green transition-colors"
            >
              {t('cta_how_it_works')} →
            </a>
          </div>

          {/* ── High-End Floating Feature Badges (Dedicated Showcase with Zero Overlap) ── */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
            {/* Card 1: Polygon Amoy Verification */}
            <div className="glass-badge-glow p-4 rounded-2xl flex items-center gap-3.5 hover:scale-[1.02] transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shadow-inner shrink-0">
                ⛓️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <p className="text-xs font-black tracking-tight text-gray-900 truncate">
                    {t('floating_chain_title')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                    Amoy
                  </span>
                  <p className="text-[11px] font-mono text-purple-700 font-semibold truncate">
                    {t('floating_chain_sub')}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: AI Match Engine */}
            <div className="glass-badge-glow p-4 rounded-2xl flex items-center gap-3.5 hover:scale-[1.02] transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-agri-green flex items-center justify-center text-xl shadow-inner shrink-0">
                🌾
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-black tracking-tight text-gray-900 truncate">
                    {t('floating_crop_title')}
                  </p>
                  <span className="text-[9px] bg-emerald-100 text-agri-green font-extrabold px-1.5 py-0.5 rounded-full shrink-0">
                    98.4%
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium truncate mt-0.5">
                  {t('floating_crop_sub')}
                </p>
              </div>
            </div>

            {/* Card 3: Live Demand Surge */}
            <div className="glass-badge-glow p-4 rounded-2xl flex items-center gap-3.5 hover:scale-[1.02] transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl shadow-inner shrink-0">
                🤖
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-gray-900 truncate">
                    {t('floating_ai_title')}
                  </span>
                  <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium truncate mt-0.5">
                  {t('floating_ai_sub')}
                </p>
              </div>
            </div>
          </div>

          {/* High-Impact Stat Tiles */}
          <div className="mt-10 pt-8 border-t border-gray-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">100%</p>
              <p className="text-xs text-gray-600 font-bold mt-1">Tamper-Proof Ledger</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-2xl sm:text-3xl font-black text-agri-green tracking-tight">Polygon</p>
              <p className="text-xs text-gray-600 font-bold mt-1">PoS Testnet Amoy</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">4 AI Agents</p>
              <p className="text-xs text-gray-600 font-bold mt-1">Autonomous Scoring</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white/90 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">3 Languages</p>
              <p className="text-xs text-gray-600 font-bold mt-1">EN · हिन्दी · मराठी</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Role Cards Section ─────────────────────────────────────────────────── */
function RoleCards() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const roles = [
    {
      id:          'farmer',
      icon:        '🌾',
      title:       t('farmer_card_title'),
      description: t('farmer_card_desc'),
      cta:         t('cta_farmer'),
      onClick:     () => navigate('/farmer/login'),
      badgeColor:  'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id:          'buyer',
      icon:        '🛒',
      title:       t('buyer_card_title'),
      description: t('buyer_card_desc'),
      cta:         t('cta_buyer'),
      onClick:     () => navigate('/buyer/login'),
      badgeColor:  'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id:          'transporter',
      icon:        '🚛',
      title:       t('transporter_card_title'),
      description: t('transporter_card_desc'),
      cta:         'Enter as Transporter',
      onClick:     () => navigate('/transporter/login'),
      badgeColor:  'bg-purple-50 text-purple-800 border-purple-200',
    },
  ]

  return (
    <section id="about" className="py-24 px-4 bg-white relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-agri-green bg-agri-light px-3.5 py-1.5 rounded-full border border-green-200">
            Ecosystem Portals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            {t('who_uses_title')}
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            {t('who_uses_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.id}
              className="rounded-3xl border border-gray-200/90 bg-white p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />

              <div>
                <div className="flex items-center justify-between mb-5 z-10 relative">
                  <div className="w-14 h-14 bg-agri-light rounded-2xl flex items-center justify-center text-3xl shadow-xs">
                    {role.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${role.badgeColor}`}>
                    {t('available_now')}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 z-10 relative">{role.title}</h3>
                <p className="mt-3 text-gray-500 text-sm leading-relaxed z-10 relative">
                  {role.description}
                </p>
              </div>

              <div className="mt-8 z-10 relative">
                <button
                  onClick={role.onClick}
                  className="btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>{role.cta}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── How It Works ────────────────────────────────────────────────────────── */
function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    { step: '01', title: t('step_1_title'), body: t('step_1_desc'), icon: '🌾' },
    { step: '02', title: t('step_2_title'), body: t('step_2_desc'), icon: '🤖' },
    { step: '03', title: t('step_3_title'), body: t('step_3_desc'), icon: '🤝' },
    { step: '04', title: t('step_4_title'), body: t('step_4_desc'), icon: '⛓️' },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4 bg-gray-50/70 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-200">
            Smart Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            {t('how_it_works_title')}
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            {t('how_it_works_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-7 shadow-xs border border-gray-100 hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-emerald-200 font-mono">{s.step}</span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-base leading-snug">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Platform Features ───────────────────────────────────────────────────── */
function Features() {
  const { t } = useTranslation()

  const features = [
    { icon: '🤖', title: t('feat_1_title'), body: t('feat_1_desc') },
    { icon: '⛓️', title: t('feat_2_title'), body: t('feat_2_desc') },
    { icon: '📊', title: t('feat_3_title'), body: t('feat_3_desc') },
    { icon: '🌍', title: t('feat_4_title'), body: t('feat_4_desc') },
    { icon: '🛒', title: t('feat_5_title'), body: t('feat_5_desc') },
    { icon: '🚛', title: t('feat_6_title'), body: t('feat_6_desc') },
  ]

  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3">
            {t('features_title')}
          </h2>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            {t('features_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex gap-4 p-6 rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all bg-white group"
            >
              <div className="w-12 h-12 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{f.title}</h3>
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
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-950 text-gray-400 py-16 px-4 border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-agri-green rounded-xl flex items-center justify-center shadow-md shadow-agri-green/30">
                <span className="text-white text-xs font-black">AF</span>
              </div>
              <span className="text-white font-black text-xl">AgriFlow AI</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/10 text-purple-300 border border-white/10">
                Polygon Amoy (80002)
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/10 text-emerald-300 border border-white/10">
                AI Models Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Platform</p>
              <ul className="space-y-2">
                <li><a href="#about" className="hover:text-white transition-colors">{t('about', 'About')}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">{t('how_it_works', 'How It Works')}</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">{t('features', 'Features')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Portals</p>
              <ul className="space-y-2">
                <li><Link to="/farmer/login" className="hover:text-white transition-colors">Farmer Login</Link></li>
                <li><Link to="/buyer/login" className="hover:text-white transition-colors">Buyer Login</Link></li>
                <li><Link to="/transporter/login" className="hover:text-white transition-colors">Transporter Login</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Project</p>
              <ul className="space-y-2">
                <li className="text-gray-300 font-semibold">{t('final_year_tag')}</li>
                <li className="text-gray-500">AgriFlow AI v1.0</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>{t('all_rights')}</p>
          <p>Decentralized Smart Agriculture · React 18 · Solidity · Polygon PoS</p>
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

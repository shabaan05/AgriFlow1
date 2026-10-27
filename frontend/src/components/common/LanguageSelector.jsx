import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../context/LanguageContext.jsx'

export default function LanguageSelector({ variant = 'dropdown' }) {
  const { language, setLanguage } = useTranslation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const languages = [
    { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी',  short: 'HI', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी',  short: 'MR', flag: '🇮🇳' },
  ]

  const current = languages.find((l) => l.code === language) || languages[0]

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'pill') {
    return (
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === l.code
                ? 'bg-white text-agri-green shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {l.short}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all shadow-xs"
        aria-label="Select Language"
      >
        <span className="text-sm">🌐</span>
        <span>{current.label}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 animate-fadeIn">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLanguage(l.code)
                setOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                language === l.code
                  ? 'bg-agri-light text-agri-green font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {language === l.code && <span className="text-agri-green font-bold">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

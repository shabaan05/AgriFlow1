import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../locales/translations.js'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('agriflow_lang') || 'en'
  })

  function setLanguage(lang) {
    if (translations[lang]) {
      setLanguageState(lang)
      localStorage.setItem('agriflow_lang', lang)
    }
  }

  // Translation helper function
  function t(key, fallback = '') {
    if (!key) return ''
    const currentDict = translations[language] || translations.en
    if (currentDict && currentDict[key]) {
      return currentDict[key]
    }
    // Fallback to English dictionary if key missing in current language
    if (translations.en && translations.en[key]) {
      return translations.en[key]
    }
    return fallback || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
    }
  }
  return context
}

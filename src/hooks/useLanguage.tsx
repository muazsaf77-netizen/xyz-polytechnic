import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from '@/i18n/translations'

type Language = 'en' | 'am'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isAm: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LangProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language')
    return (stored as Language) || 'en'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    document.documentElement.dir = language === 'am' ? 'ltr' : 'ltr'
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    const lang = translations[language]
    return (lang as Record<string, string>)[key] || key
  }

  const isAm = language === 'am'

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isAm,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLang must be used within a LangProvider')
  }
  return context
}

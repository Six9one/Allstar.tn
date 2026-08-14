import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'ar')

  useEffect(() => {
    localStorage.setItem('app_lang', lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }, [lang])

  const t = (keyPath) => {
    const keys = keyPath.split('.')
    let curr = translations[lang] || translations.ar
    for (const k of keys) {
      if (curr && curr[k] !== undefined) {
        curr = curr[k]
      } else {
        return keyPath
      }
    }
    return curr
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

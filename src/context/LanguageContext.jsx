import { createContext, useContext, useMemo, useState } from 'react'
import en from '../translations/en.json'
import fr from '../translations/fr.json'
import mg from '../translations/mg.json'

const DICTS = { en, fr, mg }
const LanguageContext = createContext(null)

function getFromPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('jc_lang') || 'en')

  const changeLang = (next) => {
    setLang(next)
    localStorage.setItem('jc_lang', next)
  }

  const t = useMemo(() => {
    return (key, vars = {}) => {
      const dict = DICTS[lang] || DICTS.en
      let str = getFromPath(dict, key) ?? getFromPath(DICTS.en, key) ?? key
      Object.entries(vars).forEach(([k, v]) => {
        str = String(str).replace(`{${k}}`, v)
      })
      return str
    }
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

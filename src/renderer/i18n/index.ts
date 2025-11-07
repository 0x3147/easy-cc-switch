import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh from './locales/zh.json'
import en from './locales/en.json'
import de from './locales/de.json'
import fr from './locales/fr.json'
import it from './locales/it.json'
import th from './locales/th.json'
import vi from './locales/vi.json'

// 从 localStorage 获取保存的语言，默认为中文
const savedLanguage = localStorage.getItem('language') || 'zh'

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    it: { translation: it },
    th: { translation: th },
    vi: { translation: vi }
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n

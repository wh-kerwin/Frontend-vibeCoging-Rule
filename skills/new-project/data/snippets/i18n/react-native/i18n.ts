import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import zhCN from '@/locales/zh-CN.json'
import enUS from '@/locales/en-US.json'

const deviceLocale = getLocales()[0]?.languageTag ?? '%DEFAULT_LOCALE%'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    lng: deviceLocale,
    fallbackLng: '%DEFAULT_LOCALE%',
    interpolation: { escapeValue: false },
  })

export { i18n }

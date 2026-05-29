import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN.json'
import enUS from '@/locales/en-US.json'

const i18n = createI18n({
  legacy: false,
  locale: '%DEFAULT_LOCALE%',
  fallbackLocale: '%DEFAULT_LOCALE%',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

export { i18n }

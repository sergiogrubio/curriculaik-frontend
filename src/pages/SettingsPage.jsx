import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'
import { useExchangeRate } from '../hooks/useExchangeRate.js'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { theme, themeName, setThemeName, themes, currency, setCurrency, currencies } = useTheme()
  const { rates, loading, lastUpdated } = useExchangeRate()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: theme.text }}>
        {t('nav.settings')}
      </h1>

      {/* Theme selector */}
      <div className="p-6 rounded-xl border mb-6"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <h2 className="font-semibold mb-1" style={{ color: theme.text }}>
          {t('theme.title')}
        </h2>
        <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
          Applied to the interface and all generated documents
        </p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(themes).map(([key, th]) => (
            <button
              key={key}
              onClick={() => setThemeName(key)}
              className="p-4 rounded-lg border-2 text-left transition-all"
              style={{
                backgroundColor: th.bg,
                borderColor: themeName === key ? th.primary : th.border,
              }}
            >
              <div className="w-6 h-6 rounded-full mb-2"
                   style={{ backgroundColor: th.primary }} />
              <p className="text-xs font-medium" style={{ color: th.text }}>{th.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      <div className="p-6 rounded-xl border mb-6"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <h2 className="font-semibold mb-1" style={{ color: theme.text }}>
          Language
        </h2>
        <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
          Changes the interface language everywhere in the app
        </p>
        <div className="flex gap-3">
          {[['en','English'],['es','Español'],['ca','Català']].map(([code, label]) => (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all"
              style={{
                borderColor: i18n.language === code ? theme.primary : theme.border,
                backgroundColor: i18n.language === code ? `${theme.primary}22` : 'transparent',
                color: i18n.language === code ? theme.primary : theme.textSecondary,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="p-6 rounded-xl border"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <h2 className="font-semibold mb-1" style={{ color: theme.text }}>
          Currency
        </h2>
        <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
          Used to display Azure OpenAI API costs
        </p>
        <div className="flex gap-3">
          {currencies.map(c => (
            <button
              key={c.code}
              onClick={() => setCurrency(c)}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all"
              style={{
                borderColor: currency.code === c.code ? theme.primary : theme.border,
                backgroundColor: currency.code === c.code ? `${theme.primary}22` : 'transparent',
                color: currency.code === c.code ? theme.primary : theme.textSecondary,
              }}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            Azure charges in USD. Other currencies use live exchange rates.
          </p>
          {!loading && lastUpdated && (
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              Rates updated: {lastUpdated.toLocaleTimeString()} ·
              {rates.EUR && ` 1 USD = ${rates.EUR.toFixed(4)} EUR`}
              {rates.GBP && ` · 1 USD = ${rates.GBP.toFixed(4)} GBP`}
            </p>
          )}
          {loading && (
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              Fetching live rates...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

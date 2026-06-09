import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext.jsx'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { theme, themeName, setThemeName, themes } = useTheme()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: theme.text }}>
        {t('nav.settings')}
      </h1>

      {/* Theme selector */}
      <div className="p-6 rounded-xl border mb-6"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <h2 className="font-semibold mb-4" style={{ color: theme.text }}>
          {t('theme.title')}
        </h2>
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
      <div className="p-6 rounded-xl border"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <h2 className="font-semibold mb-4" style={{ color: theme.text }}>
          Language
        </h2>
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
        <p className="text-xs mt-3" style={{ color: theme.textSecondary }}>
          Changes the interface language everywhere in the app.
        </p>
      </div>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ca', label: 'CA' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { theme, themeName, setThemeName, themes } = useTheme()
  const location = useLocation()

  const navLinks = [
    { to: '/', label: t('nav.projects') },
    { to: '/projects/new', label: t('nav.new_project') },
    { to: '/settings', label: t('nav.settings') },
  ]

  return (
    <nav style={{ backgroundColor: theme.surface, borderBottom: `1px solid ${theme.border}` }}
         className="px-6 py-3 flex items-center justify-between sticky top-0 z-50">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-bold" style={{ color: theme.primary }}>
          curriculAI
        </span>
        <span className="text-2xl font-bold" style={{ color: theme.text }}>k</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-6">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="text-sm font-medium transition-colors"
            style={{
              color: location.pathname === link.to ? theme.primary : theme.textSecondary
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side: theme + language */}
      <div className="flex items-center gap-4">

        {/* Theme selector */}
        <select
          value={themeName}
          onChange={e => setThemeName(e.target.value)}
          className="text-xs px-2 py-1 rounded border"
          style={{
            backgroundColor: theme.bg,
            color: theme.textSecondary,
            borderColor: theme.border
          }}
        >
          {Object.entries(themes).map(([key, t]) => (
            <option key={key} value={key}>{t.name}</option>
          ))}
        </select>

        {/* Language selector */}
        <div className="flex gap-1">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className="text-xs px-2 py-1 rounded font-medium transition-colors"
              style={{
                backgroundColor: i18n.language === lang.code ? theme.primary : 'transparent',
                color: i18n.language === lang.code ? '#fff' : theme.textSecondary,
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

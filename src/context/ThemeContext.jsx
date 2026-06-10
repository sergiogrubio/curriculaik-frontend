import { createContext, useContext, useState } from 'react'

const themes = {
  dark_tech: {
    name: 'Dark Tech',
    bg: '#0F1B2D',
    surface: '#1A2D42',
    primary: '#00D4AA',
    secondary: '#4A9EFF',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    border: '#1E3A5F',
  },
  light_academic: {
    name: 'Light Academic',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    primary: '#2563EB',
    secondary: '#7C3AED',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  neutral_corporate: {
    name: 'Neutral Corporate',
    bg: '#F5F5F5',
    surface: '#FFFFFF',
    primary: '#16A34A',
    secondary: '#0891B2',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#D1D5DB',
  },
}

const currencies = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
]

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState('dark_tech')
  const [currency, setCurrency] = useState(currencies[0])
  const theme = themes[themeName]

  return (
    <ThemeContext.Provider value={{
      theme, themeName, setThemeName, themes,
      currency, setCurrency, currencies
    }}>
      <div style={{
        '--bg': theme.bg,
        '--surface': theme.surface,
        '--primary': theme.primary,
        '--secondary': theme.secondary,
        '--text': theme.text,
        '--text-secondary': theme.textSecondary,
        '--border': theme.border,
        backgroundColor: theme.bg,
        color: theme.text,
        minHeight: '100vh',
      }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
export { themes, currencies }

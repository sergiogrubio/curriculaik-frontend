import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useExchangeRate } from '../../hooks/useExchangeRate.js'
import { useState, useEffect } from 'react'

export default function CostBar() {
  const { t } = useTranslation()
  const { theme, currency } = useTheme()
  const { convert, loading } = useExchangeRate()
  const [cost, setCost] = useState({
    session: 0.00,
    project_total: 0.00,
    tokens_in: 0,
    tokens_out: 0
  })

  useEffect(() => {
    const stored = localStorage.getItem('session_cost')
    if (stored) setCost(JSON.parse(stored))
  }, [])

  const fmt = (val) => loading ? '...' : `${currency.symbol}${convert(val, currency.code).toFixed(4)}`

  return (
    <div
      className="px-6 py-2 flex items-center justify-end gap-6 text-xs"
      style={{ backgroundColor: theme.surface, borderTop: `1px solid ${theme.border}` }}
    >
      <span style={{ color: theme.textSecondary }}>
        {t('cost.tokens_in')}: <strong style={{ color: theme.text }}>
          {cost.tokens_in.toLocaleString()}
        </strong>
      </span>
      <span style={{ color: theme.textSecondary }}>
        {t('cost.tokens_out')}: <strong style={{ color: theme.text }}>
          {cost.tokens_out.toLocaleString()}
        </strong>
      </span>
      <span style={{ color: theme.textSecondary }}>
        {t('cost.session')}: <strong style={{ color: theme.primary }}>
          {fmt(cost.session)} {currency.code}
        </strong>
      </span>
      <span style={{ color: theme.textSecondary }}>
        {t('cost.project_total')}: <strong style={{ color: theme.secondary }}>
          {fmt(cost.project_total)} {currency.code}
        </strong>
      </span>
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useExchangeRate } from '../../hooks/useExchangeRate.js'
import { useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getCostSummary } from '../../services/api.js'

const ZERO = { session: 0, project_total: 0, tokens_in: 0, tokens_out: 0 }

export default function CostBar() {
  const { t } = useTranslation()
  const { theme, currency } = useTheme()
  const { convert, loading } = useExchangeRate()
  const location = useLocation()

  const [cost, setCost] = useState(ZERO)

  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)/)
  const projectId = projectMatch ? projectMatch[1] : null

  useEffect(() => {
    if (!projectId) {
      setCost(ZERO)
      return
    }

    const fetchCost = () => {
      getCostSummary(projectId)
        .then(data => setCost({
          session: data.total_usd,
          project_total: data.total_usd,
          tokens_in: data.tokens_in,
          tokens_out: data.tokens_out
        }))
        .catch(() => {})
    }

    fetchCost()
    const interval = setInterval(fetchCost, 10_000)
    return () => clearInterval(interval)
  }, [projectId])

  const fmt = (val) =>
    loading ? '...' : `${currency.symbol}${convert(val, currency.code).toFixed(4)} ${currency.code}`

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
          {fmt(cost.session)}
        </strong>
      </span>
      {projectId && (
        <span style={{ color: theme.textSecondary }}>
          {t('cost.project_total')}: <strong style={{ color: theme.secondary }}>
            {fmt(cost.project_total)}
          </strong>
        </span>
      )}
    </div>
  )
}

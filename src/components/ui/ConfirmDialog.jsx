import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext.jsx'
import { useExchangeRate } from '../../hooks/useExchangeRate.js'

export default function ConfirmDialog({ open, onConfirm, onCancel, estimatedCost, isAll }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { convert, loading } = useExchangeRate()
  const { currency } = useTheme()

  if (!open) return null

  const displayCost = loading ? '...' : `${currency.symbol}${convert(estimatedCost, currency.code).toFixed(4)} ${currency.code}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm mx-4 p-6 rounded-xl border"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">⚡</span>
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>
            {isAll ? t('materials.generate_all') : t('actions.generate')}
          </h3>
        </div>

        <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
          {isAll ? t('cost.confirm_generate_all') : t('cost.confirm_generate')}
        </p>

        <div className="flex items-center justify-between p-3 rounded-lg mb-6"
             style={{ backgroundColor: theme.bg }}>
          <span className="text-sm" style={{ color: theme.textSecondary }}>
            {t('cost.estimated')}
          </span>
          <span className="font-bold text-sm" style={{ color: theme.primary }}>
            ~{displayCost}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: theme.border, color: theme.textSecondary }}
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: theme.primary, color: '#fff' }}
          >
            {t('cost.confirm_continue')}
          </button>
        </div>
      </div>
    </div>
  )
}

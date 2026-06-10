import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'

// Estimated costs per material type (USD) — will come from backend
const ESTIMATED_COSTS = {
  notes: 0.018,
  slides: 0.042,
  exercises: 0.011,
  exam: 0.009,
  all: 0.080,
}

export default function TopicPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId, topicId } = useParams()

  const [topic] = useState(null)
  const [dialog, setDialog] = useState({ open: false, type: null, isAll: false })

  const handleGenerateClick = (type) => {
    setDialog({
      open: true,
      type,
      isAll: type === 'all'
    })
  }

  const handleConfirm = () => {
    const type = dialog.type
    setDialog({ open: false, type: null, isAll: false })
    // will call backend API
    console.log(`Generating ${type} for topic ${topicId}`)
  }

  const handleCancel = () => {
    setDialog({ open: false, type: null, isAll: false })
  }

  if (!topic) {
    return (
      <>
        <ConfirmDialog
          open={dialog.open}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          estimatedCost={dialog.type ? ESTIMATED_COSTS[dialog.type] : 0}
          isAll={dialog.isAll}
        />

        <div className="flex items-center gap-2 text-xs mb-6"
             style={{ color: theme.textSecondary }}>
          <Link to="/" style={{ color: theme.textSecondary }}>
            {t('nav.projects')}
          </Link>
          <span>›</span>
          <Link to={`/projects/${projectId}`} style={{ color: theme.textSecondary }}>
            Project
          </Link>
          <span>›</span>
          <span style={{ color: theme.text }}>Topic {topicId}</span>
        </div>

        {/* Material cards — visible even without backend data */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: theme.text }}>
            Topic {topicId}
          </h1>
          <p className="text-sm mb-6" style={{ color: theme.textSecondary }}>
            Backend connection coming soon
          </p>

          {/* Generate all button */}
          <button
            onClick={() => handleGenerateClick('all')}
            className="mb-6 px-5 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: '#fff' }}
          >
            ⚡ {t('materials.generate_all')}
          </button>

          {/* Individual material cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['notes', 'slides', 'exercises', 'exam'].map(type => (
              <div key={type}
                   className="p-5 rounded-xl border flex flex-col gap-4"
                   style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {{ notes: '📝', slides: '🎨', exercises: '💪', exam: '📋' }[type]}
                    </span>
                    <span className="font-medium" style={{ color: theme.text }}>
                      {t(`materials.${type}`)}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: theme.bg, color: theme.textSecondary }}>
                    pending
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: theme.textSecondary }}>
                    ~${ESTIMATED_COSTS[type]}
                  </span>
                  <button
                    onClick={() => handleGenerateClick(type)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: theme.primary, color: '#fff' }}
                  >
                    ⚡ {t('actions.generate')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return null
}

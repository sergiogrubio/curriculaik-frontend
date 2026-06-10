import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

export default function TopicPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId, topicId } = useParams()

  // will come from API
  const topic = null

  if (!topic) {
    return (
      <div>
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
        <div className="text-center py-20" style={{ color: theme.textSecondary }}>
          <p className="text-6xl mb-4">🔄</p>
          <p className="text-lg font-medium mb-1" style={{ color: theme.text }}>
            Topic not loaded
          </p>
          <p className="text-sm">
            Backend connection coming soon.
          </p>
        </div>
      </div>
    )
  }

  return null
}

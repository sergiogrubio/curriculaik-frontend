import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ProjectDetailPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId } = useParams()
  const [activeTab, setActiveTab] = useState('topics')

  // will come from API
  const project = null

  if (!project) {
    return (
      <div>
        <Link to="/" className="text-xs mb-6 block" style={{ color: theme.textSecondary }}>
          ← {t('nav.projects')}
        </Link>
        <div className="text-center py-20" style={{ color: theme.textSecondary }}>
          <p className="text-6xl mb-4">🔄</p>
          <p className="text-lg font-medium mb-1" style={{ color: theme.text }}>
            Project not loaded
          </p>
          <p className="text-sm">
            Backend connection coming soon. Project ID: <code>{projectId}</code>
          </p>
        </div>
      </div>
    )
  }

  return null
}

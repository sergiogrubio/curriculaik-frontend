import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const projects = [] // will come from API

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {t('nav.projects')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {t('tagline')}
          </p>
        </div>
        <Link
          to="/projects/new"
          className="px-4 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          + {t('actions.new')}
        </Link>
      </div>

      <div className="text-center py-20" style={{ color: theme.textSecondary }}>
        <p className="text-6xl mb-4">📚</p>
        <p className="text-lg font-medium mb-1" style={{ color: theme.text }}>
          No projects yet
        </p>
        <p className="text-sm mb-6">
          Create your first project to get started
        </p>
        <Link
          to="/projects/new"
          className="inline-block px-6 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          + {t('nav.new_project')}
        </Link>
      </div>
    </div>
  )
}

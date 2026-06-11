import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useState, useEffect } from 'react'
import { getProjects } from '../services/api.js'

function StatusBadge({ status }) {
  const { theme } = useTheme()
  const colors = {
    pending:     { bg: '#1E3A5F', text: '#4A9EFF' },
    in_progress: { bg: '#1A3A2A', text: '#00D4AA' },
    complete:    { bg: '#1A2A1A', text: '#66BB6A' },
    error:       { bg: '#3A1A1A', text: '#EF5350' },
  }
  const c = colors[status] || colors.pending
  return (
    <span className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ backgroundColor: c.bg, color: c.text }}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default function ProjectsPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    getProjects()
      .then(data => { setProjects(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [])

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

      {loading && (
        <div className="text-center py-20" style={{ color: theme.textSecondary }}>
          <p className="text-4xl mb-4">⏳</p>
          <p>Loading projects...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">❌</p>
          <p className="text-sm" style={{ color: '#EF5350' }}>{error}</p>
          <p className="text-xs mt-2" style={{ color: theme.textSecondary }}>
            Make sure the backend is running on http://localhost:8000
          </p>
        </div>
      )}

      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-20" style={{ color: theme.textSecondary }}>
          <p className="text-6xl mb-4">📚</p>
          <p className="text-lg font-medium mb-1" style={{ color: theme.text }}>
            No projects yet
          </p>
          <p className="text-sm mb-6">Create your first project to get started</p>
          <Link
            to="/projects/new"
            className="inline-block px-6 py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: '#fff' }}
          >
            + {t('nav.new_project')}
          </Link>
        </div>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block p-6 rounded-xl border transition-all hover:scale-[1.02]"
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-lg leading-tight"
                    style={{ color: theme.text }}>
                  {project.name}
                </h2>
                <StatusBadge status={project.status} />
              </div>
              <div className="space-y-1 text-sm" style={{ color: theme.textSecondary }}>
                {project.subject  && <p>📋 {project.module_code} — {project.course}</p>}
                {project.language && <p>🌐 {project.language}</p>}
                {project.institution && <p>🏫 {project.institution}</p>}
                <p>📅 {new Date(project.created_at).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

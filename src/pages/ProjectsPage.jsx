import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

const mockProjects = [
  {
    id: 'db-admin-2024',
    name: 'Database Administration',
    subject: 'IFC31_0372',
    course: 'ASIR Year 1',
    language: 'English',
    topics: 13,
    status: 'in_progress',
    created: '2024-09-01',
  },
]

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

  return (
    <div>
      {/* Header */}
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

      {/* Projects grid */}
      {mockProjects.length === 0 ? (
        <div className="text-center py-20"
             style={{ color: theme.textSecondary }}>
          <p className="text-6xl mb-4">📚</p>
          <p className="text-lg">No projects yet.</p>
          <Link to="/projects/new"
                className="mt-4 inline-block text-sm"
                style={{ color: theme.primary }}>
            Create your first project →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockProjects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block p-6 rounded-xl border transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-lg leading-tight"
                    style={{ color: theme.text }}>
                  {project.name}
                </h2>
                <StatusBadge status={project.status} />
              </div>
              <div className="space-y-1 text-sm" style={{ color: theme.textSecondary }}>
                <p>📋 {project.subject} — {project.course}</p>
                <p>🌐 {project.language}</p>
                <p>📚 {project.topics} {t('topics.title').toLowerCase()}</p>
                <p>📅 {project.created}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

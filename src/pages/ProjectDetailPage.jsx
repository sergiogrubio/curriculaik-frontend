import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import { getProject, getTopics, generateComplianceReport, downloadComplianceReport, deleteProject } from '../services/api.js'

function TopicRow({ topic, projectId }) {
  const { theme } = useTheme()

  const statusColor = {
    pending:     theme.textSecondary,
    in_progress: theme.primary,
    complete:    '#66BB6A',
    error:       '#EF5350',
  }
  const statusIcon = {
    pending:     '○',
    in_progress: '◑',
    complete:    '●',
    error:       '✕',
  }

  return (
    <Link
      to={`/projects/${projectId}/topics/${topic.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-lg border transition-all hover:scale-[1.01]"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      <span className="text-lg w-6 text-center"
            style={{ color: statusColor[topic.status] }}>
        {statusIcon[topic.status]}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: theme.text }}>
            {topic.number > 0 ? `${topic.number}. ` : ''}{topic.title}
          </span>
          {topic.type === 'extension' && (
            <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${theme.secondary}22`, color: theme.secondary }}>
              extension
            </span>
          )}
        </div>
        {topic.hours > 0 && (
          <span className="text-xs" style={{ color: theme.textSecondary }}>
            {topic.hours}h
          </span>
        )}
      </div>

      <div className="flex gap-1">
        {['N', 'S', 'E', 'X'].map(m => (
          <span key={m} className="text-xs px-2 py-0.5 rounded"
                style={{ backgroundColor: theme.bg, color: theme.textSecondary }}>
            {m}
          </span>
        ))}
      </div>
    </Link>
  )
}

export default function ProjectDetailPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('topics')
  const [project, setProject] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getProject(projectId), getTopics(projectId)])
      .then(([proj, tops]) => {
        setProject(proj)
        setTopics(tops)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [projectId])

  if (loading) return (
    <div className="text-center py-20" style={{ color: theme.textSecondary }}>
      <p className="text-4xl mb-4">⏳</p>
      <p>Loading project...</p>
    </div>
  )

  if (error) return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">❌</p>
      <p style={{ color: '#EF5350' }}>{error}</p>
    </div>
  )

  const regular   = topics.filter(t => t.type === 'regular')
  const extension = topics.filter(t => t.type === 'extension')
  const complete  = topics.filter(t => t.status === 'complete').length
  const total     = topics.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/" className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>
            ← {t('nav.projects')}
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {project.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {project.course} · {project.language}
            {project.institution && ` · ${project.institution}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: theme.primary }}>
            {complete}/{total}
          </p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            topics complete
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-8 overflow-hidden"
           style={{ backgroundColor: theme.border }}>
        <div className="h-full rounded-full transition-all"
             style={{
               width: total > 0 ? `${(complete/total)*100}%` : '0%',
               backgroundColor: theme.primary
             }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b" style={{ borderColor: theme.border }}>
        {['topics', 'sources', 'settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
                  className="pb-3 text-sm font-medium capitalize transition-colors"
                  style={{
                    color: activeTab === tab ? theme.primary : theme.textSecondary,
                    borderBottom: activeTab === tab ? `2px solid ${theme.primary}` : '2px solid transparent',
                  }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Topics tab */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          {topics.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.textSecondary }}>
              <p className="text-4xl mb-3">📋</p>
              <p className="font-medium mb-1" style={{ color: theme.text }}>No topics yet</p>
              <p className="text-sm mb-4">Upload your curriculum files and parse them</p>
              <button
                onClick={() => setActiveTab('sources')}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: theme.primary, color: '#fff' }}
              >
                Upload files
              </button>
            </div>
          ) : (
            <>
              {regular.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide mb-3"
                      style={{ color: theme.textSecondary }}>
                    Regular topics
                  </h2>
                  <div className="space-y-2">
                    {regular.map(topic => (
                      <TopicRow key={topic.id} topic={topic} projectId={projectId} />
                    ))}
                  </div>
                </div>
              )}
              {extension.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wide mb-3"
                      style={{ color: theme.textSecondary }}>
                    Extension topics
                  </h2>
                  <div className="space-y-2">
                    {extension.map(topic => (
                      <TopicRow key={topic.id} topic={topic} projectId={projectId} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sources tab */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border text-center"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium mb-1" style={{ color: theme.text }}>
              {t('upload.sources')}
            </p>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              {t('upload.sources_hint')}
            </p>
            <label className="inline-block px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                   style={{ backgroundColor: theme.primary, color: '#fff' }}>
              <input type="file" accept=".zip" className="hidden" />
              {t('upload.sources')}
            </label>
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <Link
            to={`/projects/${projectId}/style`}
            className="flex items-center justify-between p-5 rounded-xl border transition-all hover:scale-[1.01]"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text }}>Visual style</p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Colors, fonts, logo — applied to all generated materials
                </p>
              </div>
            </div>
            <span style={{ color: theme.textSecondary }}>→</span>
          </Link>
          {/* Compliance report */}
          <div
            className="flex items-center justify-between p-5 rounded-xl border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text }}>Compliance report</p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Checks that the teaching programme covers the official regulation
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadComplianceReport(projectId)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                ↓ Download
              </button>
              <button
                onClick={() => generateComplianceReport(projectId)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: theme.primary, color: '#fff' }}
              >
                ⚡ Generate
              </button>
            </div>
          </div>

          <Link
            to={`/projects/${projectId}/cost`}
            className="flex items-center justify-between p-5 rounded-xl border transition-all hover:scale-[1.01]"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text }}>Cost report</p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Cumulative Azure OpenAI costs for this project
                </p>
              </div>
            </div>
            <span style={{ color: theme.textSecondary }}>→</span>
          </Link>

          {/* Danger zone */}
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: '#EF5350' }}>
            <h3 className="font-semibold text-sm mb-1" style={{ color: '#EF5350' }}>
              Danger zone
            </h3>
            <p className="text-xs mb-4" style={{ color: theme.textSecondary }}>
              Permanently deletes the project, all topics, materials and local files. This cannot be undone.
            </p>
            <button
              onClick={async () => {
                if (!window.confirm(`Delete project "${project?.name}"? This cannot be undone.`)) return
                await deleteProject(projectId)
                navigate('/')
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#EF5350', color: '#fff' }}
            >
              🗑 Delete project
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

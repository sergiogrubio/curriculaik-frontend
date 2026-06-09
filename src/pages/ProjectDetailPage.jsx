import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

const mockMemory = {
  subject: { name: 'Database Administration', course: 'ASIR Year 1', language: 'English', total_hours: 260 },
  topics: [
    { id: 0,  title: 'Presentation',                    type: 'regular',   hours: 2,  status: 'complete'  },
    { id: 1,  title: 'Introduction to DBMS',             type: 'regular',   hours: 10, status: 'complete'  },
    { id: 2,  title: 'Entity-Relationship Model',        type: 'regular',   hours: 20, status: 'in_progress'},
    { id: 3,  title: 'Relational Model',                 type: 'regular',   hours: 30, status: 'pending'   },
    { id: 4,  title: 'Normalization',                    type: 'regular',   hours: 10, status: 'pending'   },
    { id: 5,  title: 'Creating databases and tables',    type: 'regular',   hours: 10, status: 'pending'   },
    { id: 6,  title: 'Querying tables',                  type: 'regular',   hours: 24, status: 'pending'   },
    { id: 7,  title: 'Intermediate SQL',                 type: 'regular',   hours: 24, status: 'pending'   },
    { id: 8,  title: 'Introduction to Python',           type: 'regular',   hours: 60, status: 'pending'   },
    { id: 9,  title: 'Data security management',         type: 'regular',   hours: 12, status: 'pending'   },
    { id: 10, title: 'Final project',                    type: 'regular',   hours: 52, status: 'pending'   },
    { id: 11, title: 'MongoDB',                          type: 'extension', hours: 0,  status: 'pending'   },
    { id: 12, title: 'PL/pgSQL',                        type: 'extension', hours: 0,  status: 'pending'   },
    { id: 13, title: 'Triggers',                         type: 'extension', hours: 0,  status: 'pending'   },
  ]
}

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

  const materials = ['notes', 'slides', 'exercises', 'exam']

  return (
    <Link
      to={`/projects/${projectId}/topics/${topic.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-lg border transition-all hover:scale-[1.01]"
      style={{ backgroundColor: theme.surface, borderColor: theme.border }}
    >
      {/* Status icon */}
      <span className="text-lg w-6 text-center"
            style={{ color: statusColor[topic.status] }}>
        {statusIcon[topic.status]}
      </span>

      {/* Topic info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: theme.text }}>
            {topic.id > 0 ? `${topic.id}. ` : ''}{topic.title}
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

      {/* Material indicators */}
      <div className="flex gap-1">
        {materials.map(m => (
          <span key={m}
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: topic.status === 'complete' ? `${theme.primary}22` : theme.bg,
                  color: topic.status === 'complete' ? theme.primary : theme.textSecondary,
                }}>
            {m[0].toUpperCase()}
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
  const [activeTab, setActiveTab] = useState('topics')

  const regular = mockMemory.topics.filter(t => t.type === 'regular')
  const extension = mockMemory.topics.filter(t => t.type === 'extension')
  const complete = mockMemory.topics.filter(t => t.status === 'complete').length
  const total = mockMemory.topics.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/" className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>
            ← {t('nav.projects')}
          </Link>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {mockMemory.subject.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {mockMemory.subject.course} · {mockMemory.subject.language} · {mockMemory.subject.total_hours}h
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: theme.primary }}>
            {complete}/{total}
          </p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>topics complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full mb-8 overflow-hidden"
           style={{ backgroundColor: theme.border }}>
        <div className="h-full rounded-full transition-all"
             style={{ width: `${(complete/total)*100}%`, backgroundColor: theme.primary }} />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b" style={{ borderColor: theme.border }}>
        {['topics', 'sources', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="pb-3 text-sm font-medium capitalize transition-colors"
            style={{
              color: activeTab === tab ? theme.primary : theme.textSecondary,
              borderBottom: activeTab === tab ? `2px solid ${theme.primary}` : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Topics tab */}
      {activeTab === 'topics' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: theme.textSecondary }}>
              Regular Topics
            </h2>
            <div className="space-y-2">
              {regular.map(topic => (
                <TopicRow key={topic.id} topic={topic} projectId={projectId} />
              ))}
            </div>
          </div>
          {extension.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide mb-3"
                  style={{ color: theme.textSecondary }}>
                Extension Topics
              </h2>
              <div className="space-y-2">
                {extension.map(topic => (
                  <TopicRow key={topic.id} topic={topic} projectId={projectId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sources tab */}
      {activeTab === 'sources' && (
        <div className="p-6 rounded-xl border text-center"
             style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium mb-1" style={{ color: theme.text }}>Upload Source Materials</p>
          <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
            {t('upload.sources_hint')}
          </p>
          <label className="inline-block px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                 style={{ backgroundColor: theme.primary, color: '#fff' }}>
            <input type="file" accept=".zip" className="hidden" />
            {t('upload.sources')}
          </label>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-xl border"
             style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Project settings coming soon.
          </p>
        </div>
      )}
    </div>
  )
}

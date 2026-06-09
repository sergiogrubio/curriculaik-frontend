import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'

const mockTopic = {
  id: 1,
  title: 'Introduction to DBMS',
  hours: 10,
  status: 'in_progress',
  key_concepts: ['data', 'information', 'DBMS', 'centralized databases', 'distributed databases'],
  subtopics: [
    '1.1. Data, information and knowledge',
    '1.2. Information Retrieval and Storage System',
    '1.3. Files',
    '1.4. Databases',
    '1.5. Database management systems (DBMS)',
    '1.6. Centralized and distributed databases',
  ],
  materials: {
    notes:     { status: 'complete', file: 'unit01_notes.docx' },
    slides:    { status: 'in_progress', file: null },
    exercises: { status: 'pending', file: null },
    exam:      { status: 'pending', file: null },
  }
}

function MaterialCard({ type, material, onGenerate }) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const icons = { notes: '📝', slides: '🎨', exercises: '💪', exam: '📋' }
  const labels = {
    notes: t('materials.notes'),
    slides: t('materials.slides'),
    exercises: t('materials.exercises'),
    exam: t('materials.exam'),
  }

  const statusColor = {
    pending:     { bg: theme.bg,              text: theme.textSecondary },
    in_progress: { bg: `${theme.primary}11`,  text: theme.primary       },
    complete:    { bg: '#66BB6A22',            text: '#66BB6A'           },
    error:       { bg: '#EF535022',            text: '#EF5350'           },
  }

  const sc = statusColor[material.status]

  return (
    <div className="p-5 rounded-xl border flex flex-col gap-4"
         style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icons[type]}</span>
          <span className="font-medium" style={{ color: theme.text }}>{labels[type]}</span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: sc.bg, color: sc.text }}>
          {material.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex gap-2">
        {material.file ? (
          <button className="flex-1 px-3 py-2 rounded-lg text-sm font-medium border"
                  style={{ borderColor: theme.primary, color: theme.primary }}>
            ↓ {t('actions.download')}
          </button>
        ) : null}
        <button
          onClick={() => onGenerate(type)}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
          disabled={material.status === 'in_progress'}
        >
          {material.status === 'in_progress'
            ? t('materials.generating')
            : material.file
              ? '↺ Regenerate'
              : `⚡ ${t('actions.generate')}`}
        </button>
      </div>
    </div>
  )
}

export default function TopicPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId, topicId } = useParams()
  const [topic, setTopic] = useState(mockTopic)

  const handleGenerate = (type) => {
    setTopic(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        [type]: { ...prev.materials[type], status: 'in_progress' }
      }
    }))
    // Will call backend API later
    setTimeout(() => {
      setTopic(prev => ({
        ...prev,
        materials: {
          ...prev.materials,
          [type]: { status: 'complete', file: `unit${topicId}_${type}.docx` }
        }
      }))
    }, 2000)
  }

  const handleGenerateAll = () => {
    Object.keys(topic.materials).forEach(type => handleGenerate(type))
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6"
           style={{ color: theme.textSecondary }}>
        <Link to="/" style={{ color: theme.textSecondary }}>Projects</Link>
        <span>›</span>
        <Link to={`/projects/${projectId}`} style={{ color: theme.textSecondary }}>
          Database Administration
        </Link>
        <span>›</span>
        <span style={{ color: theme.text }}>Unit {topic.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {topic.id}. {topic.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {topic.hours}h · {topic.subtopics.length} sections
          </p>
        </div>
        <button
          onClick={handleGenerateAll}
          className="px-5 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          ⚡ {t('materials.generate_all')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: topic info */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: theme.textSecondary }}>
              KEY CONCEPTS
            </h3>
            <div className="flex flex-wrap gap-2">
              {topic.key_concepts.map(c => (
                <span key={c} className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${theme.primary}22`, color: theme.primary }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: theme.textSecondary }}>
              SECTIONS
            </h3>
            <ul className="space-y-1">
              {topic.subtopics.map(s => (
                <li key={s} className="text-xs py-1"
                    style={{ color: theme.textSecondary, borderBottom: `1px solid ${theme.border}` }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: material cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(topic.materials).map(([type, material]) => (
            <MaterialCard
              key={type}
              type={type}
              material={material}
              onGenerate={handleGenerate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

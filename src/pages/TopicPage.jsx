import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import { getTopic, getMaterials, generateNotes, generateSlides, downloadMaterial } from '../services/api.js'

const ESTIMATED_COSTS = {
  notes: 0.08, slides: 0.12, exercises: 0.06, exam: 0.06, all: 0.32
}

const MATERIAL_ICONS  = { notes: '📝', slides: '🎨', exercises: '💪', exam: '📋' }
const MATERIAL_FORMAT = { notes: 'docx', slides: 'pptx', exercises: 'docx', exam: 'docx' }

function MaterialCard({ type, material, onGenerate, onDownload, projectId, topicId }) {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const statusColors = {
    pending:    { bg: theme.bg,           text: theme.textSecondary },
    generating: { bg: `${theme.secondary}22`, text: theme.secondary },
    complete:   { bg: '#66BB6A22',        text: '#66BB6A'           },
    error:      { bg: '#EF535022',        text: '#EF5350'           },
  }
  const sc = statusColors[material?.status || 'pending']

  return (
    <div className="p-5 rounded-xl border flex flex-col gap-3"
         style={{ backgroundColor: theme.surface, borderColor: theme.border }}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{MATERIAL_ICONS[type]}</span>
          <span className="font-medium" style={{ color: theme.text }}>
            {t(`materials.${type}`)}
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: sc.bg, color: sc.text }}>
          {material?.status || 'pending'}
        </span>
      </div>

      <div className="text-xs" style={{ color: theme.textSecondary }}>
        ~${ESTIMATED_COSTS[type]} · .{MATERIAL_FORMAT[type]}
      </div>

      <div className="flex gap-2 mt-auto">
        {material?.status === 'complete' && (
          <button
            onClick={() => onDownload(type)}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-80"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            ↓ {t('actions.download')}
          </button>
        )}
        <button
          onClick={() => onGenerate(type)}
          disabled={material?.status === 'generating'}
          className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          {material?.status === 'generating'
            ? t('materials.generating')
            : material?.status === 'complete'
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

  const [topic,     setTopic]     = useState(null)
  const [materials, setMaterials] = useState({})
  const [loading,   setLoading]   = useState(true)
  const [dialog,    setDialog]    = useState({ open: false, type: null })

  const loadData = useCallback(async () => {
    try {
      const [topicData, matsData] = await Promise.all([
        getTopic(projectId, topicId),
        getMaterials(projectId, topicId)
      ])
      setTopic(topicData)
      // Convert array to map by type
      const matsMap = {}
      matsData.forEach(m => { matsMap[m.type] = m })
      setMaterials(matsMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [projectId, topicId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Poll for generating status
  useEffect(() => {
    const generating = Object.values(materials).some(m => m.status === 'generating')
    if (!generating) return
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [materials, loadData])

  const handleGenerateClick = (type) => {
    setDialog({ open: true, type, isAll: type === 'all' })
  }

  const handleConfirm = async () => {
    const type = dialog.type
    setDialog({ open: false, type: null })

    if (type === 'all') {
      await generateNotes(projectId, topicId)
      // slides, exercises, exam generators will be added later
    } else if (type === 'notes') {
      await generateNotes(projectId, topicId)
    } else if (type === 'slides') {
      await generateSlides(projectId, topicId)
    }

    // Optimistically show generating status
    setMaterials(prev => ({
      ...prev,
      [type === 'all' ? 'notes' : type]: { status: 'generating' }
    }))

    // Reload after short delay
    setTimeout(loadData, 2000)
  }

  const handleDownload = (type) => {
    downloadMaterial(projectId, topicId, type)
  }

  if (loading) return (
    <div className="text-center py-20" style={{ color: theme.textSecondary }}>
      <p className="text-4xl mb-4">⏳</p>
      <p>Loading topic...</p>
    </div>
  )

  if (!topic) return (
    <div className="text-center py-20" style={{ color: theme.textSecondary }}>
      <p className="text-4xl mb-4">❌</p>
      <p>Topic not found</p>
    </div>
  )

  return (
    <>
      <ConfirmDialog
        open={dialog.open}
        onConfirm={handleConfirm}
        onCancel={() => setDialog({ open: false, type: null })}
        estimatedCost={dialog.type ? ESTIMATED_COSTS[dialog.type] : 0}
        isAll={dialog.isAll}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6"
           style={{ color: theme.textSecondary }}>
        <Link to="/" style={{ color: theme.textSecondary }}>{t('nav.projects')}</Link>
        <span>›</span>
        <Link to={`/projects/${projectId}`} style={{ color: theme.textSecondary }}>
          Project
        </Link>
        <span>›</span>
        <span style={{ color: theme.text }}>
          {topic.number ? `Unit ${topic.number}` : topic.title}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {topic.number ? `${topic.number}. ` : ''}{topic.title}
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {topic.hours > 0 ? `${topic.hours}h · ` : ''}
            {topic.subtopics?.length || 0} sections
          </p>
        </div>
        <button
          onClick={() => handleGenerateClick('all')}
          className="px-5 py-2 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          ⚡ {t('materials.generate_all')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: topic info */}
        <div className="space-y-4">
          {topic.key_concepts?.length > 0 && (
            <div className="p-4 rounded-xl border"
                 style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: theme.textSecondary }}>Key concepts</h3>
              <div className="flex flex-wrap gap-2">
                {topic.key_concepts.map(c => (
                  <span key={c} className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: `${theme.primary}22`, color: theme.primary }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topic.subtopics?.length > 0 && (
            <div className="p-4 rounded-xl border"
                 style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: theme.textSecondary }}>Sections</h3>
              <ul className="space-y-1">
                {topic.subtopics.map((s, i) => (
                  <li key={i} className="text-xs py-1"
                      style={{
                        color: theme.textSecondary,
                        borderBottom: `1px solid ${theme.border}`
                      }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: material cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['notes', 'slides', 'exercises', 'exam'].map(type => (
            <MaterialCard
              key={type}
              type={type}
              material={materials[type]}
              onGenerate={handleGenerateClick}
              onDownload={handleDownload}
              projectId={projectId}
              topicId={topicId}
            />
          ))}
        </div>
      </div>
    </>
  )
}

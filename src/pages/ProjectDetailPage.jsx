import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import { getProject, getTopics, updateProject, getSourcesStatus, uploadSources, ingestSources, getIngestProgress, getComplianceStatus, generateComplianceReport, downloadComplianceReport, deleteProject } from '../services/api.js'

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
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('topics')
  const [project, setProject] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sourcesStatus, setSourcesStatus] = useState(null)
  const [ingesting, setIngesting] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [projectContext, setProjectContext] = useState('')
  const [contextSaved, setContextSaved] = useState(false)
  const [ingestProgress, setIngestProgress] = useState(null)
  const [complianceStatus, setComplianceStatus] = useState(null)
  const [complianceGenerating, setComplianceGenerating] = useState(false)

  // Derived — true while the curriculum parse hasn't produced any topics yet
  const isProcessing = !loading && topics.length === 0

  useEffect(() => {
    Promise.all([
      getProject(projectId),
      getTopics(projectId),
      getSourcesStatus(projectId),
      getComplianceStatus(projectId),
      getIngestProgress(projectId),
    ])
      .then(([proj, tops, srcStatus, compStatus, progress]) => {
        setProject(proj)
        setProjectContext(proj.context || '')
        setTopics(tops)
        setSourcesStatus(srcStatus)
        setComplianceStatus(compStatus)
        // Start polling if indexing is happening (has_pending covers the window
        // before the first progress file write; running covers page refreshes)
        if (srcStatus?.has_pending || progress?.status === 'running') {
          if (progress?.status === 'running') setIngestProgress(progress)
          setIngesting(true)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [projectId])

  // Poll topics every 5 s until they appear
  useEffect(() => {
    if (!isProcessing) return
    const id = setInterval(async () => {
      try {
        const tops = await getTopics(projectId)
        if (tops.length > 0) setTopics(tops)
      } catch {}
    }, 5000)
    return () => clearInterval(id)
  }, [isProcessing, projectId])

  // Poll sources status + ingest progress every 3 s while ingestion is running
  useEffect(() => {
    if (!ingesting) return
    const id = setInterval(async () => {
      try {
        const [status, progress] = await Promise.all([
          getSourcesStatus(projectId),
          getIngestProgress(projectId),
        ])
        setSourcesStatus(status)
        setIngestProgress(progress)
        // Stop polling once complete or the source record is marked ingested
        const done = progress?.status === 'complete' || progress?.status === 'error'
        const materialSources = (status.sources || []).filter(s => s.type === 'materials')
        if (done || (materialSources.length > 0 && materialSources[0].ingested)) {
          setIngesting(false)
          setIngestProgress(null)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(id)
  }, [ingesting, projectId])

  // Poll compliance status every 5 s while generating
  useEffect(() => {
    if (!complianceGenerating) return
    const id = setInterval(async () => {
      try {
        const status = await getComplianceStatus(projectId)
        setComplianceStatus(status)
        if (status.exists) {
          setComplianceGenerating(false)
          // Refresh project to get updated compliance_score
          const proj = await getProject(projectId)
          setProject(proj)
        }
      } catch {}
    }, 5000)
    return () => clearInterval(id)
  }, [complianceGenerating, projectId])

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
      {/* Processing banner */}
      {isProcessing && (
        <div className="mb-6 px-4 py-3 rounded-lg flex items-center gap-3"
             style={{ backgroundColor: `${theme.primary}22`, color: theme.primary }}>
          <span className="inline-block animate-spin text-lg">⟳</span>
          <span className="text-sm font-medium">Curriculum is being processed… this may take a few minutes.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/" className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>
            ← {t('nav.projects')}
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
              {project.name}
            </h1>
            {project.compliance_score != null && (
              <span
                className="text-sm font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: project.compliance_score >= 80
                    ? '#66BB6A22'
                    : project.compliance_score >= 60
                    ? '#FFA72622'
                    : '#EF535022',
                  color: project.compliance_score >= 80
                    ? '#66BB6A'
                    : project.compliance_score >= 60
                    ? '#FFA726'
                    : '#EF5350',
                }}
              >
                {project.compliance_score}%
              </span>
            )}
          </div>
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
          {/* Sources status indicator */}
          {sourcesStatus && (sourcesStatus.chunk_count > 0 || sourcesStatus.has_pending) && (
            <div className="flex items-center gap-2 flex-wrap">
              {sourcesStatus.chunk_count > 0 && (
                <span className="text-xs px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${theme.secondary}22`, color: theme.secondary }}>
                  ● {sourcesStatus.chunk_count.toLocaleString()} source chunks indexed
                </span>
              )}
              {sourcesStatus.has_pending && (
                <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: `${theme.primary}22`, color: theme.primary }}>
                  <span className="inline-block animate-spin">⟳</span>
                  {ingestProgress && ingestProgress.files_total > 0
                    ? `Indexing… ${ingestProgress.files_done}/${ingestProgress.files_total} files · ${(ingestProgress.chunks_done || 0).toLocaleString()} chunks`
                    : 'Indexing source materials…'
                  }
                </span>
              )}
            </div>
          )}

          {topics.length === 0 ? (
            <div className="text-center py-12" style={{ color: theme.textSecondary }}>
              <p className="text-4xl mb-3">⏳</p>
              <p className="font-medium mb-1" style={{ color: theme.text }}>
                Curriculum is being processed...
              </p>
              <p className="text-sm">
                Topics will appear here automatically once parsing completes.
              </p>
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
        <div className="space-y-6">

          {/* Summary row */}
          <div className="flex gap-6 p-4 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.secondary }}>
                {(sourcesStatus?.chunk_count || 0).toLocaleString()}
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>chunks indexed</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>
                {(sourcesStatus?.sources || []).filter(s => s.type === 'materials').length}
              </p>
              <p className="text-xs" style={{ color: theme.textSecondary }}>ZIPs uploaded</p>
            </div>
          </div>

          {/* Ingestion progress banner */}
          {ingesting && (
            <div className="px-4 py-4 rounded-lg"
                 style={{ backgroundColor: `${theme.primary}18`, borderColor: `${theme.primary}44`, border: '1px solid' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block animate-spin text-base" style={{ color: theme.primary }}>⟳</span>
                <span className="text-sm font-medium" style={{ color: theme.primary }}>
                  Indexing source materials…
                </span>
                {ingestProgress && ingestProgress.files_total > 0 && (
                  <span className="text-xs ml-auto" style={{ color: theme.textSecondary }}>
                    {ingestProgress.files_done}/{ingestProgress.files_total} files
                    {ingestProgress.chunks_done > 0 && ` · ${ingestProgress.chunks_done.toLocaleString()} chunks`}
                  </span>
                )}
              </div>
              {ingestProgress && ingestProgress.files_total > 0 && (
                <>
                  <div className="h-1.5 rounded-full overflow-hidden mb-2"
                       style={{ backgroundColor: `${theme.primary}33` }}>
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{
                           width: `${Math.round((ingestProgress.files_done / ingestProgress.files_total) * 100)}%`,
                           backgroundColor: theme.primary,
                         }} />
                  </div>
                  {ingestProgress.current_file && (
                    <p className="text-xs truncate" style={{ color: theme.textSecondary }}>
                      Current: {ingestProgress.current_file}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {uploadError && (
            <p className="text-xs px-3 py-2 rounded-lg"
               style={{ backgroundColor: '#EF535022', color: '#EF5350' }}>
              {uploadError}
            </p>
          )}

          {/* Uploaded ZIPs list */}
          {(sourcesStatus?.sources || []).filter(s => s.type === 'materials').length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3"
                  style={{ color: theme.textSecondary }}>
                Uploaded source files
              </h3>
              <div className="space-y-2">
                {(sourcesStatus.sources).filter(s => s.type === 'materials').map(s => (
                  <div key={s.id}
                       className="flex items-center gap-4 px-4 py-3 rounded-lg border"
                       style={{ backgroundColor: theme.bg, borderColor: theme.border }}>
                    <span className="text-xl flex-shrink-0">📦</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                        {s.filename}
                      </p>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>
                        {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.ingested ? (
                        <span className="text-xs font-medium" style={{ color: '#66BB6A' }}>
                          ✓ {s.chunk_count.toLocaleString()} chunks
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: theme.textSecondary }}>
                          ○ Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop zone */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-3"
                style={{ color: theme.textSecondary }}>
              Upload additional sources
            </h3>
            <label
              className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-colors"
              style={{
                borderColor:     ingesting ? theme.border : theme.primary,
                backgroundColor: ingesting ? theme.bg    : `${theme.primary}11`,
                cursor:          ingesting ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="file"
                accept=".zip"
                className="hidden"
                disabled={ingesting}
                onChange={async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  e.target.value = ''
                  setUploadError(null)
                  try {
                    await uploadSources(projectId, file)
                    // Refresh immediately so the new file appears in the list
                    const status = await getSourcesStatus(projectId)
                    setSourcesStatus(status)
                    setIngesting(true)
                    await ingestSources(projectId)
                  } catch (err) {
                    setUploadError(err.response?.data?.detail || err.message)
                    setIngesting(false)
                  }
                }}
              />
              <p className="text-2xl mb-2">📦</p>
              <p className="text-sm font-medium" style={{ color: ingesting ? theme.textSecondary : theme.text }}>
                {ingesting ? 'Indexing in progress…' : 'Drop a ZIP here or click to browse'}
              </p>
              <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                PDF, DOCX, PPTX, TXT files inside the ZIP will be indexed into ChromaDB
              </p>
            </label>
          </div>

        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Project context */}
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-medium text-sm" style={{ color: theme.text }}>Additional context</p>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Global instructions applied to all material generation for this project
                </p>
              </div>
            </div>
            <textarea
              value={projectContext}
              onChange={e => { setProjectContext(e.target.value); setContextSaved(false) }}
              placeholder="e.g. Always use real-world industry examples. Students are working professionals with 2+ years experience."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none mb-3"
              style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
            />
            <div className="flex items-center justify-between">
              {contextSaved && (
                <span className="text-xs" style={{ color: '#66BB6A' }}>Saved</span>
              )}
              <button
                onClick={async () => {
                  await updateProject(projectId, { context: projectContext })
                  setContextSaved(true)
                }}
                className="ml-auto px-4 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: theme.primary, color: '#fff' }}
              >
                Save context
              </button>
            </div>
          </div>

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
            className="p-5 rounded-xl border"
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium text-sm" style={{ color: theme.text }}>Compliance report</p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Checks that the teaching programme covers the official regulation
                  </p>
                  {complianceStatus?.exists && !complianceGenerating && (
                    <div className="flex items-center gap-2 mt-1">
                      {complianceStatus.compliance_score != null && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: complianceStatus.compliance_score >= 80
                              ? '#66BB6A22'
                              : complianceStatus.compliance_score >= 60
                              ? '#FFA72622'
                              : '#EF535022',
                            color: complianceStatus.compliance_score >= 80
                              ? '#66BB6A'
                              : complianceStatus.compliance_score >= 60
                              ? '#FFA726'
                              : '#EF5350',
                          }}
                        >
                          {complianceStatus.compliance_score}/100
                        </span>
                      )}
                      {complianceStatus.generated_at && (
                        <span className="text-xs" style={{ color: theme.textSecondary }}>
                          Last generated {new Date(complianceStatus.generated_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                  {!complianceStatus?.exists && !complianceGenerating && (
                    <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                      Not generated yet
                    </p>
                  )}
                  {complianceGenerating && (
                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: theme.primary }}>
                      <span className="inline-block animate-spin">⟳</span>
                      Generating compliance report…
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {complianceStatus?.exists && !complianceGenerating && (
                  <button
                    onClick={() => downloadComplianceReport(projectId)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                    style={{ borderColor: theme.primary, color: theme.primary }}
                  >
                    ↓ Download
                  </button>
                )}
                <button
                  disabled={complianceGenerating}
                  onClick={async () => {
                    setComplianceGenerating(true)
                    try {
                      await generateComplianceReport(projectId)
                    } catch {
                      setComplianceGenerating(false)
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: complianceGenerating ? theme.border : theme.primary,
                    color: complianceGenerating ? theme.textSecondary : '#fff',
                    cursor: complianceGenerating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {complianceStatus?.exists ? '↺ Regenerate' : '⚡ Generate'}
                </button>
              </div>
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

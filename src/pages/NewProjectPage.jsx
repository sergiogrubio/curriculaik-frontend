import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { createProject, uploadRegulation, uploadProgramme, uploadSources, parseCurriculum, ingestSources } from '../services/api.js'

function FileDropZone({ label, hint, accept, onFile, file, optional }) {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const borderColor = file ? theme.primary : theme.border
  const bgColor     = file ? theme.primary + '22' : theme.bg

  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
        {label}
        {optional && (
          <span className="ml-2 text-xs font-normal" style={{ color: theme.textSecondary }}>
            (optional)
          </span>
        )}
      </label>
      <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>{hint}</p>
      <label
        className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
        style={{ borderColor, backgroundColor: bgColor }}
      >
        <input type="file" accept={accept} className="hidden"
               onChange={e => onFile(e.target.files[0])} />
        {file ? (
          <div className="text-center">
            <p className="text-xl">✅</p>
            <p className="text-xs mt-1 font-medium" style={{ color: theme.primary }}>{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl">📁</p>
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {t('upload.drop_here')}
            </p>
          </div>
        )}
      </label>
    </div>
  )
}

function Input({ label, value, onChange, placeholder, required }) {
  const { theme } = useTheme()
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
        {label} {required && <span style={{ color: theme.primary }}>*</span>}
      </label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
        style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
      />
    </div>
  )
}

export default function NewProjectPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', subject: '', course: '',
    institution: '', language: 'English', module_code: ''
  })
  const [regulationFile, setRegulationFile] = useState(null)
  const [programmeFile,  setProgrammeFile]  = useState(null)
  const [sourcesFile,    setSourcesFile]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [step,     setStep]     = useState('')
  const [error,    setError]    = useState(null)

  const canSubmit = form.name && form.module_code && (regulationFile || programmeFile)

  const generateId = (name) =>
    name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) + '-' + Date.now().toString().slice(-4)

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      const projectId = generateId(form.name)

      setStep('Creating project...')
      await createProject({ id: projectId, ...form })

      if (regulationFile) {
        setStep('Uploading regulation...')
        await uploadRegulation(projectId, regulationFile)
      }
      if (programmeFile) {
        setStep('Uploading teaching programme...')
        await uploadProgramme(projectId, programmeFile)
      }
      if (sourcesFile) {
        setStep('Uploading source materials...')
        await uploadSources(projectId, sourcesFile)
      }

      setStep('Parsing curriculum...')
      await parseCurriculum(projectId)

      if (sourcesFile) {
        setStep('Ingesting source materials...')
        await ingestSources(projectId)
      }

      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      setLoading(false)
      setStep('')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link to="/" className="text-xs mb-2 block" style={{ color: theme.textSecondary }}>
          ← {t('nav.projects')}
        </Link>
        <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
          {t('nav.new_project')}
        </h1>
      </div>

      <div className="space-y-6 p-6 rounded-xl border"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>

        {/* Project info */}
        <div className="grid grid-cols-2 gap-4">
          <Input label={t('form.project_name')} value={form.name}
                 onChange={v => setForm({ ...form, name: v })}
                 placeholder="e.g. My subject 2024-25" required />
          <Input label={t('form.module_code')} value={form.module_code}
                 onChange={v => setForm({ ...form, module_code: v })}
                 placeholder="e.g. 0372" required />
          <Input label={t('form.subject')} value={form.subject}
                 onChange={v => setForm({ ...form, subject: v })}
                 placeholder="e.g. Database Administration" />
          <Input label={t('form.course')} value={form.course}
                 onChange={v => setForm({ ...form, course: v })}
                 placeholder="e.g. ASIR Year 1" />
          <Input label={t('form.institution')} value={form.institution}
                 onChange={v => setForm({ ...form, institution: v })}
                 placeholder="e.g. Your institution" />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
              {t('form.language')}
            </label>
            <select
              value={form.language}
              onChange={e => setForm({ ...form, language: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}
            >
              <option>English</option>
              <option>Español</option>
              <option>Català</option>
            </select>
          </div>
        </div>

        <hr style={{ borderColor: theme.border }} />

        {/* Curriculum sources */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm" style={{ color: theme.text }}>
              Curriculum sources
            </h3>
            <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
              At least one required. Both together enable compliance checking.
            </p>
          </div>
          <FileDropZone
            label={t('upload.regulation')}
            hint={t('upload.regulation_hint')}
            accept=".pdf"
            onFile={setRegulationFile}
            file={regulationFile}
          />
          <FileDropZone
            label={t('upload.curriculum')}
            hint={t('upload.curriculum_hint')}
            accept=".docx,.pdf"
            onFile={setProgrammeFile}
            file={programmeFile}
          />
        </div>

        <hr style={{ borderColor: theme.border }} />

        {/* Source materials */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm" style={{ color: theme.text }}>
              Source materials
            </h3>
            <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
              Optional. Your existing notes, slides, and books — used to enrich generated materials.
              More can be added later from the project page.
            </p>
          </div>
          <FileDropZone
            label={t('upload.sources')}
            hint={t('upload.sources_hint')}
            accept=".zip"
            onFile={setSourcesFile}
            file={sourcesFile}
            optional
          />
        </div>

        {error && (
          <p className="text-xs px-3 py-2 rounded-lg"
             style={{ backgroundColor: '#EF535022', color: '#EF5350' }}>
            {error}
          </p>
        )}

        <hr style={{ borderColor: theme.border }} />

        <div className="flex gap-3 justify-end items-center">
          {loading && step && (
            <p className="text-xs flex-1" style={{ color: theme.textSecondary }}>
              ⏳ {step}
            </p>
          )}
          <button onClick={() => navigate('/')}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-40"
                  style={{ borderColor: theme.border, color: theme.textSecondary }}>
            {t('actions.cancel')}
          </button>
          <button onClick={handleSubmit} disabled={loading || !canSubmit}
                  className="px-6 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: theme.primary, color: '#fff' }}>
            {loading ? step || '...' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  )
}

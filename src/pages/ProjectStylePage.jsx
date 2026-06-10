import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'

const TITLE_FONTS = [
  'Calibri', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'Trebuchet MS', 'Verdana', 'Tahoma', 'Palatino', 'Garamond'
]

const BODY_FONTS = [
  'Calibri', 'Arial', 'Helvetica', 'Georgia', 'Times New Roman',
  'Trebuchet MS', 'Verdana', 'Tahoma', 'Open Sans', 'Lato'
]

const CODE_FONTS = [
  'Courier New', 'Consolas', 'Monaco', 'Lucida Console', 'Menlo'
]

const PRESET_THEMES = [
  {
    id: 'dark_tech',
    name: 'Dark Tech',
    bg: '#0F1B2D', surface: '#1A2D42',
    primary: '#00D4AA', secondary: '#4A9EFF',
    text: '#FFFFFF', textSecondary: '#B0BEC5'
  },
  {
    id: 'light_academic',
    name: 'Light Academic',
    bg: '#F8FAFC', surface: '#FFFFFF',
    primary: '#2563EB', secondary: '#7C3AED',
    text: '#1E293B', textSecondary: '#64748B'
  },
  {
    id: 'neutral_corporate',
    name: 'Neutral Corporate',
    bg: '#F5F5F5', surface: '#FFFFFF',
    primary: '#16A34A', secondary: '#0891B2',
    text: '#1F2937', textSecondary: '#6B7280'
  },
  {
    id: 'warm_education',
    name: 'Warm Education',
    bg: '#FFFBF5', surface: '#FFFFFF',
    primary: '#D97706', secondary: '#DC2626',
    text: '#1C1917', textSecondary: '#78716C'
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    bg: '#0C1829', surface: '#112240',
    primary: '#64FFDA', secondary: '#CCD6F6',
    text: '#CCD6F6', textSecondary: '#8892B0'
  },
]

function ColorPicker({ label, value, onChange }) {
  const { theme } = useTheme()
  return (
    <div>
      <label className="block text-xs font-medium mb-1"
             style={{ color: theme.textSecondary }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
          style={{ backgroundColor: 'transparent' }}
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono"
          style={{
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text
          }}
        />
        <div className="w-8 h-8 rounded-lg border"
             style={{ backgroundColor: value, borderColor: theme.border }} />
      </div>
    </div>
  )
}

function FontSelect({ label, value, onChange, fonts }) {
  const { theme } = useTheme()
  return (
    <div>
      <label className="block text-xs font-medium mb-1"
             style={{ color: theme.textSecondary }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{
          backgroundColor: theme.bg,
          borderColor: theme.border,
          color: theme.text,
          fontFamily: value
        }}
      >
        {fonts.map(f => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>
      <p className="text-xs mt-1 px-1"
         style={{ color: theme.textSecondary, fontFamily: value }}>
        Preview: The quick brown fox jumps over the lazy dog
      </p>
    </div>
  )
}

function PreviewSlide({ style }) {
  return (
    <div className="rounded-lg overflow-hidden border"
         style={{ backgroundColor: style.bg, borderColor: style.primary, aspectRatio: '16/9' }}>
      {/* Header bar */}
      <div className="px-4 py-2 flex items-center justify-between"
           style={{ backgroundColor: style.surface }}>
        <div className="flex items-center gap-2">
          {style.logoPreview ? (
            <img src={style.logoPreview} alt="logo"
                 className="h-6 w-auto object-contain rounded" />
          ) : (
            <div className="w-6 h-6 rounded"
                 style={{ backgroundColor: style.primary }} />
          )}
          <span className="text-xs font-bold"
                style={{ color: style.text, fontFamily: style.titleFont }}>
            {style.institutionName || 'Institution'}
          </span>
        </div>
        <span className="text-xs" style={{ color: style.textSecondary }}>Unit 1</span>
      </div>

      {/* Slide content */}
      <div className="p-4 flex flex-col justify-center h-4/5">
        <div className="mb-1 text-xs font-bold"
             style={{ color: style.primary, fontFamily: style.titleFont }}>
          1.1
        </div>
        <div className="text-sm font-bold mb-3"
             style={{ color: style.text, fontFamily: style.titleFont }}>
          Introduction to Databases
        </div>
        <div className="space-y-1">
          {['What is a database?', 'Types of DBMS', 'SQL overview'].map(item => (
            <div key={item} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                   style={{ backgroundColor: style.primary }} />
              <span className="text-xs" style={{ color: style.textSecondary, fontFamily: style.bodyFont }}>
                {item}
              </span>
            </div>
          ))}
        </div>
        {/* Code block preview */}
        <div className="mt-3 px-2 py-1.5 rounded text-xs"
             style={{ backgroundColor: style.bg, border: `1px solid ${style.primary}33` }}>
          <span style={{ color: style.primary, fontFamily: style.codeFont }}>
            SELECT * FROM users;
          </span>
        </div>
      </div>
    </div>
  )
}

function PreviewDocument({ style }) {
  return (
    <div className="rounded-lg overflow-hidden border p-4"
         style={{ backgroundColor: style.surface, borderColor: style.border || '#E2E8F0' }}>
      {/* Doc header */}
      <div className="flex items-center justify-between mb-3 pb-2"
           style={{ borderBottom: `2px solid ${style.primary}` }}>
        <div>
          <p className="text-sm font-bold"
             style={{ color: style.text, fontFamily: style.titleFont }}>
            Unit 1 — Notes
          </p>
          <p className="text-xs"
             style={{ color: style.textSecondary, fontFamily: style.bodyFont }}>
            {style.institutionName || 'Institution'} · ASIR Year 1
          </p>
        </div>
        {style.logoPreview ? (
          <img src={style.logoPreview} alt="logo"
               className="h-8 w-auto object-contain" />
        ) : (
          <div className="w-8 h-8 rounded"
               style={{ backgroundColor: style.primary }} />
        )}
      </div>

      {/* Doc content */}
      <p className="text-xs font-bold mb-1"
         style={{ color: style.primary, fontFamily: style.titleFont }}>
        1.1 What is a Database?
      </p>
      <p className="text-xs leading-relaxed mb-2"
         style={{ color: style.text, fontFamily: style.bodyFont }}>
        A database is an organized collection of structured information or data,
        typically stored electronically in a computer system.
      </p>
      <div className="px-2 py-1.5 rounded text-xs"
           style={{ backgroundColor: style.bg, fontFamily: style.codeFont, color: style.primary }}>
        CREATE TABLE students (id INT, name VARCHAR(50));
      </div>
    </div>
  )
}

export default function ProjectStylePage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId } = useParams()
  const navigate = useNavigate()

  const [style, setStyle] = useState({
    // Colors
    bg:            '#0F1B2D',
    surface:       '#1A2D42',
    primary:       '#00D4AA',
    secondary:     '#4A9EFF',
    text:          '#FFFFFF',
    textSecondary: '#B0BEC5',
    // Typography
    titleFont: 'Calibri',
    bodyFont:  'Calibri',
    codeFont:  'Courier New',
    // Identity
    institutionName: '',
    logoFile:    null,
    logoPreview: null,
  })

  const [activePreview, setActivePreview] = useState('slide')
  const [saved, setSaved] = useState(false)

  const applyPreset = (preset) => {
    setStyle(prev => ({
      ...prev,
      bg:            preset.bg,
      surface:       preset.surface,
      primary:       preset.primary,
      secondary:     preset.secondary,
      text:          preset.text,
      textSecondary: preset.textSecondary,
    }))
  }

  const handleLogo = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setStyle(prev => ({
      ...prev,
      logoFile: file,
      logoPreview: e.target.result
    }))
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    // will call backend API later
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (key, value) => setStyle(prev => ({ ...prev, [key]: value }))

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6"
           style={{ color: theme.textSecondary }}>
        <Link to="/" style={{ color: theme.textSecondary }}>{t('nav.projects')}</Link>
        <span>›</span>
        <Link to={`/projects/${projectId}`} style={{ color: theme.textSecondary }}>
          Project
        </Link>
        <span>›</span>
        <span style={{ color: theme.text }}>Visual Style</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            Visual Style
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            Applied to all generated presentations and documents
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: saved ? '#66BB6A' : theme.primary,
            color: '#fff'
          }}
        >
          {saved ? '✓ Saved' : t('actions.save')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT: Controls */}
        <div className="space-y-6">

          {/* Preset themes */}
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h2 className="font-semibold mb-3" style={{ color: theme.text }}>
              Preset Themes
            </h2>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_THEMES.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className="p-2 rounded-lg border text-center transition-all hover:scale-105"
                  style={{
                    backgroundColor: preset.bg,
                    borderColor: preset.primary,
                  }}
                  title={preset.name}
                >
                  <div className="w-4 h-4 rounded-full mx-auto mb-1"
                       style={{ backgroundColor: preset.primary }} />
                  <p className="text-xs leading-tight"
                     style={{ color: preset.text, fontSize: '9px' }}>
                    {preset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h2 className="font-semibold mb-4" style={{ color: theme.text }}>
              Colors
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker label="Background"     value={style.bg}            onChange={v => set('bg', v)} />
              <ColorPicker label="Surface"        value={style.surface}       onChange={v => set('surface', v)} />
              <ColorPicker label="Primary"        value={style.primary}       onChange={v => set('primary', v)} />
              <ColorPicker label="Secondary"      value={style.secondary}     onChange={v => set('secondary', v)} />
              <ColorPicker label="Text"           value={style.text}          onChange={v => set('text', v)} />
              <ColorPicker label="Text Secondary" value={style.textSecondary} onChange={v => set('textSecondary', v)} />
            </div>
          </div>

          {/* Typography */}
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h2 className="font-semibold mb-4" style={{ color: theme.text }}>
              Typography
            </h2>
            <div className="space-y-4">
              <FontSelect label="Title font"  value={style.titleFont} onChange={v => set('titleFont', v)} fonts={TITLE_FONTS} />
              <FontSelect label="Body font"   value={style.bodyFont}  onChange={v => set('bodyFont', v)}  fonts={BODY_FONTS} />
              <FontSelect label="Code font"   value={style.codeFont}  onChange={v => set('codeFont', v)}  fonts={CODE_FONTS} />
            </div>
          </div>

          {/* Identity */}
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <h2 className="font-semibold mb-4" style={{ color: theme.text }}>
              Identity
            </h2>
            <div className="space-y-4">
              {/* Institution name */}
              <div>
                <label className="block text-xs font-medium mb-1"
                       style={{ color: theme.textSecondary }}>
                  Institution name
                </label>
                <input
                  value={style.institutionName}
                  onChange={e => set('institutionName', e.target.value)}
                  placeholder="e.g. Your institution"
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text
                  }}
                />
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-xs font-medium mb-1"
                       style={{ color: theme.textSecondary }}>
                  Logo (PNG/JPG)
                </label>
                <label
                  className="flex items-center gap-4 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
                  style={{
                    borderColor: style.logoPreview ? style.primary : theme.border,
                    backgroundColor: style.logoPreview ? `${style.primary}11` : theme.bg,
                  }}
                >
                  <input type="file" accept=".png,.jpg,.jpeg" className="hidden"
                         onChange={e => handleLogo(e.target.files[0])} />
                  {style.logoPreview ? (
                    <>
                      <img src={style.logoPreview} alt="logo"
                           className="h-10 w-auto object-contain rounded" />
                      <div>
                        <p className="text-xs font-medium" style={{ color: style.primary }}>
                          {style.logoFile?.name}
                        </p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>
                          Click to change
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🖼️</span>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>
                        Click to upload logo
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Live preview */}
        <div className="lg:sticky lg:top-20 space-y-4 self-start">
          <div className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: theme.text }}>
                Live Preview
              </h2>
              <div className="flex gap-2">
                {['slide', 'document'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActivePreview(tab)}
                    className="px-3 py-1 rounded text-xs font-medium capitalize transition-colors"
                    style={{
                      backgroundColor: activePreview === tab ? theme.primary : 'transparent',
                      color: activePreview === tab ? '#fff' : theme.textSecondary,
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {activePreview === 'slide' ? (
              <PreviewSlide style={style} />
            ) : (
              <PreviewDocument style={style} />
            )}

            <p className="text-xs mt-3 text-center" style={{ color: theme.textSecondary }}>
              This style will be applied to all generated .pptx and .docx files
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

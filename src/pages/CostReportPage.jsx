import { useTranslation } from 'react-i18next'
import { useParams, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useExchangeRate } from '../hooks/useExchangeRate.js'

// Mock data — will come from API
const mockCosts = {
  project: { name: 'Database Administration', id: 'db-admin-2024' },
  topics: [
    { id: 1, title: 'Introduction to DBMS', notes: 0.018, slides: 0.042, exercises: 0.011, exam: 0.009 },
    { id: 2, title: 'Entity-Relationship Model', notes: 0.021, slides: null, exercises: null, exam: null },
    { id: 3, title: 'Relational Model', notes: null, slides: null, exercises: null, exam: null },
  ],
  operations: [
    { name: 'curriculum_parser', cost: 0.008, date: '2024-09-01' },
    { name: 'ingestor (embeddings)', cost: 0.031, date: '2024-09-01' },
  ]
}

function fmt(val, symbol, convert, code) {
  if (val === null) return <span style={{ color: '#666' }}>—</span>
  return <span>{symbol}{convert(val, code).toFixed(4)}</span>
}

export default function CostReportPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { projectId } = useParams()
  const { convert } = useExchangeRate()
  const { currency } = useTheme()
  const s = currency.symbol
  const c = currency.code

  const topicTotal = (topic) =>
    [topic.notes, topic.slides, topic.exercises, topic.exam]
      .filter(v => v !== null)
      .reduce((a, b) => a + b, 0)

  const grandTotal =
    mockCosts.topics.reduce((a, t) => a + topicTotal(t), 0) +
    mockCosts.operations.reduce((a, o) => a + o.cost, 0)

  const handleExportCSV = () => {
    const rows = [
      ['Topic', 'Notes', 'Slides', 'Exercises', 'Exam', 'Total'],
      ...mockCosts.topics.map(t => [
        t.title,
        t.notes ?? '-', t.slides ?? '-',
        t.exercises ?? '-', t.exam ?? '-',
        topicTotal(t).toFixed(4)
      ]),
      [],
      ['Operation', 'Cost', 'Date'],
      ...mockCosts.operations.map(o => [o.name, o.cost.toFixed(4), o.date]),
      [],
      ['PROJECT TOTAL', grandTotal.toFixed(4)]
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cost_report_${projectId}.csv`
    a.click()
  }

  const thStyle = {
    color: theme.textSecondary,
    borderBottom: `1px solid ${theme.border}`,
    padding: '8px 12px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600'
  }

  const tdStyle = (highlight = false) => ({
    color: highlight ? theme.primary : theme.text,
    borderBottom: `1px solid ${theme.border}`,
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: highlight ? '700' : '400'
  })

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6"
           style={{ color: theme.textSecondary }}>
        <Link to="/" style={{ color: theme.textSecondary }}>{t('nav.projects')}</Link>
        <span>›</span>
        <Link to={`/projects/${projectId}`} style={{ color: theme.textSecondary }}>
          {mockCosts.project.name}
        </Link>
        <span>›</span>
        <span style={{ color: theme.text }}>{t('cost.report')}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: theme.text }}>
            {t('cost.report')}
          </h1>
          <p className="mt-1 text-sm" style={{ color: theme.textSecondary }}>
            {mockCosts.project.name}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: theme.border, color: theme.textSecondary }}
          >
            ↓ {t('cost.export_csv')}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t('cost.project_total'), value: grandTotal, color: theme.primary },
          {
            label: 'Materials',
            value: mockCosts.topics.reduce((a, t) => a + topicTotal(t), 0),
            color: theme.secondary
          },
          {
            label: 'Processing',
            value: mockCosts.operations.reduce((a, o) => a + o.cost, 0),
            color: theme.textSecondary
          },
        ].map(card => (
          <div key={card.label} className="p-5 rounded-xl border"
               style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
            <p className="text-xs mb-1" style={{ color: theme.textSecondary }}>{card.label}</p>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {s}{convert(card.value, c).toFixed(4)}
            </p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>{c}</p>
          </div>
        ))}
      </div>

      {/* Materials cost table */}
      <div className="rounded-xl border overflow-hidden mb-6"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="px-5 py-4 border-b"
             style={{ borderColor: theme.border }}>
          <h2 className="font-semibold" style={{ color: theme.text }}>
            Materials
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: theme.bg }}>
                <th style={thStyle}>{t('cost.topic')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{t('materials.notes')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{t('materials.slides')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{t('materials.exercises')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>{t('materials.exam')}</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {mockCosts.topics.map(topic => (
                <tr key={topic.id}>
                  <td style={tdStyle()}>
                    {topic.id}. {topic.title}
                  </td>
                  <td style={{ ...tdStyle(), textAlign: 'right' }}>
                    {fmt(topic.notes, s, convert, c)}
                  </td>
                  <td style={{ ...tdStyle(), textAlign: 'right' }}>
                    {fmt(topic.slides, s, convert, c)}
                  </td>
                  <td style={{ ...tdStyle(), textAlign: 'right' }}>
                    {fmt(topic.exercises, s, convert, c)}
                  </td>
                  <td style={{ ...tdStyle(), textAlign: 'right' }}>
                    {fmt(topic.exam, s, convert, c)}
                  </td>
                  <td style={{ ...tdStyle(true), textAlign: 'right' }}>
                    {s}{convert(topicTotal(topic), c).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing operations table */}
      <div className="rounded-xl border overflow-hidden"
           style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
        <div className="px-5 py-4 border-b"
             style={{ borderColor: theme.border }}>
          <h2 className="font-semibold" style={{ color: theme.text }}>
            Processing operations
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: theme.bg }}>
              <th style={thStyle}>{t('cost.operation')}</th>
              <th style={thStyle}>Date</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {mockCosts.operations.map(op => (
              <tr key={op.name}>
                <td style={tdStyle()}>{op.name}</td>
                <td style={tdStyle()}>{op.date}</td>
                <td style={{ ...tdStyle(true), textAlign: 'right' }}>
                  {s}{convert(op.cost, c).toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

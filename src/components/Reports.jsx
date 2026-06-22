import { getStage, fmtMoney } from '../utils.js'

export default function Reports({ clients }) {
  const accepted = clients.filter((c) => c.accepted && c.quote_value)
  const total = accepted.reduce((s, c) => s + Number(c.quote_value), 0)
  const avg = accepted.length ? Math.round(total / accepted.length) : 0
  const conv = clients.length
    ? Math.round((accepted.length / clients.length) * 100)
    : 0
  const fileCount = clients.reduce((s, c) => s + (c.client_files?.length || 0), 0)

  const stages = [
    { label: 'Nowe zapytania', count: clients.filter((c) => getStage(c) === 0).length, bg: '#E6F1FB', tc: '#0C447C' },
    { label: 'Etap wyceny', count: clients.filter((c) => getStage(c) === 1).length, bg: '#FAEEDA', tc: '#633806' },
    { label: 'Etap projektu', count: clients.filter((c) => getStage(c) === 2).length, bg: '#EAF3DE', tc: '#27500A' },
    { label: 'Ukończone', count: clients.filter((c) => getStage(c) === 3).length, bg: '#E1F5EE', tc: '#085041' },
  ]

  return (
    <div>
      <div className="page-title">Statystyki</div>
      <div className="page-sub">Podsumowanie wyników firmy</div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Łączna wartość zleceń</div>
          <div className="stat-val">{fmtMoney(total)}</div>
          <div className="stat-sub">zaakceptowane wyceny</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Współczynnik konwersji</div>
          <div className="stat-val">{conv}%</div>
          <div className="stat-sub">zapytanie → zlecenie</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Śr. wartość projektu</div>
          <div className="stat-val">{fmtMoney(avg)}</div>
          <div className="stat-sub">zaakceptowane</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pliki projektów</div>
          <div className="stat-val">{fileCount}</div>
          <div className="stat-sub">dodanych wizualizacji</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Rozkład etapów</div>
        </div>
        <div
          style={{
            padding: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
          }}
        >
          {stages.map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                borderRadius: 'var(--radius-md)',
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 600, color: s.tc }}>{s.count}</div>
              <div style={{ fontSize: 12, color: s.tc, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

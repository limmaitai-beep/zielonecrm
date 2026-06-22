import { getStage, fmtMoney, fmtDate } from '../utils.js'

const COLUMNS = [
  { stage: 0, label: 'Nowe zapytanie', icon: 'ti-user-plus', color: '#185FA5' },
  { stage: 1, label: 'Wycena', icon: 'ti-file-invoice', color: '#BA7517' },
  { stage: 2, label: 'Projekt', icon: 'ti-pencil-ruler', color: '#3B6D11' },
  { stage: 3, label: 'Ukończone', icon: 'ti-check', color: '#085041' },
]

export default function KanbanBoard({ clients, onOpenClient }) {
  return (
    <div>
      <div className="page-title">Etapy realizacji</div>
      <div className="page-sub">Status ogrodów na każdym etapie procesu</div>

      <div className="kanban">
        {COLUMNS.map((col) => {
          const items = clients.filter((c) => getStage(c) === col.stage)
          return (
            <div className="k-col" key={col.stage}>
              <div className="k-head" style={{ color: col.color }}>
                <span>
                  <i className={`ti ${col.icon}`} aria-hidden="true" style={{ fontSize: 14 }}></i>{' '}
                  {col.label}
                </span>
                <span className="k-count">{items.length}</span>
              </div>
              <div className="k-cards">
                {items.length === 0 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      textAlign: 'center',
                      padding: 8,
                    }}
                  >
                    Brak klientów
                  </div>
                ) : (
                  items.map((c) => (
                    <div className="k-card" key={c.id} onClick={() => onOpenClient(c.id)}>
                      <div className="k-card-name">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="k-card-loc">
                        <i className="ti ti-map-pin" aria-hidden="true" style={{ fontSize: 11 }}></i>{' '}
                        {c.city || '—'} {c.area_m2 ? `· ${c.area_m2} m²` : ''}
                      </div>
                      {c.quote_value > 0 && (
                        <div
                          className="k-card-date"
                          style={{ color: '#3B6D11', fontWeight: 600 }}
                        >
                          {fmtMoney(c.quote_value)}
                        </div>
                      )}
                      <div className="k-card-date">
                        {c.meeting_date
                          ? `Spotkanie: ${fmtDate(c.meeting_date)}`
                          : `Dodano: ${fmtDate(c.created_at)}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

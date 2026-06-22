import { getInitials } from '../utils.js'

const FILTERS = [
  { key: 'all', label: 'Wszyscy' },
  { key: 'noQuote', label: 'Bez wyceny' },
  { key: 'quoted', label: 'Wycena wysłana' },
  { key: 'accepted', label: 'Zaakceptowane' },
  { key: 'inProgress', label: 'W realizacji' },
  { key: 'done', label: 'Ukończone' },
]

function matchesFilter(c, filter) {
  switch (filter) {
    case 'noQuote':
      return !c.quoted
    case 'quoted':
      return c.quoted && !c.accepted
    case 'accepted':
      return c.accepted && !c.done
    case 'inProgress':
      return c.in_progress && !c.done
    case 'done':
      return c.done
    default:
      return true
  }
}

export default function ClientsList({
  clients,
  search,
  filter,
  setFilter,
  onOpenClient,
  onNewClient,
}) {
  let list = clients.filter((c) => matchesFilter(c, filter))
  if (search) {
    const q = search.toLowerCase()
    list = list.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.phone} ${c.city || ''}`
        .toLowerCase()
        .includes(q)
    )
  }

  return (
    <div>
      <div className="page-title">Klienci</div>
      <div className="page-sub">Pełna baza klientów firmy</div>

      <div className="filter-bar">
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Filtruj:</span>
        {FILTERS.map((f) => (
          <div
            key={f.key}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Lista klientów ({list.length})</div>
          <button className="btn btn-primary btn-sm" onClick={onNewClient}>
            <i className="ti ti-plus" aria-hidden="true"></i> Dodaj
          </button>
        </div>

        {list.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-search-off" aria-hidden="true"></i>
            <p>Brak klientów spełniających kryteria</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Klient</th>
                <th>Telefon</th>
                <th>Adres</th>
                <th>Wycena</th>
                <th>Akceptacja</th>
                <th>Projekt</th>
                <th>Ukończony</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => onOpenClient(c.id)}>
                  <td>
                    <div className="name-cell">
                      <div className="avatar">{getInitials(c)}</div>
                      <div>
                        <div className="name-main">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="name-sub">
                          {c.city || ''} {c.area_m2 ? c.area_m2 + ' m²' : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td style={{ fontSize: 12 }}>
                    {c.street ? c.street + ', ' : ''}
                    {c.city || '—'}
                  </td>
                  <td>
                    <span className={`badge ${c.quoted ? 'badge-yes' : 'badge-no'}`}>
                      <i className={`ti ${c.quoted ? 'ti-check' : 'ti-x'}`} aria-hidden="true"></i>
                      {c.quoted ? 'Tak' : 'Nie'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.accepted ? 'badge-yes' : 'badge-no'}`}>
                      <i className={`ti ${c.accepted ? 'ti-check' : 'ti-x'}`} aria-hidden="true"></i>
                      {c.accepted ? 'Tak' : 'Nie'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.design_ready ? 'badge-yes' : 'badge-no'}`}>
                      <i className={`ti ${c.design_ready ? 'ti-check' : 'ti-x'}`} aria-hidden="true"></i>
                      {c.design_ready ? 'Gotowy' : 'Nie'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.done ? 'badge-yes' : 'badge-no'}`}>
                      <i className={`ti ${c.done ? 'ti-check' : 'ti-x'}`} aria-hidden="true"></i>
                      {c.done ? 'Tak' : 'Nie'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenClient(c.id)
                      }}
                    >
                      <i className="ti ti-eye" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

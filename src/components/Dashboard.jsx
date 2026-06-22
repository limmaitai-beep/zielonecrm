import { getInitials, fmtMoney } from '../utils.js'

export default function Dashboard({ clients, onOpenClient }) {
  const total = clients.length
  const waitingQuote = clients.filter((c) => !c.quoted).length
  const active = clients.filter((c) => c.accepted && !c.done).length
  const done = clients.filter((c) => c.done).length
  const recent = [...clients]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)

  return (
    <div>
      <div className="page-title">Panel główny</div>
      <div className="page-sub">Przegląd aktualnej sytuacji firmy</div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Wszyscy klienci</div>
          <div className="stat-val">{total}</div>
          <div className="stat-sub">w bazie</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Oczekuje wyceny</div>
          <div className="stat-val">{waitingQuote}</div>
          <div className="stat-sub">do przygotowania</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Projekty w toku</div>
          <div className="stat-val">{active}</div>
          <div className="stat-sub">realizowanych</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ukończone</div>
          <div className="stat-val">{done}</div>
          <div className="stat-sub">łącznie</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Ostatnia aktywność</div>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-plant-2" aria-hidden="true"></i>
            <p>Brak klientów. Dodaj pierwszego klienta, aby zacząć.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Klient</th>
                <th>Telefon</th>
                <th>Miejscowość</th>
                <th>Wycena</th>
                <th>Projekt</th>
                <th>Wartość</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.id} className="clickable" onClick={() => onOpenClient(c.id)}>
                  <td>
                    <div className="name-cell">
                      <div className="avatar">{getInitials(c)}</div>
                      <div>
                        <div className="name-main">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="name-sub">{c.email || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.city || '—'}</td>
                  <td>
                    <span className={`badge ${c.quoted ? 'badge-yes' : 'badge-no'}`}>
                      <i className={`ti ${c.quoted ? 'ti-check' : 'ti-x'}`} aria-hidden="true"></i>
                      {c.quoted ? 'Tak' : 'Nie'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.design_ready ? 'badge-yes' : 'badge-no'}`}>
                      <i className={`ti ${c.design_ready ? 'ti-check' : 'ti-x'}`} aria-hidden="true"></i>
                      {c.design_ready ? 'Gotowy' : 'Nie'}
                    </span>
                  </td>
                  <td>
                    {c.quote_value ? (
                      <span className="value-badge">{fmtMoney(c.quote_value)}</span>
                    ) : (
                      '—'
                    )}
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

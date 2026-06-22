export function getInitials(c) {
  return (c.first_name?.[0] || '') + (c.last_name?.[0] || '')
}

export function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return '—'
  return dt.toLocaleDateString('pl-PL')
}

export function fmtMoney(v) {
  if (!v) return '—'
  return Number(v).toLocaleString('pl-PL') + ' zł'
}

export function fmtFileSize(bytes) {
  if (!bytes) return ''
  const kb = bytes / 1024
  if (kb < 1024) return Math.round(kb) + ' KB'
  return (kb / 1024).toFixed(1) + ' MB'
}

// Etap realizacji na podstawie statusów klienta (dla widoku Kanban)
export function getStage(c) {
  if (c.done) return 3
  if (c.in_progress || c.design_ready) return 2
  if (c.quoted || c.accepted) return 1
  return 0
}

export const STAGE_LABELS = [
  'Nowe zapytanie',
  'Wycena',
  'Projekt',
  'Ukończone',
]

export const STATUS_FIELDS = [
  { key: 'quoted', label: 'Wycena przygotowana', sub: 'Wycena wysłana do klienta' },
  { key: 'accepted', label: 'Wycena zaakceptowana', sub: 'Klient potwierdził zlecenie' },
  { key: 'design_ready', label: 'Projekt (wizualizacja) gotowy', sub: 'Projekt graficzny ukończony' },
  { key: 'in_progress', label: 'Realizacja w toku', sub: 'Prace ogrodowe w toku' },
  { key: 'done', label: 'Ogród ukończony', sub: 'Pełna realizacja zakończona' },
]

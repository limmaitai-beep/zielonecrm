import { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
import ClientsList from './components/ClientsList.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import Reports from './components/Reports.jsx'
import ClientModal from './components/ClientModal.jsx'
import DetailModal from './components/DetailModal.jsx'
import Toast from './components/Toast.jsx'
import { supabase } from './supabaseClient.js'

export default function App() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('zhg_authed') === 'true'
  )
  const [page, setPage] = useState('dashboard')
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingClient, setEditingClient] = useState(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [detailClientId, setDetailClientId] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (authed) loadClients()
  }, [authed])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function loadClients() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*, client_files(*), client_notes(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      showToast('Błąd wczytywania klientów: ' + error.message, 'error')
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  function handleLogout() {
    sessionStorage.removeItem('zhg_authed')
    setAuthed(false)
  }

  function openNewClient() {
    setEditingClient(null)
    setShowClientModal(true)
  }

  function openEditClient(client) {
    setEditingClient(client)
    setShowClientModal(true)
  }

  function openDetail(clientId) {
    setDetailClientId(clientId)
  }

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />
  }

  const detailClient = clients.find((c) => c.id === detailClientId)

  return (
    <div className="app-wrap">
      <div className="topbar">
        <div className="logo">
          <img src="/logo.png" alt="Zielone Hobby Garden" className="logo-img" />
          <div>
            <div className="logo-text">Zielone Hobby Garden</div>
            <div className="logo-sub">CRM — zarządzanie klientami</div>
          </div>
        </div>
        <div className="top-actions">
          <div className="search-bar">
            <i className="ti ti-search" aria-hidden="true"></i>
            <input
              placeholder="Szukaj klienta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={openNewClient}>
            <i className="ti ti-plus" aria-hidden="true"></i> Nowy klient
          </button>
          <button className="btn btn-sm" onClick={handleLogout} title="Wyloguj">
            <i className="ti ti-logout" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className="main">
        <div className="sidebar">
          <div className="nav-section">Menu</div>
          <div
            className={`nav-item ${page === 'dashboard' ? 'active' : ''}`}
            onClick={() => setPage('dashboard')}
          >
            <i className="ti ti-layout-dashboard" aria-hidden="true"></i> Panel główny
          </div>
          <div
            className={`nav-item ${page === 'clients' ? 'active' : ''}`}
            onClick={() => setPage('clients')}
          >
            <i className="ti ti-users" aria-hidden="true"></i> Klienci
          </div>
          <div
            className={`nav-item ${page === 'kanban' ? 'active' : ''}`}
            onClick={() => setPage('kanban')}
          >
            <i className="ti ti-layout-kanban" aria-hidden="true"></i> Etapy realizacji
          </div>
          <div className="nav-section">Raporty</div>
          <div
            className={`nav-item ${page === 'reports' ? 'active' : ''}`}
            onClick={() => setPage('reports')}
          >
            <i className="ti ti-chart-bar" aria-hidden="true"></i> Statystyki
          </div>
        </div>

        <div className="content">
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner"></div>
              <p>Wczytywanie danych...</p>
            </div>
          ) : (
            <>
              {page === 'dashboard' && (
                <Dashboard clients={clients} onOpenClient={openDetail} />
              )}
              {page === 'clients' && (
                <ClientsList
                  clients={clients}
                  search={search}
                  filter={filter}
                  setFilter={setFilter}
                  onOpenClient={openDetail}
                  onNewClient={openNewClient}
                />
              )}
              {page === 'kanban' && (
                <KanbanBoard clients={clients} onOpenClient={openDetail} />
              )}
              {page === 'reports' && <Reports clients={clients} />}
            </>
          )}
        </div>
      </div>

      {showClientModal && (
        <ClientModal
          client={editingClient}
          onClose={() => setShowClientModal(false)}
          onSaved={() => {
            setShowClientModal(false)
            loadClients()
            showToast(editingClient ? 'Dane klienta zaktualizowane' : 'Nowy klient dodany')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {detailClient && (
        <DetailModal
          client={detailClient}
          onClose={() => setDetailClientId(null)}
          onEdit={() => {
            setDetailClientId(null)
            openEditClient(detailClient)
          }}
          onChanged={loadClients}
          onDeleted={() => {
            setDetailClientId(null)
            loadClients()
            showToast('Klient usunięty')
          }}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

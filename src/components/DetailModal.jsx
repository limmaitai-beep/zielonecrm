import { useState } from 'react'
import { supabase, FILES_BUCKET } from '../supabaseClient.js'
import { fmtDate, fmtMoney, fmtFileSize, STATUS_FIELDS } from '../utils.js'

export default function DetailModal({
  client,
  onClose,
  onEdit,
  onChanged,
  onDeleted,
  onError,
}) {
  const [tab, setTab] = useState('info')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newNote, setNewNote] = useState('')
  const [deleting, setDeleting] = useState(false)

  const addr = [
    client.street,
    client.zip && client.city
      ? `${client.zip} ${client.city}`
      : client.city || client.zip,
  ]
    .filter(Boolean)
    .join(', ')

  async function toggleStatus(key) {
    const { error } = await supabase
      .from('clients')
      .update({ [key]: !client[key] })
      .eq('id', client.id)
    if (error) onError('Błąd zapisu statusu: ' + error.message)
    else onChanged()
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList)
    if (!files.length) return
    setUploading(true)
    setUploadProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `${client.id}/${Date.now()}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from(FILES_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        onError('Błąd przesyłania pliku: ' + uploadError.message)
        continue
      }

      const { error: dbError } = await supabase.from('client_files').insert({
        client_id: client.id,
        file_name: file.name,
        storage_path: path,
        file_size: file.size,
      })

      if (dbError) {
        onError('Błąd zapisu pliku: ' + dbError.message)
      }

      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setUploading(false)
    onChanged()
  }

  function dragOverHandler(e) {
    e.preventDefault()
    setDragOver(true)
  }
  function dragLeaveHandler() {
    setDragOver(false)
  }
  function dropHandler(e) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  async function downloadFile(f) {
    const { data, error } = await supabase.storage
      .from(FILES_BUCKET)
      .createSignedUrl(f.storage_path, 60)
    if (error) {
      onError('Błąd pobierania pliku: ' + error.message)
      return
    }
    window.open(data.signedUrl, '_blank')
  }

  async function removeFile(f) {
    if (!confirm(`Usunąć plik "${f.file_name}"?`)) return
    await supabase.storage.from(FILES_BUCKET).remove([f.storage_path])
    const { error } = await supabase.from('client_files').delete().eq('id', f.id)
    if (error) onError('Błąd usuwania pliku: ' + error.message)
    else onChanged()
  }

  async function addNote() {
    if (!newNote.trim()) return
    const { error } = await supabase
      .from('client_notes')
      .insert({ client_id: client.id, note_text: newNote.trim() })
    if (error) onError('Błąd zapisu notatki: ' + error.message)
    else {
      setNewNote('')
      onChanged()
    }
  }

  async function deleteClient() {
    if (!confirm('Czy na pewno usunąć tego klienta? Tej operacji nie można odwrócić.'))
      return
    setDeleting(true)
    const paths = (client.client_files || []).map((f) => f.storage_path)
    if (paths.length) await supabase.storage.from(FILES_BUCKET).remove(paths)

    const { error } = await supabase.from('clients').delete().eq('id', client.id)
    setDeleting(false)
    if (error) onError('Błąd usuwania klienta: ' + error.message)
    else onDeleted()
  }

  const files = client.client_files || []
  const notes = [...(client.client_notes || [])].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  )

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 700 }}>
        <div className="modal-head">
          <h3>
            {client.first_name} {client.last_name}
          </h3>
          <button className="btn btn-sm" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="tabs">
            <div className={`tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
              <i className="ti ti-user" aria-hidden="true" style={{ fontSize: 14 }}></i> Dane
            </div>
            <div
              className={`tab ${tab === 'status' ? 'active' : ''}`}
              onClick={() => setTab('status')}
            >
              <i className="ti ti-list-check" aria-hidden="true" style={{ fontSize: 14 }}></i> Statusy
            </div>
            <div className={`tab ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}>
              <i className="ti ti-files" aria-hidden="true" style={{ fontSize: 14 }}></i> Pliki projektów
              {files.length > 0 && ` (${files.length})`}
            </div>
            <div className={`tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>
              <i className="ti ti-note" aria-hidden="true" style={{ fontSize: 14 }}></i> Notatki
            </div>
          </div>

          {tab === 'info' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div className="detail-section-title">Dane kontaktowe</div>
                  <div className="detail-row">
                    <span>Telefon</span>
                    <span style={{ fontWeight: 600 }}>{client.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span>E-mail</span>
                    <span>{client.email || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Adres</span>
                    <span>{addr || '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Spotkanie</span>
                    <span>{client.meeting_date ? fmtDate(client.meeting_date) : '—'}</span>
                  </div>
                </div>
                <div>
                  <div className="detail-section-title">Szczegóły zlecenia</div>
                  <div className="detail-row">
                    <span>Pow. ogrodu</span>
                    <span>{client.area_m2 ? `${client.area_m2} m²` : '—'}</span>
                  </div>
                  <div className="detail-row">
                    <span>Wartość</span>
                    <span>{fmtMoney(client.quote_value)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Data dodania</span>
                    <span>{fmtDate(client.created_at)}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <div className="detail-section-title">Opis / notatka</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {client.note || 'Brak notatki.'}
                </div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={onEdit}>
                  <i className="ti ti-edit" aria-hidden="true"></i> Edytuj
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={deleteClient}
                  disabled={deleting}
                >
                  <i className="ti ti-trash" aria-hidden="true"></i>{' '}
                  {deleting ? 'Usuwanie...' : 'Usuń klienta'}
                </button>
              </div>
            </div>
          )}

          {tab === 'status' && (
            <div>
              <div className="detail-section-title" style={{ marginBottom: 12 }}>
                Postęp realizacji
              </div>
              {STATUS_FIELDS.map((s) => (
                <div className="toggle-row" key={s.key}>
                  <div>
                    <div className="toggle-label">{s.label}</div>
                    <div className="toggle-sub">{s.sub}</div>
                  </div>
                  <button
                    className={`toggle ${client[s.key] ? 'on' : ''}`}
                    onClick={() => toggleStatus(s.key)}
                    type="button"
                    aria-label={s.label}
                  ></button>
                </div>
              ))}
            </div>
          )}

          {tab === 'files' && (
            <div>
              <div
                className={`file-drop ${dragOver ? 'drag' : ''}`}
                onClick={() => document.getElementById('fileInputHidden').click()}
                onDragOver={dragOverHandler}
                onDragLeave={dragLeaveHandler}
                onDrop={dropHandler}
              >
                <i className="ti ti-cloud-upload" aria-hidden="true"></i>
                <p>Kliknij lub przeciągnij plik projektu</p>
                <small>Wizualizacje, plany, PDF, JPG, PNG, DWG — dowolna wielkość</small>
              </div>
              <input
                type="file"
                id="fileInputHidden"
                style={{ display: 'none' }}
                multiple
                onChange={(e) => handleFiles(e.target.files)}
              />

              {uploading && (
                <div className="upload-progress">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Przesyłanie... {uploadProgress}%
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="file-list">
                {files.length === 0 ? (
                  <div className="empty-state">
                    <i className="ti ti-file-off" aria-hidden="true"></i>
                    <p>Brak plików. Dodaj wizualizację lub plan projektu.</p>
                  </div>
                ) : (
                  files.map((f) => (
                    <div className="file-item" key={f.id}>
                      <i className="ti ti-file" aria-hidden="true"></i>
                      <div style={{ flex: 1 }}>
                        <div className="file-name">{f.file_name}</div>
                        <div className="file-size">
                          {fmtFileSize(f.file_size)} · {fmtDate(f.uploaded_at)}
                        </div>
                      </div>
                      <button className="btn btn-sm" onClick={() => downloadFile(f)}>
                        <i className="ti ti-download" aria-hidden="true"></i>
                      </button>
                      <button className="btn btn-sm" onClick={() => removeFile(f)}>
                        <i className="ti ti-trash" aria-hidden="true"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    fontSize: 13,
                    resize: 'none',
                    minHeight: 60,
                    outline: 'none',
                  }}
                  placeholder="Dodaj notatkę o kliencie..."
                />
                <button
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-end' }}
                  onClick={addNote}
                >
                  <i className="ti ti-plus" aria-hidden="true"></i>
                </button>
              </div>
              {notes.length === 0 ? (
                <div className="empty-state">
                  <i className="ti ti-note-off" aria-hidden="true"></i>
                  <p>Brak notatek.</p>
                </div>
              ) : (
                notes.map((n) => (
                  <div className="note-item" key={n.id}>
                    {n.note_text}
                    <div className="note-date">{fmtDate(n.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

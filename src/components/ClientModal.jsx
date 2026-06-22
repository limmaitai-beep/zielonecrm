import { useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { STATUS_FIELDS } from '../utils.js'

const emptyForm = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  street: '',
  city: '',
  zip: '',
  area_m2: '',
  quote_value: '',
  note: '',
  meeting_date: '',
  quoted: false,
  accepted: false,
  design_ready: false,
  in_progress: false,
  done: false,
}

export default function ClientModal({ client, onClose, onSaved, onError }) {
  const [form, setForm] = useState(() =>
    client
      ? {
          first_name: client.first_name || '',
          last_name: client.last_name || '',
          phone: client.phone || '',
          email: client.email || '',
          street: client.street || '',
          city: client.city || '',
          zip: client.zip || '',
          area_m2: client.area_m2 || '',
          quote_value: client.quote_value || '',
          note: client.note || '',
          meeting_date: client.meeting_date || '',
          quoted: !!client.quoted,
          accepted: !!client.accepted,
          design_ready: !!client.design_ready,
          in_progress: !!client.in_progress,
          done: !!client.done,
        }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggle(field) {
    setForm((f) => ({ ...f, [field]: !f[field] }))
  }

  async function handleSave() {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.phone.trim()) {
      onError('Podaj imię, nazwisko i telefon.')
      return
    }
    setSaving(true)

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      street: form.street.trim() || null,
      city: form.city.trim() || null,
      zip: form.zip.trim() || null,
      area_m2: form.area_m2 ? parseInt(form.area_m2) : 0,
      quote_value: form.quote_value ? parseFloat(form.quote_value) : 0,
      note: form.note.trim() || null,
      meeting_date: form.meeting_date || null,
      quoted: form.quoted,
      accepted: form.accepted,
      design_ready: form.design_ready,
      in_progress: form.in_progress,
      done: form.done,
    }

    let error
    if (client) {
      const res = await supabase.from('clients').update(payload).eq('id', client.id)
      error = res.error
    } else {
      const res = await supabase.from('clients').insert(payload)
      error = res.error
    }

    setSaving(false)

    if (error) {
      onError('Błąd zapisu: ' + error.message)
    } else {
      onSaved()
    }
  }

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <h3>{client ? 'Edytuj klienta' : 'Nowy klient'}</h3>
          <button className="btn btn-sm" onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Imię *</label>
              <input
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                placeholder="np. Anna"
              />
            </div>
            <div className="form-group">
              <label>Nazwisko *</label>
              <input
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
                placeholder="np. Kowalska"
              />
            </div>
            <div className="form-group">
              <label>Telefon *</label>
              <input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="+48 500 000 000"
              />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <input
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="adres@email.pl"
              />
            </div>
            <div className="form-group">
              <label>Ulica i numer</label>
              <input
                value={form.street}
                onChange={(e) => update('street', e.target.value)}
                placeholder="ul. Różana 5"
              />
            </div>
            <div className="form-group">
              <label>Miasto</label>
              <input
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="np. Kraków"
              />
            </div>
            <div className="form-group">
              <label>Kod pocztowy</label>
              <input
                value={form.zip}
                onChange={(e) => update('zip', e.target.value)}
                placeholder="00-000"
              />
            </div>
            <div className="form-group">
              <label>Powierzchnia ogrodu (m²)</label>
              <input
                type="number"
                value={form.area_m2}
                onChange={(e) => update('area_m2', e.target.value)}
                placeholder="np. 250"
              />
            </div>
            <div className="form-group form-full">
              <label>Wartość wyceny (zł)</label>
              <input
                type="number"
                value={form.quote_value}
                onChange={(e) => update('quote_value', e.target.value)}
                placeholder="np. 12000"
              />
            </div>
            <div className="form-group form-full">
              <label>Opis / notatka</label>
              <textarea
                value={form.note}
                onChange={(e) => update('note', e.target.value)}
                placeholder="Klient zainteresowany pergolą, oczkiem wodnym..."
              />
            </div>
            <div className="form-group form-full">
              <label>Termin spotkania</label>
              <input
                type="date"
                value={form.meeting_date}
                onChange={(e) => update('meeting_date', e.target.value)}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '.04em',
              }}
            >
              Statusy
            </div>
            {STATUS_FIELDS.map((s) => (
              <div className="toggle-row" key={s.key}>
                <div>
                  <div className="toggle-label">{s.label}</div>
                  <div className="toggle-sub">{s.sub}</div>
                </div>
                <button
                  className={`toggle ${form[s.key] ? 'on' : ''}`}
                  onClick={() => toggle(s.key)}
                  type="button"
                  aria-label={s.label}
                ></button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose} disabled={saving}>
            Anuluj
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <i className="ti ti-check" aria-hidden="true"></i>{' '}
            {saving ? 'Zapisywanie...' : 'Zapisz klienta'}
          </button>
        </div>
      </div>
    </div>
  )
}

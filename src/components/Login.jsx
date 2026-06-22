import { useState } from 'react'

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const correctPassword = import.meta.env.VITE_APP_PASSWORD
    if (password === correctPassword) {
      sessionStorage.setItem('zhg_authed', 'true')
      onSuccess()
    } else {
      setError('Nieprawidłowe hasło. Spróbuj ponownie.')
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          <i className="ti ti-leaf" aria-hidden="true"></i>
        </div>
        <h1>Zielone Hobby Garden</h1>
        <p>Wpisz hasło dostępu do CRM</p>
        {error && <div className="login-error">{error}</div>}
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary btn-full">
          Zaloguj się
        </button>
      </form>
    </div>
  )
}

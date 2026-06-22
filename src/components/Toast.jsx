export default function Toast({ message, type }) {
  return (
    <div className={`toast ${type === 'error' ? 'error' : ''}`}>
      <i
        className={`ti ${type === 'error' ? 'ti-alert-circle' : 'ti-check'}`}
        aria-hidden="true"
      ></i>
      {message}
    </div>
  )
}

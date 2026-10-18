export default function FormField({ label, htmlFor, required = false, hint, wide = false, children }) {
  return (
    <div className={`field${wide ? ' wide' : ''}`}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}
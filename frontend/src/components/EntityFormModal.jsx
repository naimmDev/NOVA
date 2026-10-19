import { useState } from 'react';
import FormField from './FormField';
import Modal from './Modal';

/*
  Form driven by a list of fields:
  { key, label, type, required, wide, hint, maxLength, rows, text, options }
  - type: 'text' (default) | 'email' | 'password' | 'date' | 'textarea' | 'checkbox' | 'multi'
  - required: true, or 'create' (required only when creating, e.g. the password)
  - options (multi): array or function (values) => [{ value, label }]
  `onSubmit(values)` must return a promise or object: { error } keeps the modal open.
*/
const isEmpty = (value) => {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim() === '';
  return value == null;
};

export default function EntityFormModal({ title, fields, initialValues, isNew, submitLabel, onSubmit, onClose }) {
  const [values, setValues] = useState(() => structuredClone(initialValues));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isRequired = (field) => field.required === true || (field.required === 'create' && isNew);
  const setValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const toggleItem = (key, id) =>
    setValues((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key].filter((item) => item !== id) : [...current[key], id],
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const missing = fields.find((field) => isRequired(field) && isEmpty(values[field.key]));
    if (missing) {
      setError(`Completa el campo «${missing.label}».`);
      return;
    }
    setSaving(true);
    // Text is trimmed; passwords are sent exactly as typed.
    const cleaned = Object.fromEntries(
      fields.map((field) => {
        const value = values[field.key];
        return [field.key, typeof value === 'string' && field.type !== 'password' ? value.trim() : value];
      }),
    );
    const result = await onSubmit(cleaned);
    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  };

  const renderControl = (field) => {
    const id = `entity-${field.key}`;
    const value = values[field.key];

    if (field.type === 'textarea') {
      return (
        <textarea id={id} rows={field.rows ?? 4} maxLength={field.maxLength} value={value}
          onChange={(event) => setValue(field.key, event.target.value)} />
      );
    }
    if (field.type === 'checkbox') {
      return (
        <label className="switch">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => setValue(field.key, event.target.checked)} />
          <span className="track" />
          <span>{field.text}</span>
        </label>
      );
    }
    if (field.type === 'multi') {
      const options = typeof field.options === 'function' ? field.options(values) : field.options;
      return (
        <div className="checks" role="group" aria-label={field.label}>
          {options.length ? options.map((option) => (
            <label key={option.value} className="chk">
              <input type="checkbox" checked={value.includes(option.value)} onChange={() => toggleItem(field.key, option.value)} />
              <span>{option.label}</span>
            </label>
          )) : <span className="muted">Aún no hay opciones activas.</span>}
        </div>
      );
    }
    return (
      <input id={id} type={field.type ?? 'text'} value={value} maxLength={field.maxLength}
        autoComplete={field.type === 'password' ? 'new-password' : undefined}
        onChange={(event) => setValue(field.key, event.target.value)} />
    );
  };

  const footer = (
    <>
      <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
      <button type="submit" form="entity-form" className="btn primary" disabled={saving}>{submitLabel}</button>
    </>
  );

  return (
    <Modal title={title} onClose={onClose} footer={footer}>
      <form id="entity-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <FormField
            key={field.key}
            label={field.label}
            htmlFor={field.type === 'multi' || field.type === 'checkbox' ? undefined : `entity-${field.key}`}
            required={isRequired(field)}
            hint={field.hint}
            wide={field.wide}
          >
            {renderControl(field)}
          </FormField>
        ))}
        {error && <div className="alert wide" role="alert">{error}</div>}
      </form>
    </Modal>
  );
}
import { useState } from 'react';
import Modal from '../../components/Modal';
import FormField from '../../components/FormField';
import { saveAgenda } from '../../services/agendaService';
import { getGroupsForUser, getStudentsInGroups, getSubjectsForTeacher } from '../../services/userService';
import { PERIOD_LABELS, getFullName, toDateOnly } from '../../utils/formatters';

function buildInitialValues(agenda, groupIds, studentIds) {
  if (!agenda) {
    return { asignaturaId: '', periodo: 'SEMANAL', fechaInicio: '', fechaFin: '', actividades: '', observaciones: '', publicada: false, groupIds: [], studentIds: [] };
  }
  return {
    asignaturaId: agenda.asignaturaId,
    periodo: agenda.periodo,
    fechaInicio: toDateOnly(agenda.fechaInicio),
    fechaFin: toDateOnly(agenda.fechaFin),
    actividades: agenda.actividades,
    observaciones: agenda.observaciones ?? '',
    publicada: agenda.publicada,
    groupIds: agenda.groupIds.filter((id) => groupIds.includes(id)),
    studentIds: agenda.studentIds.filter((id) => studentIds.includes(id)),
  };
}

export default function AgendaFormModal({ teacher, agenda = null, onClose, onSaved }) {
  const subjects = getSubjectsForTeacher(teacher.id);
  const groups = getGroupsForUser(teacher);
  const students = getStudentsInGroups(groups.map((group) => group.id));
  const [values, setValues] = useState(() =>
    buildInitialValues(agenda, groups.map((group) => group.id), students.map((student) => student.id)));
  const [error, setError] = useState('');

  const setField = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const toggleId = (name, id) =>
    setValues((current) => ({
      ...current,
      [name]: current[name].includes(id) ? current[name].filter((item) => item !== id) : [...current[name], id],
    }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = saveAgenda(teacher, values, agenda?.id ?? null);
    if (result.error) setError(result.error);
    else onSaved(result.isNew);
  };

  const footer = (
    <>
      <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
      <button type="submit" form="agenda-form" className="btn primary">{agenda ? 'Guardar cambios' : 'Crear agenda'}</button>
    </>
  );

  return (
    <Modal title={agenda ? 'Editar agenda' : 'Nueva agenda'} onClose={onClose} footer={footer}>
      <form id="agenda-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <FormField label="Asignatura" htmlFor="agenda-subject" required>
          <select id="agenda-subject" value={values.asignaturaId}
            onChange={(event) => setField('asignaturaId', event.target.value ? Number(event.target.value) : '')}>
            <option value="">Seleccionar…</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.nombre}</option>)}
          </select>
        </FormField>
        <FormField label="Período" htmlFor="agenda-period" required>
          <select id="agenda-period" value={values.periodo} onChange={(event) => setField('periodo', event.target.value)}>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </FormField>
        <FormField label="Fecha de inicio" htmlFor="agenda-start" required>
          <input id="agenda-start" type="date" value={values.fechaInicio} onChange={(event) => setField('fechaInicio', event.target.value)} />
        </FormField>
        <FormField label="Fecha de fin" htmlFor="agenda-end" required>
          <input id="agenda-end" type="date" value={values.fechaFin} onChange={(event) => setField('fechaFin', event.target.value)} />
        </FormField>
        <FormField label="Actividades" htmlFor="agenda-activities" required wide>
          <textarea id="agenda-activities" rows="5" value={values.actividades} onChange={(event) => setField('actividades', event.target.value)} />
        </FormField>
        <FormField label="Observaciones" htmlFor="agenda-notes" wide hint="Opcional. Materiales, recordatorios o aclaraciones.">
          <textarea id="agenda-notes" rows="2" value={values.observaciones} onChange={(event) => setField('observaciones', event.target.value)} />
        </FormField>
        <FormField label="Grupos destinatarios" wide>
          <div className="checks">
            {groups.length ? groups.map((group) => (
              <label key={group.id} className="chk">
                <input type="checkbox" checked={values.groupIds.includes(group.id)} onChange={() => toggleId('groupIds', group.id)} />
                <span>{group.nombre}</span>
              </label>
            )) : <span className="muted">No tienes grupos asignados.</span>}
          </div>
        </FormField>
        <FormField label="Estudiantes específicos" wide hint="Opcional. Úsalo para dirigir la agenda solo a algunos estudiantes.">
          <div className="checks scroll">
            {students.map((student) => (
              <label key={student.id} className="chk">
                <input type="checkbox" checked={values.studentIds.includes(student.id)} onChange={() => toggleId('studentIds', student.id)} />
                <span>{getFullName(student)}</span>
              </label>
            ))}
          </div>
        </FormField>
        <FormField label="Estado" wide>
          <label className="switch">
            <input type="checkbox" checked={values.publicada} onChange={(event) => setField('publicada', event.target.checked)} />
            <span className="track" />
            <span>Publicar para los destinatarios</span>
          </label>
        </FormField>
        {error && <div className="alert wide" role="alert">{error}</div>}
      </form>
    </Modal>
  );
}
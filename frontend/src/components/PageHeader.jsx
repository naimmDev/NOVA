export default function PageHeader({ title, description, action }) {
  return (
    <div className="page-head">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
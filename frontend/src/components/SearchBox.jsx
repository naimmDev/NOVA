import Icon from './Icon';

export default function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="search">
      <Icon name="search" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
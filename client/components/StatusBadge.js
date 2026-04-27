export function StatusBadge({ value }) {
  const name = String(value || "").toLowerCase().replace(/\s+/g, "-");
  return <span className={`status ${name}`}>{value}</span>;
}

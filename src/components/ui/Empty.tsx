export default function Empty({ label = 'No data found' }: { label?: string }) {
  return <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8', fontSize: 14 }}>{label}</div>
}

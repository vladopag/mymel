export default function About() {
  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <div className="glass-card" style={{ padding: '3rem' }}>
        <h2 style={{ color: 'var(--accent-sand)', marginBottom: '1.5rem' }}>About MyMEL</h2>
        <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          MyMEL is a next-generation media tracking application developed using standard GitOps workflows, featuring a robust Java Spring Boot backend, a lightning-fast React + Vite frontend, and a PostgreSQL database.
        </p>
        <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
          The styling uses pure Vanilla CSS to maintain low overhead, fast loading times, and full control over our customized Tropical theme.
        </p>
      </div>
    </div>
  )
}

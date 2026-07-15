import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--accent-sand)' }}>
          Track Your Tropical Media Escape
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.1rem' }}>
          MyMEL helps you catalog and rate your favorite movies, anime, and games. Manage your progress with zero effort and stay on top of your watchlists.
        </p>
        <Link to="/library" className="btn btn-accent">
          View Your Library
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--primary-light)', marginBottom: '0.75rem' }}>🎬 Movies & Shows</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Keep tabs on films, seasons, and release dates in your watchlist.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--primary-light)', marginBottom: '0.75rem' }}>🌸 Anime List</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Track episodes watched, status updates, and seasonal shows.</p>
        </div>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ color: 'var(--primary-light)', marginBottom: '0.75rem' }}>🎮 Video Games</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Log game completions, achievements, and hours played.</p>
        </div>
      </div>
    </div>
  )
}

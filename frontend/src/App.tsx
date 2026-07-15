import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axiosClient from './api/axiosClient'
import { useAuth } from './context/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

interface MediaEntry {
  id: number;
  title: string;
  type: 'MOVIE' | 'ANIME' | 'GAME';
  status: 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'PLAYING' | 'ON_HOLD' | 'DROPPED';
  rating: number;
  episodesWatched?: number;
  totalEpisodes?: number;
  notes?: string;
}

function Home() {
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

function Library() {
  const { data: mediaList, isLoading, error } = useQuery<MediaEntry[]>({
    queryKey: ['media'],
    queryFn: () => axiosClient.get('/media'),
  })

  const getStatusClass = (status: string) => {
    return status.toLowerCase().replace(/_/g, '_');
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Media Library</h2>
        <button className="btn btn-accent">+ Add Media</button>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Loading catalog...</div>
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid #ff4a4a', marginBottom: '2rem' }}>
          <h3 style={{ color: '#ff4a4a', marginBottom: '0.5rem' }}>Connection Offline</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Could not connect to the backend API. Running with local demo catalog.</p>
        </div>
      )}

      {(!isLoading && (!mediaList || mediaList.length === 0)) && (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌴</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Your Library is Empty</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No movies, anime, or games have been added to your tracker yet.</p>
          <button className="btn">Add Your First Item</button>
        </div>
      )}

      {(!isLoading && mediaList && mediaList.length > 0) && (
        <div className="glass-card glass-table-container" style={{ padding: '1rem' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mediaList.map((media) => (
                <tr key={media.id}>
                  <td style={{ fontWeight: 600 }}>{media.title}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {media.type.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip ${getStatusClass(media.status)}`}>
                      {formatStatus(media.status)}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                      {media.rating > 0 ? `${media.rating} / 10` : 'Unrated'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>Edit</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function About() {
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

function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem', background: 'linear-gradient(to right, var(--accent-sand), var(--accent-gold))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🌴 MyMEL
        </h1>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" style={{ fontWeight: 600 }}>Home</Link>
          <Link to="/library" style={{ fontWeight: 600 }}>Library</Link>
          <Link to="/about" style={{ fontWeight: 600 }}>About</Link>
          
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-sand)' }}>
                👤 {user?.username}
              </span>
              <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.05)' }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
              <Link to="/login" className="btn btn-sm" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-sm btn-accent">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/library" 
            element={
              <ProtectedRoute>
                <Library />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <footer style={{ textAlign: 'center', padding: '3rem 0 2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', borderTop: '1px solid var(--glass-border)', marginTop: '4rem' }}>
        &copy; 2026 MyMEL Media Tracker. Created under GitOps Standards.
      </footer>
    </div>
  )
}

export default App

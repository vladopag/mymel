import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Library from './pages/Library'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import logoUrl from './assets/logo.png'

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
          <img src={logoUrl} alt="Logo" style={{ width: '32px', height: '32px', verticalAlign: 'middle' }} /> MyMEL
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
        &copy; 2026 MyMEL - My Media List
      </footer>
    </div>
  )
}

export default App

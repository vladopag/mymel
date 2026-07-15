import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(username, email, password);
      navigate('/library');
    } catch (err: unknown) {
      const axiosError = err as import('axios').AxiosError<string>;
      setError(axiosError.response?.data || 'Failed to create an account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
      <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '420px' }}>
        <h2 style={{ color: 'var(--accent-sand)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '2rem' }}>
          Create an account
        </h2>
        
        {error && (
          <div style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="username" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Username</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#fff',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#fff',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#fff',
                outline: 'none',
                transition: 'var(--transition-fast)'
              }}
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-accent" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {isSubmitting ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

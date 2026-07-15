import { useQuery } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'

export interface MediaEntry {
  id: number;
  title: string;
  type: 'MOVIE' | 'ANIME' | 'GAME';
  status: 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'PLAYING' | 'ON_HOLD' | 'DROPPED';
  rating: number;
  episodesWatched?: number;
  totalEpisodes?: number;
  notes?: string;
}

export default function Library() {
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

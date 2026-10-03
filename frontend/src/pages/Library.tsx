import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '../api/axiosClient'
import MediaFormModal from '../components/MediaFormModal'

export interface MediaEntry {
  id: number;
  title: string;
  type: 'MOVIE' | 'ANIME' | 'GAME' | 'TV_SHOW' | 'BOOK';
  status: 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'PLAYING' | 'ON_HOLD' | 'DROPPED';
  rating: number;
  episodesWatched?: number;
  totalEpisodes?: number;
  review?: string;
  personalNotes?: string;
}

const MultiSelectDropdown = ({ options, selectedValues, onChange, placeholder }: {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const displayText = selectedValues.length > 0 
    ? options.filter(o => selectedValues.includes(o.value)).map(o => o.label).join(', ')
    : placeholder;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '200px' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <span>{displayText}</span>
        <span style={{ fontSize: '0.8em', marginLeft: '0.5rem' }}>▼</span>
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', zIndex: 10, maxHeight: '250px', overflowY: 'auto', marginTop: '0.25rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)' }}>
          {options.map(option => (
            <label key={option.value} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem', cursor: 'pointer', color: '#fff', gap: '0.5rem', transition: 'background 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <input 
                type="checkbox" 
                checked={selectedValues.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                style={{ cursor: 'pointer' }}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Library() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<{ type: string[], status: string[], rating: string[] }>(() => {
    const saved = localStorage.getItem('mymel_library_filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved filters', e);
      }
    }
    return { type: [], status: [], rating: [] };
  });

  useEffect(() => {
    localStorage.setItem('mymel_library_filters', JSON.stringify(filters));
  }, [filters]);
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof MediaEntry | null, direction: 'asc' | 'desc' }>({ key: 'title', direction: 'asc' })
  const progressSnapshotRef = useRef<Record<number, number>>({})

  const { data: mediaList, isLoading, error } = useQuery<MediaEntry[]>({
    queryKey: ['media'],
    queryFn: () => axiosClient.get('/media'),
  })

  const filteredAndSortedMedia = useMemo(() => {
    if (!mediaList) return []

    let result = mediaList

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter((item) => item.title.toLowerCase().includes(lowerQuery))
    }

    if (filters.type.length > 0) {
      result = result.filter(item => filters.type.includes(item.type))
    }
    
    if (filters.status.length > 0) {
      result = result.filter(item => filters.status.includes(item.status))
    }

    if (filters.rating.length > 0) {
      result = result.filter(item => {
        if (filters.rating.includes('unrated') && (!item.rating || item.rating === 0)) return true;
        return filters.rating.some(r => r !== 'unrated' && parseInt(r, 10) === item.rating);
      });
    }

    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const key = sortConfig.key as keyof MediaEntry
        let aVal = a[key]
        let bVal = b[key]

        if (key === 'episodesWatched') {
          aVal = progressSnapshotRef.current[a.id] ?? aVal ?? 0
          bVal = progressSnapshotRef.current[b.id] ?? bVal ?? 0
        }

        if (aVal === undefined && bVal === undefined) return 0
        if (aVal === undefined) return 1
        if (bVal === undefined) return -1

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
        }

        return 0
      })
    }

    return result
  }, [mediaList, searchQuery, sortConfig, filters])

  const handleSort = (key: keyof MediaEntry) => {
    if (key === 'episodesWatched') {
      const snapshot: Record<number, number> = {}
      mediaList?.forEach(m => {
        snapshot[m.id] = m.episodesWatched ?? 0
      })
      progressSnapshotRef.current = snapshot
    }
    
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const quickTrackMutation = useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) =>
      axiosClient.patch(`/media/${id}/episodes?delta=${delta}`),
    onMutate: async ({ id, delta }) => {
      await queryClient.cancelQueries({ queryKey: ['media'] })
      const previousMedia = queryClient.getQueryData<MediaEntry[]>(['media'])
      if (previousMedia) {
        queryClient.setQueryData<MediaEntry[]>(['media'], (old) =>
          old?.map((item) => {
            if (item.id === id && (item.type === 'ANIME' || item.type === 'TV_SHOW')) {
              const current = item.episodesWatched ?? 0
              const max = item.totalEpisodes && item.totalEpisodes > 0 ? item.totalEpisodes : Infinity
              const updated = Math.min(max, Math.max(0, current + delta))
              return { ...item, episodesWatched: updated }
            }
            return item
          })
        )
      }
      return { previousMedia }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMedia) {
        queryClient.setQueryData(['media'], context.previousMedia)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })

  const createMutation = useMutation({
    mutationFn: (newMedia: Omit<MediaEntry, 'id'>) => axiosClient.post('/media', newMedia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || JSON.stringify(error.response?.data) || error.message;
      alert(`Failed to create entry: ${msg}`);
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<MediaEntry, 'id'> }) =>
      axiosClient.put(`/media/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || JSON.stringify(error.response?.data) || error.message;
      alert(`Failed to update entry: ${msg}`);
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => axiosClient.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
    },
  })

  const handleOpenAddModal = () => {
    setSelectedMedia(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (media: MediaEntry) => {
    setSelectedMedia(media)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this media entry?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleFormSubmit = (formData: Omit<MediaEntry, 'id'>) => {
    if (selectedMedia) {
      updateMutation.mutate({ id: selectedMedia.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const getStatusClass = (status: string) => {
    return status.toLowerCase().replace(/_/g, '_');
  };

  const formatStatus = (status: string, type?: string) => {
    if (type === 'GAME' && status === 'PLAN_TO_WATCH') {
      return 'Plan To Play';
    }
    if (type === 'BOOK' && status === 'PLAN_TO_WATCH') {
      return 'Plan To Read';
    }
    if (type === 'BOOK' && status === 'WATCHING') {
      return 'Reading';
    }
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Media Library</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
          />
          <button onClick={handleOpenAddModal} className="btn btn-accent">+ Add Media</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <MultiSelectDropdown
          options={[
            { value: 'ANIME', label: 'Anime' },
            { value: 'MOVIE', label: 'Movie' },
            { value: 'TV_SHOW', label: 'TV Show' },
            { value: 'GAME', label: 'Game' },
            { value: 'BOOK', label: 'Book' }
          ]}
          selectedValues={filters.type}
          onChange={(values) => setFilters(prev => ({ ...prev, type: values }))}
          placeholder="All Types"
        />
        <MultiSelectDropdown
          options={[
            { value: 'WATCHING', label: 'Watching' },
            { value: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'PLAYING', label: 'Playing' },
            { value: 'ON_HOLD', label: 'On Hold' },
            { value: 'DROPPED', label: 'Dropped' }
          ]}
          selectedValues={filters.status}
          onChange={(values) => setFilters(prev => ({ ...prev, status: values }))}
          placeholder="All Statuses"
        />
        <MultiSelectDropdown
          options={[
            { value: '10', label: '10' },
            { value: '9', label: '9' },
            { value: '8', label: '8' },
            { value: '7', label: '7' },
            { value: '6', label: '6' },
            { value: '5', label: '5' },
            { value: '4', label: '4' },
            { value: '3', label: '3' },
            { value: '2', label: '2' },
            { value: '1', label: '1' },
            { value: 'unrated', label: 'Unrated' }
          ]}
          selectedValues={filters.rating}
          onChange={(values) => setFilters(prev => ({ ...prev, rating: values }))}
          placeholder="All Ratings"
        />
        <button 
          onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
          className="btn btn-sm"
          style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}
          title="More Filters"
        >
          +
        </button>
      </div>

      {isMoreFiltersOpen && (
        <div className="glass-card fade-in" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, alignSelf: 'center' }}>
            Additional filters (Tags, Authors, etc.) coming soon...
          </p>
        </div>
      )}

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
          <button onClick={handleOpenAddModal} className="btn">Add Your First Item</button>
        </div>
      )}

      {(!isLoading && mediaList && mediaList.length > 0) && (
        <div className="glass-card glass-table-container" style={{ padding: '1rem' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Type {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('episodesWatched')} style={{ cursor: 'pointer' }}>Progress {sortConfig.key === 'episodesWatched' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th onClick={() => handleSort('rating')} style={{ cursor: 'pointer' }}>Rating {sortConfig.key === 'rating' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedMedia.map((media) => (
                <tr key={media.id}>
                  <td style={{ fontWeight: 600 }}>{media.title}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                      {media.type.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-chip ${getStatusClass(media.status)}`}>
                      {formatStatus(media.status, media.type)}
                    </span>
                  </td>
                  <td>
                    {media.type === 'ANIME' || media.type === 'TV_SHOW' ? (
                      <div className="quick-tracker">
                        <button
                          className="quick-tracker-btn"
                          aria-label="Decrement episode"
                          disabled={quickTrackMutation.isPending || (media.episodesWatched ?? 0) <= 0}
                          onClick={() => quickTrackMutation.mutate({ id: media.id, delta: -1 })}
                        >
                          -
                        </button>
                        <span className="quick-tracker-count">
                          {media.episodesWatched ?? 0} / {media.totalEpisodes && media.totalEpisodes > 0 ? media.totalEpisodes : '?'}
                        </span>
                        <button
                          className="quick-tracker-btn"
                          aria-label="Increment episode"
                          disabled={
                            quickTrackMutation.isPending ||
                            (Boolean(media.totalEpisodes && media.totalEpisodes > 0) &&
                              (media.episodesWatched ?? 0) >= (media.totalEpisodes ?? 0))
                          }
                          onClick={() => quickTrackMutation.mutate({ id: media.id, delta: 1 })}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>N/A</span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                      {media.rating > 0 ? `${media.rating} / 10` : 'Unrated'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEditModal(media)} className="btn btn-sm" style={{ background: 'var(--glass-bg)', color: 'var(--text-main)' }}>Edit</button>
                      <button onClick={() => handleDelete(media.id)} className="btn btn-sm" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.2)' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MediaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        media={selectedMedia}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

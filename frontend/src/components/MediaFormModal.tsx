import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MediaEntry } from '../pages/Library';

interface MediaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaEntry | null;
  onSubmit: (data: Omit<MediaEntry, 'id'>) => void;
}

export default function MediaFormModal({ isOpen, onClose, media, onSubmit }: MediaFormModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaEntry['type']>('MOVIE');
  const [status, setStatus] = useState<'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'PLAYING' | 'ON_HOLD' | 'DROPPED'>('PLAN_TO_WATCH');
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');

  useEffect(() => {
    if (media) {
      setTitle(media.title);
      setType(media.type);
      setStatus(media.status);
      setRating(media.rating || 0);
      setReview(media.review || '');
      setPersonalNotes(media.personalNotes || '');
    } else {
      setTitle('');
      setType('MOVIE');
      setStatus('PLAN_TO_WATCH');
      setRating(0);
      setReview('');
      setPersonalNotes('');
    }
  }, [media, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      type,
      status,
      rating: rating > 0 ? rating : 0,
      review: review || '',
      personalNotes: personalNotes || ''
    });
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: 'var(--accent-sand)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
          {media ? 'Edit Media Entry' : 'Add New Media'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Steins;Gate"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as MediaEntry['type'])}>
                <option value="MOVIE">Movie / Show</option>
                <option value="ANIME">Anime</option>
                <option value="GAME">Video Game</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as MediaEntry['status'])}>
                <option value="PLAN_TO_WATCH">Plan to Watch</option>
                <option value="WATCHING">Watching</option>
                <option value="PLAYING">Playing</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating</label>
            <select id="rating" value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>
              <option value={0}>Unrated</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>{num} / 10</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="personalNotes">Personal Notes</label>
            <textarea
              id="personalNotes"
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              rows={2}
              placeholder="Private thoughts or watch progress..."
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-accent">
              {media ? 'Save Changes' : 'Add Media'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import queueService from '../services/queueService';
import authService from '../services/authService';
import Button from '../components/common/Button';
import './MyQueuesPage.css';

function MyQueuesPage() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadMyQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyQueues = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await queueService.getMyQueues();
      setQueues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.error || 'Ошибка загрузки очередей');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async (queueId, eventName) => {
    if (!window.confirm(`Вы уверены, что хотите покинуть очередь "${eventName}"?`)) {
      return;
    }

    try {
      await queueService.leaveQueue(queueId);
      loadMyQueues();
    } catch (err) {
      alert(err.error || 'Ошибка при выходе из очереди');
    }
  };

  const handlePauseQueue = async (queueId) => {
    try {
      await queueService.pauseQueue(queueId);
      loadMyQueues();
    } catch (err) {
      alert(err.error || 'Ошибка при паузе');
    }
  };

  const handleResumeQueue = async (queueId) => {
    try {
      await queueService.resumeQueue(queueId);
      loadMyQueues();
    } catch (err) {
      alert(err.error || 'Ошибка возобновления');
    }
  };

  const getEstimatedWaitTime = (queue) => {
    if (!queue || !queue.avg_service_time) return 0;
    return queue.position * queue.avg_service_time;
  };

  if (loading) {
    return (
      <div className="my-queues-container">
        <nav className="my-queues-nav">
          <div className="my-queues-nav-content">
            <Link to="/" className="my-queues-logo">
              <span className="my-queues-logo-text">T-Bank Queue</span>
            </Link>
          </div>
        </nav>
        <div className="my-queues-loading">
          <div className="my-queues-spinner"></div>
          <p>Загрузка очередей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-queues-container">
      {/* Navigation */}
      <nav className="my-queues-nav">
        <div className="my-queues-nav-content">
          <Link to="/" className="my-queues-logo">
            <span className="my-queues-logo-text">T-Bank Queue</span>
          </Link>
          <div className="my-queues-nav-links">
            <Link to="/events" className="my-queues-nav-link">Мероприятия</Link>
            <span className="my-queues-user-name">{currentUser?.name}</span>
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                authService.logout();
                navigate('/');
              }}
            >
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="my-queues-header">
        <h1 className="my-queues-title">Мои очереди</h1>
        <p className="my-queues-subtitle">Управляйте своими записями в очередях</p>
      </div>

      {/* Error */}
      {error && (
        <div className="my-queues-error-container">
          <div className="my-queues-error-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="my-queues-main">
        {queues.length === 0 ? (
          <div className="my-queues-empty-state">
            <svg className="my-queues-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 3h18v18H3z"/>
              <path d="M3 9h18"/>
              <path d="M9 21V9"/>
            </svg>
            <h2 className="my-queues-empty-title">Вы не состоите в очередях</h2>
            <p className="my-queues-empty-text">
              Перейдите к мероприятиям и встаньте в очередь
            </p>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="large">
                Смотреть мероприятия
              </Button>
            </Link>
          </div>
        ) : (
          <div className="my-queues-grid">
            {queues.map((queue) => (
              <div key={queue.id} className="my-queues-card">
                {/* Card Header */}
                <div className="my-queues-card-header">
                  <div className="my-queues-card-header-left">
                    <svg className="my-queues-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    <div>
                      <h3 className="my-queues-card-title">{queue.event_name}</h3>
                      <div className="my-queues-card-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {queue.location || 'Не указана'}
                      </div>
                    </div>
                  </div>
                  <div 
                    className="my-queues-card-status"
                    style={{
                      backgroundColor: 
                        queue.status === 'waiting' ? '#2196F3' :
                        queue.status === 'called' ? '#FF9800' :
                        queue.status === 'completed' ? '#4CAF50' : '#666666'
                    }}
                  >
                    {queue.status === 'waiting' ? 'Ожидание' :
                     queue.status === 'called' ? 'Вызван' :
                     queue.status === 'completed' ? 'Завершено' : queue.status}
                  </div>
                </div>

                {/* Position Display */}
                <div className="my-queues-position-section">
                  <div className="my-queues-position-display">
                    <div className="my-queues-position-label">Ваша позиция</div>
                    <div className="my-queues-position-number">#{queue.position}</div>
                  </div>
                  <div className="my-queues-wait-time">
                    <svg className="my-queues-wait-time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span className="my-queues-wait-time-text">
                      ~{getEstimatedWaitTime(queue)} мин
                    </span>
                  </div>
                </div>

                {/* Status Tags */}
                <div className="my-queues-tags">
                  {queue.is_paused == 1 && (
                    <span className="my-queues-tag my-queues-tag-paused">
                      На паузе
                    </span>
                  )}
                  {queue.status === 'called' && (
                    <span className="my-queues-tag my-queues-tag-called">
                      Вас вызывают!
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="my-queues-actions">
                  <Link to={`/event/${queue.event_id}`} style={{ flex: 1, textDecoration: 'none' }}>
                    <Button variant="outline" fullWidth>
                      Открыть событие
                    </Button>
                  </Link>
                  
                  {queue.status === 'waiting' && (
                    <>
                      {queue.is_paused == 1 ? (
                        <Button
                          variant="success"
                          onClick={() => handleResumeQueue(queue.id)}
                        >
                          Возобновить
                        </Button>
                      ) : (
                        <Button
                          variant="warning"
                          onClick={() => handlePauseQueue(queue.id)}
                        >
                          Пауза
                        </Button>
                      )}
                    </>
                  )}
                  
                  <Button
                    variant="error"
                    onClick={() => handleLeaveQueue(queue.id, queue.event_name)}
                  >
                    Покинуть
                  </Button>
                </div>

                {/* Meta Info */}
                <div className="my-queues-meta">
                  <div className="my-queues-meta-item">
                    <span>Создано:</span>
                    <span>{new Date(queue.joined_at + 'Z').toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <div className="my-queues-footer">
        <Link to="/events" className="my-queues-footer-link">
          Встать в новую очередь
        </Link>
      </div>
    </div>
  );
}

export default MyQueuesPage;
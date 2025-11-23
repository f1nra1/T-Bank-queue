import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import queueService from '../services/queueService';
import authService from '../services/authService';
import Button from '../components/common/Button';
import './EventDetailPage.css';

function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [event, setEvent] = useState(null);
  const [queue, setQueue] = useState([]);
  const [myQueueEntry, setMyQueueEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isEventActive = (event) => {
    if (!event) return false;
    return event.is_active == 1 || event.is_active === '1' || event.is_active === true;
  };

  useEffect(() => {
    loadEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const loadEventData = async () => {
    setLoading(true);
    setError('');

    try {
      const queueResponse = await queueService.getQueueByEvent(eventId);
      const eventData = await eventService.getEventById(eventId);
      
      setEvent(eventData);
      setQueue(Array.isArray(queueResponse) ? queueResponse : []);

      if (currentUser && Array.isArray(queueResponse)) {
        const myEntry = queueResponse.find(entry => entry.user_id === currentUser.id);
        setMyQueueEntry(myEntry || null);
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError(err.error || err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setActionLoading(true);
    try {
      await queueService.joinQueue(eventId);
      await loadEventData();
    } catch (err) {
      alert(err.error || 'Ошибка при входе в очередь');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myQueueEntry) return;

    if (!window.confirm('Вы уверены, что хотите покинуть очередь?')) {
      return;
    }

    setActionLoading(true);
    try {
      await queueService.leaveQueue(myQueueEntry.id);
      await loadEventData();
    } catch (err) {
      alert(err.error || 'Ошибка при выходе из очереди');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseQueue = async () => {
    if (!myQueueEntry) return;

    setActionLoading(true);
    try {
      await queueService.pauseQueue(myQueueEntry.id);
      await loadEventData();
    } catch (err) {
      alert(err.error || 'Ошибка при паузе');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeQueue = async () => {
    if (!myQueueEntry) return;

    setActionLoading(true);
    try {
      await queueService.resumeQueue(myQueueEntry.id);
      await loadEventData();
    } catch (err) {
      alert(err.error || 'Ошибка возобновления');
    } finally {
      setActionLoading(false);
    }
  };

  const getEstimatedWaitTime = () => {
    if (!myQueueEntry || !event) return 0;
    const position = myQueueEntry.position;
    return position * event.avg_service_time;
  };

  if (loading) {
    return (
      <div className="event-detail-container">
        <nav className="event-detail-nav">
          <div className="event-detail-nav-content">
            <Link to="/" className="event-detail-logo">
              <span className="event-detail-logo-text">T-Bank Queue</span>
            </Link>
          </div>
        </nav>
        <div className="event-detail-loading">
          <div className="event-detail-spinner"></div>
          <p>Загрузка события...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-container">
        <nav className="event-detail-nav">
          <div className="event-detail-nav-content">
            <Link to="/" className="event-detail-logo">
              <span className="event-detail-logo-text">T-Bank Queue</span>
            </Link>
          </div>
        </nav>
        <div className="event-detail-error-container">
          <div className="event-detail-error-box">
            <svg className="event-detail-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error || 'Событие не найдено'}</span>
          </div>
          <Link to="/events" style={{ textDecoration: 'none' }}>
            <Button variant="outline">← Вернуться к событиям</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      {/* Navigation */}
      <nav className="event-detail-nav">
        <div className="event-detail-nav-content">
          <Link to="/" className="event-detail-logo">
            <span className="event-detail-logo-text">T-Bank Queue</span>
          </Link>
          <div className="event-detail-nav-links">
            <Link to="/events" className="event-detail-nav-link">← К мероприятиям</Link>
            {currentUser ? (
              <>
                <Link to="/my-queues" className="event-detail-nav-link">Мои очереди</Link>
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
              </>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="small">Войти</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="event-detail-main">
        <div className="event-detail-main-content">
          {/* Left Column - Event Info */}
          <div className="event-detail-left-column">
            {/* Event Header */}
            <div className="event-detail-event-header">
              <svg className="event-detail-event-icon-large" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <div>
                <h1 className="event-detail-event-title">{event.name}</h1>
                <div 
                  className="event-detail-status-badge"
                  style={{
                    backgroundColor: isEventActive(event) ? '#4CAF50' : '#F44336',
                  }}
                >
                  {isEventActive(event) ? 'Активно' : 'Завершено'}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="event-detail-section">
              <h2 className="event-detail-section-title">Описание</h2>
              <p className="event-detail-description">
                {event.description || 'Описание отсутствует'}
              </p>
            </div>

            {/* Event Details */}
            <div className="event-detail-section">
              <h2 className="event-detail-section-title">Информация</h2>
              <div className="event-detail-info-grid">
                <div className="event-detail-info-item">
                  <svg className="event-detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <div className="event-detail-info-label">Локация</div>
                    <div className="event-detail-info-value">
                      {event.location || 'Не указана'}
                    </div>
                  </div>
                </div>
                <div className="event-detail-info-item">
                  <svg className="event-detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div>
                    <div className="event-detail-info-label">Среднее время</div>
                    <div className="event-detail-info-value">
                      ~{event.avg_service_time} минут
                    </div>
                  </div>
                </div>
                <div className="event-detail-info-item">
                  <svg className="event-detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <div>
                    <div className="event-detail-info-label">Макс. размер очереди</div>
                    <div className="event-detail-info-value">
                      {event.max_queue_size} человек
                    </div>
                  </div>
                </div>
                <div className="event-detail-info-item">
                  <svg className="event-detail-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3h7v7H3z"/>
                    <path d="M14 3h7v7h-7z"/>
                    <path d="M14 14h7v7h-7z"/>
                    <path d="M3 14h7v7H3z"/>
                  </svg>
                  <div>
                    <div className="event-detail-info-label">Сейчас в очереди</div>
                    <div className="event-detail-info-value">
                      {queue.length} человек
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Queue */}
          <div className="event-detail-right-column">
            {/* My Status */}
            {myQueueEntry ? (
              <div className="event-detail-my-status-card">
                <div className="event-detail-my-status-header">
                  <svg className="event-detail-my-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="event-detail-my-status-title">Ваш статус</span>
                </div>

                <div className="event-detail-position-display">
                  <div className="event-detail-position-label">Позиция в очереди</div>
                  <div className="event-detail-position-number">#{myQueueEntry.position}</div>
                </div>

                <div className="event-detail-wait-time-display">
                  <svg className="event-detail-wait-time-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="event-detail-wait-time-text">
                    Примерное время ожидания: <strong>{getEstimatedWaitTime()} минут</strong>
                  </span>
                </div>

                <div className="event-detail-status-display">
                  <div 
                    className="event-detail-status-chip"
                    style={{
                      backgroundColor: 
                        myQueueEntry.status === 'waiting' ? '#2196F3' :
                        myQueueEntry.status === 'called' ? '#FF9800' :
                        myQueueEntry.status === 'completed' ? '#4CAF50' : '#666666'
                    }}
                  >
                    {myQueueEntry.status === 'waiting' ? 'Ожидание' :
                     myQueueEntry.status === 'called' ? 'Вызван' :
                     myQueueEntry.status === 'completed' ? 'Завершено' : myQueueEntry.status}
                  </div>
                  {myQueueEntry.is_paused == 1 && (
                    <div className="event-detail-status-chip" style={{ backgroundColor: '#FF9800' }}>
                      На паузе
                    </div>
                  )}
                </div>

                <div className="event-detail-action-buttons">
                  {myQueueEntry.is_paused == 1 ? (
                    <Button
                      variant="success"
                      fullWidth
                      onClick={handleResumeQueue}
                      disabled={actionLoading}
                    >
                      Возобновить
                    </Button>
                  ) : (
                    <Button
                      variant="warning"
                      fullWidth
                      onClick={handlePauseQueue}
                      disabled={actionLoading || myQueueEntry.status !== 'waiting'}
                    >
                      Поставить на паузу
                    </Button>
                  )}
                  <Button
                    variant="error"
                    fullWidth
                    onClick={handleLeaveQueue}
                    disabled={actionLoading}
                  >
                    Покинуть очередь
                  </Button>
                </div>
              </div>
            ) : (
              <div className="event-detail-join-card">
                <div className="event-detail-join-header">
                  <svg className="event-detail-join-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <h3 className="event-detail-join-title">Встать в очередь</h3>
                </div>
                <p className="event-detail-join-text">
                  {queue.length === 0 
                    ? 'Очередь пуста! Станьте первым!' 
                    : `В очереди ${queue.length} человек. Примерное время ожидания: ${queue.length * event.avg_service_time} минут`
                  }
                </p>
                {isEventActive(event) ? (
                  queue.length >= event.max_queue_size ? (
                    <div className="event-detail-full-queue-message">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>Очередь заполнена</span>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="large"
                      fullWidth
                      onClick={handleJoinQueue}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Вход...' : 'Встать в очередь'}
                    </Button>
                  )
                ) : (
                  <div className="event-detail-inactive-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <span>Мероприятие завершено</span>
                  </div>
                )}
              </div>
            )}

            {/* Queue List */}
            <div className="event-detail-queue-card">
              <div className="event-detail-queue-header">
                <svg className="event-detail-queue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 5H2v15h7V5z"/>
                  <path d="M22 5h-7v15h7V5z"/>
                  <path d="M5 2v3M19 2v3M5 19v3M19 19v3"/>
                </svg>
                <h3 className="event-detail-queue-title">
                  Очередь ({queue.length})
                </h3>
              </div>

              {queue.length === 0 ? (
                <div className="event-detail-empty-queue">
                  <svg className="event-detail-empty-queue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3h18v18H3z"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <p className="event-detail-empty-queue-text">Очередь пуста</p>
                </div>
              ) : (
                <div className="event-detail-queue-list">
                  {queue.map((entry) => (
                    <div 
                      key={entry.id} 
                      className={`event-detail-queue-item ${
                        entry.user_id === currentUser?.id ? 'event-detail-queue-item-me' : ''
                      }`}
                    >
                      <div className="event-detail-queue-position">#{entry.position}</div>
                      <div className="event-detail-queue-user-info">
                        <div className="event-detail-queue-user-name">
                          {entry.user_name}
                          {entry.user_id === currentUser?.id && (
                            <span className="event-detail-queue-me-badge">Вы</span>
                          )}
                        </div>
                        <div className="event-detail-queue-meta">
                          <span 
                            className="event-detail-queue-status"
                            style={{
                              color: 
                                entry.status === 'waiting' ? '#2196F3' :
                                entry.status === 'called' ? '#FF9800' :
                                entry.status === 'completed' ? '#4CAF50' : '#666666'
                            }}
                          >
                            {entry.status === 'waiting' ? 'Ожидает' :
                             entry.status === 'called' ? 'Вызван' :
                             entry.status === 'completed' ? 'Завершено' : entry.status}
                          </span>
                          {entry.is_paused == 1 && (
                            <span className="event-detail-queue-paused">Пауза</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EventDetailPage;
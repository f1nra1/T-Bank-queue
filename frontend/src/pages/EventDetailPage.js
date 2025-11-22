import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import queueService from '../services/queueService';
import authService from '../services/authService';
import Button from '../components/common/Button';

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
      // Загружаем очередь (она включает и событие)
      const queueResponse = await queueService.getQueueByEvent(eventId);
      
      // queueService.getQueueByEvent возвращает массив очереди
      // но нам нужно также получить событие
      const eventData = await eventService.getEventById(eventId);
      
      console.log('Event data:', eventData);
      console.log('Queue data:', queueResponse);
      
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
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <Link to="/" style={styles.logo}>
              <span style={styles.logoText}>T-Bank Queue</span>
            </Link>
          </div>
        </nav>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка события...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <Link to="/" style={styles.logo}>
              <span style={styles.logoText}>T-Bank Queue</span>
            </Link>
          </div>
        </nav>
        <div style={styles.errorContainer}>
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
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
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoText}>T-Bank Queue</span>
          </Link>
          <div style={styles.navLinks}>
            <Link to="/events" style={styles.navLink}>← К мероприятиям</Link>
            {currentUser ? (
              <>
                <Link to="/my-queues" style={styles.navLink}>Мои очереди</Link>
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
      <main style={styles.main}>
        <div style={styles.mainContent}>
          {/* Left Column - Event Info */}
          <div style={styles.leftColumn}>
            {/* Event Header */}
            <div style={styles.eventHeader}>
              <div style={styles.eventIconLarge}>🎯</div>
              <div>
                <h1 style={styles.eventTitle}>{event.name}</h1>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: isEventActive(event) ? '#4CAF50' : '#F44336',
                }}>
                  {isEventActive(event) ? '✓ Активно' : '✕ Завершено'}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Описание</h2>
              <p style={styles.description}>
                {event.description || 'Описание отсутствует'}
              </p>
            </div>

            {/* Event Details */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Информация</h2>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>📍</span>
                  <div>
                    <div style={styles.infoLabel}>Локация</div>
                    <div style={styles.infoValue}>
                      {event.location || 'Не указана'}
                    </div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>⏱️</span>
                  <div>
                    <div style={styles.infoLabel}>Среднее время</div>
                    <div style={styles.infoValue}>
                      ~{event.avg_service_time} минут
                    </div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>👥</span>
                  <div>
                    <div style={styles.infoLabel}>Макс. размер очереди</div>
                    <div style={styles.infoValue}>
                      {event.max_queue_size} человек
                    </div>
                  </div>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoIcon}>📊</span>
                  <div>
                    <div style={styles.infoLabel}>Сейчас в очереди</div>
                    <div style={styles.infoValue}>
                      {queue.length} человек
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Queue */}
          <div style={styles.rightColumn}>
            {/* My Status */}
            {myQueueEntry ? (
              <div style={styles.myStatusCard}>
                <div style={styles.myStatusHeader}>
                  <span style={styles.myStatusIcon}>✨</span>
                  <span style={styles.myStatusTitle}>Ваш статус</span>
                </div>

                <div style={styles.positionDisplay}>
                  <div style={styles.positionLabel}>Позиция в очереди</div>
                  <div style={styles.positionNumber}>#{myQueueEntry.position}</div>
                </div>

                <div style={styles.waitTimeDisplay}>
                  <span style={styles.waitTimeIcon}>⏱️</span>
                  <span style={styles.waitTimeText}>
                    Примерное время ожидания: <strong>{getEstimatedWaitTime()} минут</strong>
                  </span>
                </div>

                <div style={styles.statusDisplay}>
                  <div style={{
                    ...styles.statusChip,
                    backgroundColor: 
                      myQueueEntry.status === 'waiting' ? '#2196F3' :
                      myQueueEntry.status === 'called' ? '#FF9800' :
                      myQueueEntry.status === 'completed' ? '#4CAF50' : '#666666'
                  }}>
                    {myQueueEntry.status === 'waiting' ? '⏳ Ожидание' :
                     myQueueEntry.status === 'called' ? '📢 Вызван' :
                     myQueueEntry.status === 'completed' ? '✓ Завершено' : myQueueEntry.status}
                  </div>
                  {myQueueEntry.is_paused == 1 && (
                    <div style={{ ...styles.statusChip, backgroundColor: '#FF9800' }}>
                      ⏸️ На паузе
                    </div>
                  )}
                </div>

                <div style={styles.actionButtons}>
                  {myQueueEntry.is_paused == 1 ? (
                    <Button
                      variant="success"
                      fullWidth
                      onClick={handleResumeQueue}
                      disabled={actionLoading}
                    >
                      ▶️ Возобновить
                    </Button>
                  ) : (
                    <Button
                      variant="warning"
                      fullWidth
                      onClick={handlePauseQueue}
                      disabled={actionLoading || myQueueEntry.status !== 'waiting'}
                    >
                      ⏸️ Поставить на паузу
                    </Button>
                  )}
                  <Button
                    variant="error"
                    fullWidth
                    onClick={handleLeaveQueue}
                    disabled={actionLoading}
                  >
                    ✕ Покинуть очередь
                  </Button>
                </div>
              </div>
            ) : (
              <div style={styles.joinCard}>
                <div style={styles.joinHeader}>
                  <span style={styles.joinIcon}>🎯</span>
                  <h3 style={styles.joinTitle}>Встать в очередь</h3>
                </div>
                <p style={styles.joinText}>
                  {queue.length === 0 
                    ? 'Очередь пуста! Станьте первым!' 
                    : `В очереди ${queue.length} человек. Примерное время ожидания: ${queue.length * event.avg_service_time} минут`
                  }
                </p>
                {isEventActive(event) ? (
                  queue.length >= event.max_queue_size ? (
                    <div style={styles.fullQueueMessage}>
                      <span>⚠️</span>
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
                  <div style={styles.inactiveMessage}>
                    <span>✕</span>
                    <span>Мероприятие завершено</span>
                  </div>
                )}
              </div>
            )}

            {/* Queue List */}
            <div style={styles.queueCard}>
              <div style={styles.queueHeader}>
                <span style={styles.queueIcon}>📋</span>
                <h3 style={styles.queueTitle}>Очередь ({queue.length})</h3>
              </div>

              {queue.length === 0 ? (
                <div style={styles.emptyQueue}>
                  <div style={styles.emptyQueueIcon}>📭</div>
                  <p style={styles.emptyQueueText}>Очередь пуста</p>
                </div>
              ) : (
                <div style={styles.queueList}>
                  {queue.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        ...styles.queueItem,
                        backgroundColor: entry.user_id === currentUser?.id ? '#FFF9E6' : '#FFFFFF',
                        border: entry.user_id === currentUser?.id ? '2px solid #FFDD2D' : '1px solid #E0E0E0',
                      }}
                    >
                      <div style={styles.queueItemLeft}>
                        <div style={styles.queuePosition}>#{entry.position}</div>
                        <div>
                          <div style={styles.queueUserName}>
                            {entry.user_name}
                            {entry.user_id === currentUser?.id && (
                              <span style={styles.youBadge}>Вы</span>
                            )}
                          </div>
                          <div style={styles.queueUserStatus}>
                            {entry.status === 'waiting' ? '⏳ Ожидает' :
                             entry.status === 'called' ? '📢 Вызван' :
                             entry.status === 'completed' ? '✓ Завершено' : entry.status}
                            {entry.is_paused == 1 && ' • ⏸️ Пауза'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {queue.length > 10 && (
                    <div style={styles.moreItems}>
                      И еще {queue.length - 10} человек...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    fontFamily: '"Inter", sans-serif',
  },
  nav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E0E0E0',
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#191919',
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#191919',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
  main: {
    padding: '60px 40px',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 450px',
    gap: '40px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  eventHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '40px',
    display: 'flex',
    gap: '25px',
    alignItems: 'flex-start',
    border: '1px solid #E0E0E0',
  },
  eventIconLarge: {
    fontSize: '4rem',
  },
  eventTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#191919',
    marginBottom: '15px',
    letterSpacing: '-0.02em',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '100px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '35px',
    border: '1px solid #E0E0E0',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '20px',
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: '1.7',
    color: '#666666',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '25px',
  },
  infoItem: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: '1.8rem',
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: '#999999',
    marginBottom: '5px',
  },
  infoValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#191919',
  },
  myStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    border: '3px solid #FFDD2D',
    boxShadow: '0 4px 20px rgba(255, 221, 45, 0.2)',
  },
  myStatusHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '25px',
  },
  myStatusIcon: {
    fontSize: '1.5rem',
  },
  myStatusTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#191919',
  },
  positionDisplay: {
    textAlign: 'center',
    padding: '25px',
    backgroundColor: '#F5F5F5',
    borderRadius: '16px',
    marginBottom: '20px',
  },
  positionLabel: {
    fontSize: '0.9rem',
    color: '#666666',
    marginBottom: '10px',
  },
  positionNumber: {
    fontSize: '3.5rem',
    fontWeight: '800',
    color: '#191919',
    lineHeight: '1',
  },
  waitTimeDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#FFF9E6',
    borderRadius: '12px',
    marginBottom: '20px',
    fontSize: '0.95rem',
    color: '#191919',
  },
  waitTimeIcon: {
    fontSize: '1.3rem',
  },
  waitTimeText: {},
  statusDisplay: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  statusChip: {
    padding: '8px 16px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  joinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '35px',
    border: '1px solid #E0E0E0',
    textAlign: 'center',
  },
  joinHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  joinIcon: {
    fontSize: '2rem',
  },
  joinTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#191919',
  },
  joinText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#666666',
    marginBottom: '25px',
  },
  fullQueueMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#FFF3F3',
    borderRadius: '12px',
    color: '#C62828',
    fontWeight: '500',
  },
  inactiveMessage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#F5F5F5',
    borderRadius: '12px',
    color: '#666666',
    fontWeight: '500',
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid #E0E0E0',
  },
  queueHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid #E0E0E0',
  },
  queueIcon: {
    fontSize: '1.5rem',
  },
  queueTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#191919',
  },
  emptyQueue: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyQueueIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
  },
  emptyQueueText: {
    fontSize: '1rem',
    color: '#666666',
  },
  queueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  queueItem: {
    padding: '18px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  queueItemLeft: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flex: 1,
  },
  queuePosition: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#191919',
    minWidth: '45px',
  },
  queueUserName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  youBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '3px 10px',
    backgroundColor: '#FFDD2D',
    color: '#191919',
    borderRadius: '100px',
  },
  queueUserStatus: {
    fontSize: '0.85rem',
    color: '#666666',
  },
  moreItems: {
    textAlign: 'center',
    padding: '15px',
    fontSize: '0.9rem',
    color: '#999999',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '100px 20px',
    color: '#666666',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #E0E0E0',
    borderTop: '4px solid #FFDD2D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 40px',
    gap: '30px',
  },
  errorBox: {
    backgroundColor: '#FFF3F3',
    border: '3px solid #F44336',
    borderRadius: '30px',
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: '#C62828',
    fontSize: '1rem',
  },
  errorIcon: {
    fontSize: '2rem',
  },
};

// Добавляем CSS анимации безопасным способом
const addKeyframes = () => {
  const styleId = 'event-detail-keyframes';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
};
addKeyframes();

export default EventDetailPage;
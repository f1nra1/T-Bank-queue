import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import queueService from '../services/queueService';
import authService from '../services/authService';
import useWebSocket from '../hooks/useWebSocket';
import ChatBox from '../components/chat/ChatBox';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { colors, commonStyles } from '../styles/theme';

function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  const myQueueEntry = queueData?.queue.find(
    entry => entry.user_id === currentUser?.id
  );

  useEffect(() => {
    loadEventAndQueue();
    const interval = setInterval(loadEventAndQueue, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useWebSocket('queue-updated', (data) => {
    if (data.eventId === parseInt(eventId)) {
      loadEventAndQueue();
    }
  });

  const loadEventAndQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventData, queueDataResponse] = await Promise.all([
        eventService.getEventById(eventId),
        queueService.getQueue(eventId),
      ]);
      setEvent(eventData);
      setQueueData(queueDataResponse);
    } catch (err) {
      setError(err.error || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async () => {
    if (!isAuthenticated) {
      alert('Войдите в систему, чтобы встать в очередь');
      navigate('/login');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      await queueService.joinQueue(eventId, currentUser.id);
      await loadEventAndQueue();
    } catch (err) {
      setError(err.error || 'Ошибка вступления в очередь');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myQueueEntry) return;
    const confirmed = window.confirm('Вы уверены, что хотите покинуть очередь?');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      await queueService.leaveQueue(myQueueEntry.id);
      await loadEventAndQueue();
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseQueue = async () => {
    if (!myQueueEntry) return;
    setActionLoading(true);
    try {
      await queueService.pauseQueue(myQueueEntry.id, 15);
      await loadEventAndQueue();
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeQueue = async () => {
    if (!myQueueEntry) return;
    setActionLoading(true);
    try {
      await queueService.resumeQueue(myQueueEntry.id);
      await loadEventAndQueue();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !event) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={styles.container}>
        <Card>
          <div style={styles.errorContent}>
            <div style={styles.errorIcon}>❌</div>
            <h2>Событие не найдено</h2>
            <Link to="/events" style={{ textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
              <Button variant="primary" icon="←">Вернуться к событиям</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Навигация */}
      <div style={styles.breadcrumbs}>
        <Link to="/" style={styles.breadcrumbLink}>Главная</Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <Link to="/events" style={styles.breadcrumbLink}>События</Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>{event.name}</span>
      </div>

      {/* Hero Section - Шапка события */}
      <div style={styles.heroSection}>
        <div style={styles.heroBackground}></div>
        <div style={styles.heroContent}>
          <div style={styles.heroIcon}>🎯</div>
          <h1 style={styles.heroTitle}>{event.name}</h1>
          <p style={styles.heroDescription}>{event.description}</p>
        </div>
      </div>

      {/* Основной контент */}
      <div style={styles.mainContent}>
        {/* Левая колонка */}
        <div style={styles.leftColumn}>
          {/* Информация о событии */}
          <Card style={styles.infoCard}>
            <h3 style={styles.cardTitle}>📋 Информация</h3>
            <div style={styles.infoList}>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📍</div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Локация</div>
                  <div style={styles.infoValue}>{event.location || 'Не указано'}</div>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>⏱️</div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Среднее время</div>
                  <div style={styles.infoValue}>{event.avg_service_time} минут</div>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>👥</div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Макс. очередь</div>
                  <div style={styles.infoValue}>{event.max_queue_size} человек</div>
                </div>
              </div>
              <div style={styles.infoItem}>
                <div style={styles.infoIcon}>📊</div>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>Сейчас в очереди</div>
                  <div style={styles.infoValue}>{queueData?.total_in_queue || 0} человек</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Статус пользователя */}
          {myQueueEntry ? (
            <Card style={{
              ...styles.statusCard,
              background: myQueueEntry.status === 'waiting' 
                ? `linear-gradient(135deg, ${colors.success.main}22 0%, ${colors.success.dark}44 100%)`
                : `linear-gradient(135deg, ${colors.warning.main}22 0%, ${colors.warning.dark}44 100%)`,
              border: `3px solid ${myQueueEntry.status === 'waiting' ? colors.success.main : colors.warning.main}`,
            }}>
              <div style={styles.statusHeader}>
                <div style={{
                  ...styles.statusBadge,
                  backgroundColor: myQueueEntry.status === 'waiting' ? colors.success.main : colors.warning.main,
                }}>
                  {myQueueEntry.status === 'waiting' ? '✅ Активна' : '⏸️ На паузе'}
                </div>
              </div>
              
              <div style={styles.positionCircle}>
                <div style={styles.positionLabel}>Ваша позиция</div>
                <div style={styles.positionNumber}>{myQueueEntry.position}</div>
              </div>

              <div style={styles.estimateBox}>
                <div style={styles.estimateIcon}>⏰</div>
                <div>
                  <div style={styles.estimateLabel}>Примерное ожидание</div>
                  <div style={styles.estimateValue}>~{myQueueEntry.estimated_wait_time} минут</div>
                </div>
              </div>

              <div style={styles.statusActions}>
                {myQueueEntry.status === 'waiting' ? (
                  <>
                    <Button
                      variant="warning"
                      onClick={handlePauseQueue}
                      disabled={actionLoading}
                      fullWidth
                      icon="⏸️"
                    >
                      Временно отойти (15 мин)
                    </Button>
                    <Button
                      variant="error"
                      onClick={handleLeaveQueue}
                      disabled={actionLoading}
                      fullWidth
                      icon="❌"
                    >
                      Покинуть очередь
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleResumeQueue}
                    disabled={actionLoading}
                    fullWidth
                    size="large"
                    icon="▶️"
                  >
                    Вернуться в очередь
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card style={styles.joinCard}>
              <h3 style={styles.joinTitle}>🚀 Готовы присоединиться?</h3>
              <p style={styles.joinText}>
                Встаньте в очередь прямо сейчас и получите уведомление, когда подойдет ваша очередь
              </p>
              <Button
                variant="primary"
                onClick={handleJoinQueue}
                disabled={actionLoading || !event.is_active}
                fullWidth
                size="large"
                icon={actionLoading ? '⏳' : '➕'}
              >
                {actionLoading ? 'Загрузка...' : 'Встать в очередь'}
              </Button>
              {!isAuthenticated && (
                <p style={styles.loginHint}>
                  💡 Необходимо <Link to="/login" style={styles.loginLink}>войти</Link> для участия
                </p>
              )}
            </Card>
          )}

          {/* Ошибки */}
          {error && (
            <Card style={{ backgroundColor: colors.error.dark, padding: '20px' }}>
              <div style={styles.errorMessage}>⚠️ {error}</div>
            </Card>
          )}
        </div>

        {/* Правая колонка */}
        <div style={styles.rightColumn}>
          {/* Очередь */}
          <Card style={styles.queueCard}>
            <div style={styles.queueHeader}>
              <h3 style={styles.cardTitle}>📋 Текущая очередь</h3>
              <div style={styles.queueCounter}>
                {queueData?.total_in_queue || 0}
              </div>
            </div>

            {queueData?.queue.length === 0 ? (
              <div style={styles.emptyQueue}>
                <div style={styles.emptyIcon}>📭</div>
                <div style={styles.emptyTitle}>Очередь пуста</div>
                <div style={styles.emptyText}>Будьте первым!</div>
              </div>
            ) : (
              <div style={styles.queueList}>
                {queueData?.queue.slice(0, 10).map((entry, index) => (
                  <div
                    key={entry.id}
                    style={{
                      ...styles.queueItem,
                      ...(entry.user_id === currentUser?.id ? styles.queueItemMe : {}),
                      ...(entry.status === 'paused' ? styles.queueItemPaused : {}),
                    }}
                  >
                    <div style={styles.queueRank}>
                      {index < 3 ? (
                        <span style={styles.queueMedal}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span style={styles.queueNumber}>{entry.position}</span>
                      )}
                    </div>
                    <div style={styles.queueUserInfo}>
                      <div style={styles.queueUserName}>
                        {entry.user_name}
                        {entry.user_id === currentUser?.id && (
                          <span style={styles.youBadge}>Вы</span>
                        )}
                      </div>
                      <div style={styles.queueUserMeta}>
                        {entry.status === 'paused' && (
                          <span style={styles.pauseBadge}>⏸️ Пауза</span>
                        )}
                        <span style={styles.queueTime}>~{entry.estimated_wait_time} мин</span>
                      </div>
                    </div>
                  </div>
                ))}
                {queueData?.queue.length > 10 && (
                  <div style={styles.queueMore}>
                    +{queueData.queue.length - 10} человек в очереди
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Чат */}
          <div style={styles.chatWrapper}>
            <ChatBox eventId={eventId} />
          </div>
        </div>
      </div>

      {/* Нижняя навигация */}
      <div style={styles.bottomNav}>
        <Link to="/events" style={{ textDecoration: 'none' }}>
          <Button variant="outline" icon="←">
            К списку событий
          </Button>
        </Link>
        {currentUser && (
          <Link to="/my-queues" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" icon="📋">
              Мои очереди
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...commonStyles.container,
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '0',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: colors.text.secondary,
    fontSize: '1.2rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: `4px solid ${colors.divider}`,
    borderTop: `4px solid ${colors.primary.main}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  breadcrumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '20px 40px',
    fontSize: '0.95rem',
  },
  breadcrumbLink: {
    color: colors.info.main,
    textDecoration: 'none',
    transition: 'opacity 0.3s',
  },
  breadcrumbSeparator: {
    color: colors.text.secondary,
  },
  breadcrumbCurrent: {
    color: colors.text.secondary,
  },
  heroSection: {
    position: 'relative',
    padding: '80px 40px',
    marginBottom: '40px',
    overflow: 'hidden',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: colors.primary.gradient,
    opacity: 0.1,
  },
  heroContent: {
    position: 'relative',
    textAlign: 'center',
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroIcon: {
    fontSize: '5rem',
    marginBottom: '20px',
    animation: 'bounce 2s infinite',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '700',
    background: colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '20px',
  },
  heroDescription: {
    fontSize: '1.4rem',
    color: colors.text.secondary,
    lineHeight: '1.6',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '400px 1fr',
    gap: '30px',
    padding: '0 40px 40px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: colors.info.main,
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  infoCard: {
    padding: '30px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: colors.background.input,
    borderRadius: '12px',
  },
  infoIcon: {
    fontSize: '2rem',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
    marginBottom: '4px',
  },
  infoValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusCard: {
    padding: '30px',
  },
  statusHeader: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '10px 20px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
  },
  positionCircle: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  positionLabel: {
    fontSize: '1rem',
    color: colors.text.secondary,
    marginBottom: '10px',
  },
  positionNumber: {
    fontSize: '5rem',
    fontWeight: '700',
    background: colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: '1',
  },
  estimateBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: colors.background.input,
    borderRadius: '12px',
    marginBottom: '25px',
  },
  estimateIcon: {
    fontSize: '2.5rem',
  },
  estimateLabel: {
    fontSize: '0.9rem',
    color: colors.text.secondary,
    marginBottom: '5px',
  },
  estimateValue: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  joinCard: {
    padding: '35px',
    textAlign: 'center',
    background: `linear-gradient(135deg, ${colors.primary.dark}22 0%, ${colors.primary.main}22 100%)`,
    border: `2px solid ${colors.primary.main}`,
  },
  joinTitle: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: colors.info.main,
    marginBottom: '15px',
  },
  joinText: {
    fontSize: '1.05rem',
    color: colors.text.secondary,
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  loginHint: {
    marginTop: '15px',
    fontSize: '0.95rem',
    color: colors.text.secondary,
  },
  loginLink: {
    color: colors.info.main,
    textDecoration: 'underline',
  },
  errorMessage: {
    textAlign: 'center',
    color: 'white',
    fontSize: '1.1rem',
  },
  errorContent: {
    textAlign: 'center',
    padding: '40px',
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  queueCard: {
    padding: '30px',
  },
  queueHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },
  queueCounter: {
    padding: '8px 18px',
    backgroundColor: colors.primary.main,
    borderRadius: '20px',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'white',
  },
  emptyQueue: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '15px',
  },
  emptyTitle: {
    fontSize: '1.3rem',
    color: colors.text.primary,
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '1rem',
    color: colors.text.secondary,
  },
  queueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '18px',
    backgroundColor: colors.background.input,
    borderRadius: '12px',
    border: `2px solid transparent`,
    transition: 'all 0.3s ease',
  },
  queueItemMe: {
    backgroundColor: `${colors.success.main}15`,
    border: `2px solid ${colors.success.main}`,
  },
  queueItemPaused: {
    opacity: 0.5,
  },
  queueRank: {
    minWidth: '50px',
    textAlign: 'center',
  },
  queueMedal: {
    fontSize: '2rem',
  },
  queueNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: colors.primary.main,
  },
  queueUserInfo: {
    flex: 1,
  },
  queueUserName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  youBadge: {
    fontSize: '0.7rem',
    padding: '3px 10px',
    backgroundColor: colors.success.main,
    borderRadius: '10px',
    fontWeight: '600',
    color: 'white',
  },
  queueUserMeta: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: colors.text.secondary,
  },
  pauseBadge: {
    padding: '3px 8px',
    backgroundColor: colors.warning.main,
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'white',
  },
  queueTime: {
    color: colors.text.secondary,
  },
  queueMore: {
    textAlign: 'center',
    padding: '15px',
    color: colors.text.secondary,
    fontSize: '0.95rem',
    fontStyle: 'italic',
  },
  chatWrapper: {
    position: 'sticky',
    top: '20px',
  },
  bottomNav: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    padding: '40px',
    borderTop: `1px solid ${colors.divider}`,
  },
};

export default EventDetailPage;
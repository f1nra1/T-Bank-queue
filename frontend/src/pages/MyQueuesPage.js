import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import queueService from '../services/queueService';
import authService from '../services/authService';
import useWebSocket from '../hooks/useWebSocket';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { colors, commonStyles } from '../styles/theme';

function MyQueuesPage() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
  if (!currentUser) {
    navigate('/login');
    return;
  }
  loadQueues();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Пустой массив зависимостей - выполнится только один раз

  useWebSocket('queue-updated', (data) => {
    console.log('🔄 Очередь обновлена');
    loadQueues();
  });

  const loadQueues = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    try {
      const data = await queueService.getUserQueues(currentUser.id);
      setQueues(data);
    } catch (err) {
      setError(err.error || 'Ошибка загрузки очередей');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async (entryId, eventName) => {
    const confirmed = window.confirm(`Вы уверены, что хотите покинуть очередь на "${eventName}"?`);
    if (!confirmed) return;

    setActionLoading(entryId);
    try {
      await queueService.leaveQueue(entryId);
      await loadQueues();
    } catch (err) {
      alert(err.error || 'Ошибка выхода из очереди');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePauseQueue = async (entryId) => {
    setActionLoading(entryId);
    try {
      await queueService.pauseQueue(entryId, 15);
      await loadQueues();
    } catch (err) {
      alert(err.error || 'Ошибка паузы');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeQueue = async (entryId) => {
    setActionLoading(entryId);
    try {
      await queueService.resumeQueue(entryId);
      await loadQueues();
    } catch (err) {
      alert(err.error || 'Ошибка возврата');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>📋 Мои очереди</h1>
          <p style={styles.subtitle}>Управляйте своими активными очередями</p>
        </div>

        {/* User Card */}
        {currentUser && (
          <div style={styles.userCardWrapper}>
            <Card>
              <div style={styles.userCard}>
                <div style={styles.userAvatar}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.userData}>
                  <div style={styles.userName}>{currentUser.name}</div>
                  <div style={styles.userEmail}>{currentUser.email}</div>
                </div>
                <Button
                  variant="error"
                  size="small"
                  onClick={() => {
                    authService.logout();
                    navigate('/');
                  }}
                  icon="🚪"
                >
                  Выйти
                </Button>
              </div>
            </Card>
          </div>
        )}
      </header>

      {/* Error */}
      {error && (
        <div style={styles.errorContainer}>
          <Card style={{ backgroundColor: colors.error.dark }}>
            ⚠️ {error}
          </Card>
        </div>
      )}

      {/* Queues */}
      <div style={styles.queuesContainer}>
        {queues.length === 0 ? (
          <div style={styles.emptyState}>
            <Card>
              <div style={styles.emptyContent}>
                <div style={styles.emptyIcon}>📭</div>
                <h2 style={styles.emptyTitle}>Вы пока не стоите ни в одной очереди</h2>
                <p style={styles.emptyText}>
                  Перейдите к списку событий и выберите активность, в которой хотите участвовать
                </p>
                <Link to="/events" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="large" icon="🎯">
                    Посмотреть события
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <div style={styles.queuesGrid}>
            {queues.map((queue, index) => {
              const estimatedWaitTime = queue.position * queue.avg_service_time;
              const isPaused = queue.status === 'paused';
              
              return (
                <div
                  key={queue.id}
                  style={{
                    ...styles.queueCardWrapper,
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <Card hoverable style={{
                    border: `2px solid ${isPaused ? colors.warning.main : colors.success.main}`,
                  }}>
                    <div style={styles.queueCard}>
                      {/* Header */}
                      <div style={styles.cardHeader}>
                        <div style={styles.eventIconWrapper}>
                          <span style={styles.eventIcon}>🎯</span>
                        </div>
                        <div style={styles.headerInfo}>
                          <h3 style={styles.eventName}>{queue.event_name}</h3>
                          <div style={{
                            ...styles.statusBadge,
                            backgroundColor: isPaused ? colors.warning.main : colors.success.main,
                          }}>
                            {isPaused ? '⏸️ На паузе' : '✅ Активна'}
                          </div>
                        </div>
                      </div>

                      {/* Position Display */}
                      <div style={styles.positionSection}>
                        <div style={styles.positionLabel}>Позиция в очереди</div>
                        <div style={styles.positionNumber}>{queue.position}</div>
                        <div style={styles.waitTime}>
                          Примерное ожидание: <strong>{estimatedWaitTime} мин</strong>
                        </div>
                      </div>

                      {/* Details */}
                      <div style={styles.detailsGrid}>
                        <div style={styles.detailItem}>
                          <span style={styles.detailIcon}>📍</span>
                          <div>
                            <div style={styles.detailLabel}>Локация</div>
                            <div style={styles.detailValue}>
                              {queue.location || 'Не указано'}
                            </div>
                          </div>
                        </div>
                        <div style={styles.detailItem}>
                          <span style={styles.detailIcon}>🕐</span>
                          <div>
                            <div style={styles.detailLabel}>Встали</div>
                            <div style={styles.detailValue}>
                              {new Date(queue.joined_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pause Info */}
                      {isPaused && queue.can_return_until && (
                        <div style={styles.pauseWarning}>
                          ⚠️ Вернитесь до:{' '}
                          {new Date(queue.can_return_until).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}

                      {/* Actions */}
                      <div style={styles.cardActions}>
                        <Link
                          to={`/event/${queue.event_id}`}
                          style={{ textDecoration: 'none', flex: 1 }}
                        >
                          <Button variant="primary" fullWidth icon="👁️">
                            Смотреть
                          </Button>
                        </Link>

                        {!isPaused && (
                          <Button
                            variant="warning"
                            onClick={() => handlePauseQueue(queue.id)}
                            disabled={actionLoading === queue.id}
                            icon={actionLoading === queue.id ? '⏳' : '⏸️'}
                          >
                            Пауза
                          </Button>
                        )}

                        {isPaused && (
                          <Button
                            variant="success"
                            onClick={() => handleResumeQueue(queue.id)}
                            disabled={actionLoading === queue.id}
                            icon={actionLoading === queue.id ? '⏳' : '▶️'}
                          >
                            Вернуться
                          </Button>
                        )}

                        <Button
                          variant="error"
                          onClick={() => handleLeaveQueue(queue.id, queue.event_name)}
                          disabled={actionLoading === queue.id}
                          icon={actionLoading === queue.id ? '⏳' : '❌'}
                        >
                          Выйти
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <Link to="/events" style={{ textDecoration: 'none', marginRight: '15px' }}>
          <Button variant="ghost" icon="←">К списку событий</Button>
        </Link>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" icon="🏠">На главную</Button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...commonStyles.container,
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
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    paddingTop: '40px',
  },
  headerContent: {
    marginBottom: '30px',
  },
  title: {
    ...commonStyles.pageTitle,
    fontSize: '3rem',
  },
  subtitle: {
    fontSize: '1.3rem',
    color: colors.text.secondary,
  },
  userCardWrapper: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: colors.primary.gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: 'white',
  },
  userData: {
    flex: 1,
    textAlign: 'left',
  },
  userName: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '5px',
  },
  userEmail: {
    fontSize: '1rem',
    color: colors.text.secondary,
  },
  errorContainer: {
    maxWidth: '600px',
    margin: '0 auto 30px',
    padding: '15px',
    textAlign: 'center',
  },
  queuesContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  emptyState: {
    maxWidth: '600px',
    margin: '80px auto',
  },
  emptyContent: {
    textAlign: 'center',
    padding: '60px 40px',
  },
  emptyIcon: {
    fontSize: '6rem',
    marginBottom: '25px',
  },
  emptyTitle: {
    fontSize: '2rem',
    color: colors.text.primary,
    marginBottom: '20px',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: '1.2rem',
    color: colors.text.secondary,
    lineHeight: '1.6',
    marginBottom: '35px',
  },
  queuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  queueCardWrapper: {
    animation: 'fadeInUp 0.6s ease-out',
  },
  queueCard: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: `2px solid ${colors.divider}`,
  },
  eventIconWrapper: {
    fontSize: '3rem',
  },
  eventIcon: {
    display: 'block',
  },
  headerInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: colors.info.main,
    marginBottom: '10px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'white',
  },
  positionSection: {
    textAlign: 'center',
    padding: '25px',
    backgroundColor: colors.background.input,
    borderRadius: '12px',
    marginBottom: '20px',
  },
  positionLabel: {
    fontSize: '0.95rem',
    color: colors.text.secondary,
    marginBottom: '10px',
  },
  positionNumber: {
    fontSize: '3.5rem',
    fontWeight: '700',
    background: colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
  },
  waitTime: {
    fontSize: '1.1rem',
    color: colors.text.secondary,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px',
  },
  detailItem: {
    display: 'flex',
    gap: '12px',
    padding: '15px',
    backgroundColor: colors.background.input,
    borderRadius: '10px',
  },
  detailIcon: {
    fontSize: '1.5rem',
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '1rem',
    color: colors.text.primary,
    fontWeight: '500',
  },
  pauseWarning: {
    padding: '12px',
    backgroundColor: colors.warning.main,
    color: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '20px',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
};

export default MyQueuesPage;
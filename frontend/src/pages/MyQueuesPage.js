import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import queueService from '../services/queueService';
import authService from '../services/authService';
import useWebSocket from '../hooks/useWebSocket';
import Button from '../components/common/Button';

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
  }, []);

  useWebSocket('queue-updated', () => {
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
    if (!window.confirm(`Вы уверены, что хотите покинуть очередь на "${eventName}"?`)) return;

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
        <nav style={styles.nav}>
          <div style={styles.navContent}>
            <Link to="/" style={styles.logo}>
              <span style={styles.logoText}>T-Bank Queue</span>
            </Link>
          </div>
        </nav>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка очередей...</p>
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
            <Link to="/events" style={styles.navLink}>Мероприятия</Link>
            {currentUser && (
              <>
                <span style={styles.userName}>{currentUser.name}</span>
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
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>📋 Мои очереди</h1>
        <p style={styles.subtitle}>Управляйте своими активными очередями</p>
      </div>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      <main style={styles.main}>
        {queues.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <h2 style={styles.emptyTitle}>Вы пока не стоите ни в одной очереди</h2>
            <p style={styles.emptyText}>
              Перейдите к списку мероприятий и выберите то, в котором хотите участвовать
            </p>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="large">
                🎯 Посмотреть мероприятия
              </Button>
            </Link>
          </div>
        ) : (
          <div style={styles.queuesGrid}>
            {queues.map((queue) => {
              const estimatedWaitTime = queue.position * queue.avg_service_time;
              const isPaused = queue.is_paused === 1 || queue.is_paused === '1' || queue.is_paused === true;
              
              return (
                <div key={queue.id} style={styles.queueCard}>
                  {/* Card Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.eventInfo}>
                      <span style={styles.eventIcon}>🎯</span>
                      <div>
                        <h3 style={styles.eventName}>{queue.event_name}</h3>
                        <div style={{
                          ...styles.statusBadge,
                          backgroundColor: isPaused ? '#FF9800' : '#4CAF50',
                        }}>
                          {isPaused ? '⏸️ На паузе' : '✓ Активна'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Position Display */}
                  <div style={styles.positionSection}>
                    <div style={styles.positionLabel}>Позиция в очереди</div>
                    <div style={styles.positionNumber}>#{queue.position}</div>
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
                        <div style={styles.detailValue}>{queue.location || 'Не указано'}</div>
                      </div>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailIcon}>🕐</span>
                      <div>
                        <div style={styles.detailLabel}>Встали в очередь</div>
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

                  {/* Pause Warning */}
                  {isPaused && queue.can_return_until && (
                    <div style={styles.pauseWarning}>
                      ⚠️ Вернитесь до: {new Date(queue.can_return_until).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={styles.cardActions}>
                    <Link to={`/event/${queue.event_id}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <button style={styles.btnPrimary}>👁️ Смотреть</button>
                    </Link>

                    {!isPaused ? (
                      <button
                        style={styles.btnWarning}
                        onClick={() => handlePauseQueue(queue.id)}
                        disabled={actionLoading === queue.id}
                      >
                        {actionLoading === queue.id ? '⏳' : '⏸️'} Пауза
                      </button>
                    ) : (
                      <button
                        style={styles.btnSuccess}
                        onClick={() => handleResumeQueue(queue.id)}
                        disabled={actionLoading === queue.id}
                      >
                        {actionLoading === queue.id ? '⏳' : '▶️'} Вернуться
                      </button>
                    )}

                    <button
                      style={styles.btnDanger}
                      onClick={() => handleLeaveQueue(queue.id, queue.event_name)}
                      disabled={actionLoading === queue.id}
                    >
                      {actionLoading === queue.id ? '⏳' : '✕'} Выйти
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <div style={styles.footer}>
        <Link to="/events" style={styles.footerLink}>← К мероприятиям</Link>
        <Link to="/" style={styles.footerLink}>🏠 На главную</Link>
      </div>
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
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#191919',
    textDecoration: 'none',
    fontWeight: '500',
  },
  userName: {
    color: '#666666',
    fontWeight: '500',
  },
  header: {
    textAlign: 'center',
    padding: '60px 40px 40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#191919',
    marginBottom: '15px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666666',
  },
  errorBox: {
    maxWidth: '600px',
    margin: '0 auto 30px',
    padding: '20px',
    backgroundColor: '#FFF3F3',
    border: '2px solid #F44336',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    justifyContent: 'center',
    color: '#C62828',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px 60px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 40px',
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid #E0E0E0',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '25px',
  },
  emptyTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '15px',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#666666',
    marginBottom: '30px',
    maxWidth: '400px',
    margin: '0 auto 30px',
  },
  queuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '25px',
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid #E0E0E0',
  },
  cardHeader: {
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '1px solid #E0E0E0',
  },
  eventInfo: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start',
  },
  eventIcon: {
    fontSize: '2.5rem',
  },
  eventName: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '10px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  positionSection: {
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
    fontSize: '3rem',
    fontWeight: '800',
    color: '#191919',
    marginBottom: '10px',
  },
  waitTime: {
    fontSize: '0.95rem',
    color: '#666666',
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
    alignItems: 'flex-start',
  },
  detailIcon: {
    fontSize: '1.5rem',
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#999999',
    marginBottom: '3px',
  },
  detailValue: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#191919',
  },
  pauseWarning: {
    padding: '15px',
    backgroundColor: '#FFF3E0',
    border: '1px solid #FF9800',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '20px',
    color: '#E65100',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
  },
  btnPrimary: {
    flex: 1,
    padding: '14px 20px',
    backgroundColor: '#FFDD2D',
    color: '#191919',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnWarning: {
    padding: '14px 20px',
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    border: '1px solid #FF9800',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSuccess: {
    padding: '14px 20px',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    border: '1px solid #4CAF50',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '14px 20px',
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    border: '1px solid #F44336',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    padding: '40px',
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
  },
  footerLink: {
    color: '#666666',
    textDecoration: 'none',
    fontWeight: '500',
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
};

// CSS анимации
const addKeyframes = () => {
  const styleId = 'my-queues-keyframes';
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

export default MyQueuesPage;
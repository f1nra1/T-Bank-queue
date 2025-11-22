import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import queueService from '../services/queueService';
import authService from '../services/authService';
import useWebSocket from '../hooks/useWebSocket';

function MyQueuesPage() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  // Проверка авторизации
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadQueues();
  }, [currentUser, navigate]);

  // WebSocket для обновлений
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
      alert('Вы покинули очередь');
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
      alert('Вы временно покинули очередь на 15 минут');
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
      alert('Вы вернулись в очередь');
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
        <div style={styles.loading}>⏳ Загрузка...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>📋 Мои очереди</h1>
        <div style={styles.userInfo}>
          <span>👤 {currentUser?.name}</span>
          <button 
            onClick={() => {
              authService.logout();
              navigate('/');
            }} 
            style={styles.logoutButton}
          >
            Выйти
          </button>
        </div>
      </header>

      {error && <div style={styles.error}>❌ {error}</div>}

      {queues.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h2 style={styles.emptyTitle}>Вы пока не стоите ни в одной очереди</h2>
          <p style={styles.emptyText}>
            Перейдите к списку событий и выберите активность, в которой хотите участвовать
          </p>
          <Link to="/events" style={styles.browseButton}>
            🎯 Посмотреть события
          </Link>
        </div>
      ) : (
        <div style={styles.queuesGrid}>
          {queues.map((queue) => {
            const estimatedWaitTime = queue.position * queue.avg_service_time;
            const isPaused = queue.status === 'paused';
            
            return (
              <div 
                key={queue.id} 
                style={{
                  ...styles.queueCard,
                  ...(isPaused ? styles.queueCardPaused : {}),
                }}
              >
                <div style={styles.cardHeader}>
                  <h3 style={styles.eventName}>{queue.event_name}</h3>
                  <div style={styles.statusBadge}>
                    {isPaused ? '⏸️ На паузе' : '✅ Активна'}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.label}>📍 Локация:</span>
                    <span style={styles.value}>{queue.location || 'Не указано'}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.label}>🔢 Позиция:</span>
                    <span style={styles.positionValue}>{queue.position}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.label}>⏱️ Ожидание:</span>
                    <span style={styles.value}>~{estimatedWaitTime} минут</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.label}>🕐 Встали:</span>
                    <span style={styles.value}>
                      {new Date(queue.joined_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isPaused && queue.can_return_until && (
                    <div style={styles.pauseInfo}>
                      ⚠️ Вернитесь до: {new Date(queue.can_return_until).toLocaleTimeString('ru-RU')}
                    </div>
                  )}
                </div>

                <div style={styles.cardActions}>
                  <Link 
                    to={`/event/${queue.event_id}`}
                    style={styles.viewButton}
                  >
                    👁️ Смотреть
                  </Link>

                  {!isPaused && (
                    <button
                      onClick={() => handlePauseQueue(queue.id)}
                      disabled={actionLoading === queue.id}
                      style={styles.pauseButton}
                    >
                      {actionLoading === queue.id ? '⏳' : '⏸️ Пауза'}
                    </button>
                  )}

                  {isPaused && (
                    <button
                      onClick={() => handleResumeQueue(queue.id)}
                      disabled={actionLoading === queue.id}
                      style={styles.resumeButton}
                    >
                      {actionLoading === queue.id ? '⏳' : '▶️ Вернуться'}
                    </button>
                  )}

                  <button
                    onClick={() => handleLeaveQueue(queue.id, queue.event_name)}
                    disabled={actionLoading === queue.id}
                    style={styles.leaveButton}
                  >
                    {actionLoading === queue.id ? '⏳' : '❌ Выйти'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.footer}>
        <Link to="/events" style={styles.backLink}>← К списку событий</Link>
        <Link to="/" style={styles.backLink}>На главную</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#282c34',
    padding: '20px',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#61dafb',
    marginTop: '100px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    paddingTop: '20px',
  },
  title: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '20px',
  },
  userInfo: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#61dafb',
    fontSize: '1rem',
  },
  logoutButton: {
    padding: '8px 16px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  error: {
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 30px',
  },
  emptyState: {
    textAlign: 'center',
    maxWidth: '500px',
    margin: '80px auto',
    padding: '40px',
    backgroundColor: '#1e2127',
    borderRadius: '15px',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    color: '#61dafb',
    fontSize: '1.5rem',
    marginBottom: '15px',
  },
  emptyText: {
    color: '#a0a0a0',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  browseButton: {
    display: 'inline-block',
    padding: '15px 40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  queuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  queueCard: {
    backgroundColor: '#1e2127',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    border: '2px solid #4caf50',
  },
  queueCardPaused: {
    border: '2px solid #ff9800',
    opacity: 0.85,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #3a3f4b',
  },
  eventName: {
    color: '#61dafb',
    fontSize: '1.3rem',
    margin: 0,
  },
  statusBadge: {
    padding: '5px 12px',
    backgroundColor: '#3a3f4b',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#fff',
  },
  cardBody: {
    marginBottom: '20px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #2a2e35',
  },
  label: {
    color: '#a0a0a0',
    fontSize: '0.95rem',
  },
  value: {
    color: '#fff',
    fontSize: '0.95rem',
  },
  positionValue: {
    color: '#4caf50',
    fontSize: '1.3rem',
    fontWeight: 'bold',
  },
  pauseInfo: {
    marginTop: '15px',
    padding: '12px',
    backgroundColor: '#ff9800',
    color: 'white',
    borderRadius: '8px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  viewButton: {
    flex: 1,
    padding: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: 'bold',
  },
  pauseButton: {
    flex: 1,
    padding: '10px',
    background: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  resumeButton: {
    flex: 1,
    padding: '10px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  leaveButton: {
    flex: 1,
    padding: '10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '40px',
  },
  backLink: {
    color: '#61dafb',
    fontSize: '1rem',
    textDecoration: 'none',
  },
};

export default MyQueuesPage;
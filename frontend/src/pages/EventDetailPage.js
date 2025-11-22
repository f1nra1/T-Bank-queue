import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import queueService from '../services/queueService';
import authService from '../services/authService';
import useWebSocket from '../hooks/useWebSocket';
import ChatBox from '../components/chat/ChatBox';

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

  // WebSocket для real-time обновлений
useWebSocket('queue-updated', (data) => {
  console.log('🔄 Очередь обновлена через WebSocket:', data);
  // Если обновление касается нашего события, перезагружаем данные
  if (data.eventId === parseInt(eventId)) {
    loadEventAndQueue();
  }
});

  // Проверяем, находится ли текущий пользователь в очереди
  const myQueueEntry = queueData?.queue.find(
    entry => entry.user_id === currentUser?.id
  );

  useEffect(() => {
    loadEventAndQueue();
    
    // Обновляем очередь каждые 30 секунд
    const interval = setInterval(loadEventAndQueue, 30000);
    
    return () => clearInterval(interval);
  }, [eventId]);

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
      alert('Вы успешно встали в очередь!');
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
    setError('');
    try {
      await queueService.leaveQueue(myQueueEntry.id);
      alert('Вы покинули очередь');
      await loadEventAndQueue();
    } catch (err) {
      setError(err.error || 'Ошибка выхода из очереди');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseQueue = async () => {
    if (!myQueueEntry) return;

    setActionLoading(true);
    setError('');
    try {
      await queueService.pauseQueue(myQueueEntry.id, 15);
      alert('Вы временно покинули очередь на 15 минут');
      await loadEventAndQueue();
    } catch (err) {
      setError(err.error || 'Ошибка паузы');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeQueue = async () => {
    if (!myQueueEntry) return;

    setActionLoading(true);
    setError('');
    try {
      await queueService.resumeQueue(myQueueEntry.id);
      alert('Вы вернулись в очередь');
      await loadEventAndQueue();
    } catch (err) {
      setError(err.error || 'Ошибка возврата');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !event) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Загрузка...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>❌ Событие не найдено</div>
        <Link to="/events" style={styles.backLink}>← Вернуться к событиям</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Шапка события */}
      <div style={styles.eventHeader}>
        <h1 style={styles.title}>{event.name}</h1>
        <p style={styles.description}>{event.description}</p>
        
        <div style={styles.eventInfo}>
          <div style={styles.infoItem}>
            📍 <span>{event.location || 'Не указано'}</span>
          </div>
          <div style={styles.infoItem}>
            ⏱️ <span>Время обслуживания: ~{event.avg_service_time} мин</span>
          </div>
          <div style={styles.infoItem}>
            👥 <span>Макс. очередь: {event.max_queue_size} чел.</span>
          </div>
        </div>
      </div>

      {error && <div style={styles.errorBox}>❌ {error}</div>}

      {/* Информация о статусе пользователя */}
      {myQueueEntry && (
        <div style={styles.myStatusBox}>
          <h3 style={styles.statusTitle}>
            {myQueueEntry.status === 'waiting' ? '✅ Вы в очереди!' : '⏸️ Вы на паузе'}
          </h3>
          <div style={styles.statusInfo}>
            <div style={styles.positionBig}>
              Позиция: <span style={styles.positionNumber}>{myQueueEntry.position}</span>
            </div>
            <div style={styles.waitTime}>
              Примерное время ожидания: ~{myQueueEntry.estimated_wait_time} минут
            </div>
          </div>

          <div style={styles.actionButtons}>
            {myQueueEntry.status === 'waiting' && (
              <>
                <button 
                  onClick={handlePauseQueue}
                  disabled={actionLoading}
                  style={styles.pauseButton}
                >
                  ⏸️ Временно отойти
                </button>
                <button 
                  onClick={handleLeaveQueue}
                  disabled={actionLoading}
                  style={styles.leaveButton}
                >
                  ❌ Покинуть очередь
                </button>
              </>
            )}
            {myQueueEntry.status === 'paused' && (
              <button 
                onClick={handleResumeQueue}
                disabled={actionLoading}
                style={styles.resumeButton}
              >
                ▶️ Вернуться в очередь
              </button>
            )}
          </div>
        </div>
      )}

      {/* Кнопка встать в очередь */}
      {!myQueueEntry && (
        <div style={styles.joinSection}>
          <button 
            onClick={handleJoinQueue}
            disabled={actionLoading || !event.is_active}
            style={styles.joinButton}
          >
            {actionLoading ? '⏳ Загрузка...' : '➕ Встать в очередь'}
          </button>
          {!isAuthenticated && (
            <p style={styles.hint}>Войдите в систему, чтобы встать в очередь</p>
          )}
        </div>
      )}

      {/* Текущая очередь */}
      <div style={styles.queueSection}>
        <h2 style={styles.queueTitle}>
          📋 Текущая очередь ({queueData?.total_in_queue || 0} чел.)
        </h2>

        {queueData?.queue.length === 0 ? (
          <div style={styles.emptyQueue}>
            <p>📭 Очередь пуста</p>
            <p style={styles.hint}>Будьте первым!</p>
          </div>
        ) : (
          <div style={styles.queueList}>
            {queueData?.queue.map((entry, index) => (
              <div 
                key={entry.id} 
                style={{
                  ...styles.queueItem,
                  ...(entry.user_id === currentUser?.id ? styles.queueItemHighlight : {}),
                  ...(entry.status === 'paused' ? styles.queueItemPaused : {}),
                }}
              >
                <div style={styles.queuePosition}>{entry.position}</div>
                <div style={styles.queueInfo}>
                  <div style={styles.queueName}>
                    {entry.user_name}
                    {entry.user_id === currentUser?.id && ' (Вы)'}
                  </div>
                  <div style={styles.queueDetails}>
                    {entry.status === 'paused' && '⏸️ На паузе | '}
                    Ожидание: ~{entry.estimated_wait_time} мин
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Чат события */}
      <div style={styles.chatSection}>
        <ChatBox eventId={eventId} />
      </div>

      {/* Футер */}
      <div style={styles.footer}>
        <Link to="/events" style={styles.backLink}>← Вернуться к событиям</Link>
      </div>
    </div>
  );
}

const styles = {
  chatSection: {
    marginBottom: '25px',
  },
  container: {
    minHeight: '100vh',
    backgroundColor: '#282c34',
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#61dafb',
    marginTop: '100px',
  },
  error: {
    textAlign: 'center',
    color: '#ff4444',
    fontSize: '1.2rem',
    marginTop: '100px',
  },
  eventHeader: {
    backgroundColor: '#1e2127',
    padding: '30px',
    borderRadius: '12px',
    marginBottom: '25px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  title: {
    fontSize: '2rem',
    color: '#61dafb',
    marginBottom: '15px',
  },
  description: {
    fontSize: '1.1rem',
    color: '#d0d0d0',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  eventInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  infoItem: {
    color: '#a0a0a0',
    fontSize: '1rem',
  },
  errorBox: {
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  myStatusBox: {
    backgroundColor: '#1e4d1e',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '25px',
    border: '2px solid #4caf50',
  },
  statusTitle: {
    color: '#4caf50',
    fontSize: '1.5rem',
    marginBottom: '15px',
    textAlign: 'center',
  },
  statusInfo: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  positionBig: {
    fontSize: '1.3rem',
    color: '#fff',
    marginBottom: '10px',
  },
  positionNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#4caf50',
  },
  waitTime: {
    fontSize: '1.1rem',
    color: '#d0d0d0',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pauseButton: {
    padding: '12px 25px',
    background: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  leaveButton: {
    padding: '12px 25px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  resumeButton: {
    padding: '12px 25px',
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  joinSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  joinButton: {
    padding: '18px 50px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  hint: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
    marginTop: '10px',
  },
  queueSection: {
    backgroundColor: '#1e2127',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '25px',
  },
  queueTitle: {
    color: '#61dafb',
    fontSize: '1.5rem',
    marginBottom: '20px',
  },
  emptyQueue: {
    textAlign: 'center',
    padding: '40px',
    color: '#a0a0a0',
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
    backgroundColor: '#282c34',
    padding: '15px',
    borderRadius: '8px',
  },
  queueItemHighlight: {
    backgroundColor: '#1e4d1e',
    border: '2px solid #4caf50',
  },
  queueItemPaused: {
    opacity: 0.6,
  },
  queuePosition: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#61dafb',
    minWidth: '40px',
    textAlign: 'center',
  },
  queueInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: '1.1rem',
    color: '#fff',
    marginBottom: '5px',
  },
  queueDetails: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
  },
  backLink: {
    color: '#61dafb',
    fontSize: '1rem',
    textDecoration: 'none',
  },
};

export default EventDetailPage;
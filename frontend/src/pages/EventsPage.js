import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import authService from '../services/authService';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err.error || 'Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Загрузка событий...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎯 Активности Т-Банк</h1>
        <p style={styles.subtitle}>Выберите активность и встаньте в очередь</p>

        {currentUser && (
          <div style={styles.userInfo}>
            <span>👤 {currentUser.name}</span>
            <Link to="/my-queues" style={styles.link}>Мои очереди</Link>
            <button onClick={() => {
              authService.logout();
              window.location.href = '/';
            }} style={styles.logoutButton}>
              Выйти
            </button>
          </div>
        )}

        {!currentUser && (
          <div style={styles.authButtons}>
            <Link to="/login" style={styles.loginButton}>Войти</Link>
            <Link to="/register" style={styles.registerButton}>Регистрация</Link>
          </div>
        )}
      </header>

      {error && <div style={styles.error}>❌ {error}</div>}

      <div style={styles.eventsGrid}>
        {events.length === 0 ? (
          <div style={styles.noEvents}>
            <p>📭 Пока нет активных событий</p>
            <p style={styles.subtext}>Следите за обновлениями!</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} style={styles.eventCard}>
              <h3 style={styles.eventName}>{event.name}</h3>
              <p style={styles.eventDescription}>{event.description}</p>
              
              <div style={styles.eventDetails}>
                <div style={styles.detail}>
                  📍 <span>{event.location || 'Не указано'}</span>
                </div>
                <div style={styles.detail}>
                  ⏱️ <span>~{event.avg_service_time} мин</span>
                </div>
                <div style={styles.detail}>
                  👥 <span>До {event.max_queue_size} чел.</span>
                </div>
              </div>

              <Link 
                to={`/event/${event.id}`} 
                style={styles.viewButton}
              >
                Встать в очередь →
              </Link>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>
        <Link to="/" style={styles.backLink}>← На главную</Link>
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
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#a0a0a0',
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
  link: {
    color: '#61dafb',
    textDecoration: 'underline',
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
  authButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  loginButton: {
    padding: '10px 25px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  registerButton: {
    padding: '10px 25px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#61dafb',
    marginTop: '100px',
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
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  noEvents: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    color: '#a0a0a0',
  },
  subtext: {
    fontSize: '0.9rem',
    marginTop: '10px',
  },
  eventCard: {
    backgroundColor: '#1e2127',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s',
  },
  eventName: {
    color: '#61dafb',
    fontSize: '1.4rem',
    marginBottom: '10px',
  },
  eventDescription: {
    color: '#d0d0d0',
    fontSize: '0.95rem',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '20px',
  },
  detail: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
  },
  viewButton: {
    display: 'block',
    textAlign: 'center',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
  },
  backLink: {
    color: '#61dafb',
    fontSize: '1rem',
    textDecoration: 'none',
  },
};

export default EventsPage;
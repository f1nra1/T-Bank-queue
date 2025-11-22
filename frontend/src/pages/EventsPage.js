import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../services/eventService';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { colors, commonStyles } from '../styles/theme';

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
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка событий...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎯 Активности Т-Банк</h1>
          <p style={styles.subtitle}>Выберите активность и встаньте в очередь</p>
        </div>

        {/* User Info or Auth Buttons */}
        {currentUser ? (
          <div style={styles.userCard}>
            <Card>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.userData}>
                  <div style={styles.userName}>{currentUser.name}</div>
                  <div style={styles.userEmail}>{currentUser.email}</div>
                </div>
              </div>
              <div style={styles.userActions}>
                <Link to="/my-queues" style={{ textDecoration: 'none', flex: 1 }}>
                  <Button variant="primary" size="small" fullWidth icon="📋">
                    Мои очереди
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="small"
                  onClick={() => {
                    authService.logout();
                    window.location.href = '/';
                  }}
                  icon="🚪"
                >
                  Выйти
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="primary" icon="🔐">Войти</Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" icon="📝">Регистрация</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Error Message */}
      {error && (
        <div style={styles.errorContainer}>
          <Card style={{ backgroundColor: colors.error.dark }}>
            <div style={styles.errorContent}>
              ❌ {error}
            </div>
          </Card>
        </div>
      )}

      {/* Events Grid */}
      <div style={styles.eventsContainer}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <Card>
              <div style={styles.emptyContent}>
                <div style={styles.emptyIcon}>📭</div>
                <h2 style={styles.emptyTitle}>Пока нет активных событий</h2>
                <p style={styles.emptyText}>
                  Следите за обновлениями! Скоро здесь появятся интересные активности.
                </p>
                <Button 
                  variant="primary" 
                  onClick={loadEvents}
                  icon="🔄"
                >
                  Обновить
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div style={styles.eventsGrid}>
            {events.map((event, index) => (
              <div 
                key={event.id}
                style={{
                  ...styles.eventCardWrapper,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Card hoverable>
                  <div style={styles.eventCard}>
                    {/* Event Header */}
                    <div style={styles.eventHeader}>
                      <div style={styles.eventIcon}>🎯</div>
                      <h3 style={styles.eventName}>{event.name}</h3>
                    </div>

                    {/* Event Description */}
                    <p style={styles.eventDescription}>
                      {event.description || 'Описание события'}
                    </p>

                    {/* Event Details */}
                    <div style={styles.eventDetails}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>📍</span>
                        <span style={styles.detailText}>
                          {event.location || 'Не указано'}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>⏱️</span>
                        <span style={styles.detailText}>
                          ~{event.avg_service_time} мин
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailIcon}>👥</span>
                        <span style={styles.detailText}>
                          До {event.max_queue_size} чел.
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link 
                      to={`/event/${event.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button 
                        variant="primary" 
                        fullWidth
                        icon="→"
                      >
                        Встать в очередь
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" icon="←">
            На главную
          </Button>
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
    paddingTop: '40px',
    marginBottom: '40px',
  },
  headerContent: {
    marginBottom: '30px',
  },
  title: {
    ...commonStyles.pageTitle,
    fontSize: '3rem',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.3rem',
    color: colors.text.secondary,
  },
  userCard: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: `1px solid ${colors.divider}`,
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: colors.primary.gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
  },
  userData: {
    flex: 1,
    textAlign: 'left',
  },
  userName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '0.9rem',
    color: colors.text.secondary,
  },
  userActions: {
    display: 'flex',
    gap: '10px',
  },
  authButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  errorContainer: {
    maxWidth: '600px',
    margin: '0 auto 30px',
  },
  errorContent: {
    textAlign: 'center',
    color: 'white',
    fontSize: '1.1rem',
    padding: '10px',
  },
  eventsContainer: {
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
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '20px',
  },
  emptyTitle: {
    fontSize: '1.8rem',
    color: colors.text.primary,
    marginBottom: '15px',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: colors.text.secondary,
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  eventCardWrapper: {
    animation: 'fadeInUp 0.6s ease-out',
  },
  eventCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  eventHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  eventIcon: {
    fontSize: '2rem',
  },
  eventName: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: colors.info.main,
    margin: 0,
    flex: 1,
  },
  eventDescription: {
    fontSize: '1rem',
    color: colors.text.secondary,
    lineHeight: '1.6',
    marginBottom: '20px',
    flex: 1,
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: colors.background.input,
    borderRadius: '10px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  detailIcon: {
    fontSize: '1.2rem',
  },
  detailText: {
    fontSize: '0.95rem',
    color: colors.text.secondary,
  },
  footer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
};

// Добавляем CSS анимации
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

styleSheet.insertRule(`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`, styleSheet.cssRules.length);

export default EventsPage;
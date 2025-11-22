import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import authService from '../services/authService';
import Button from '../components/common/Button';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await eventService.getEvents();
      
      // Проверяем разные форматы ответа
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setError('Неверный формат данных');
      }
    } catch (err) {
      setError(err.error || err.message || 'Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoText}>T-Bank Queue</span>
          </Link>
          <div style={styles.navLinks}>
            {currentUser ? (
              <>
                <Link to="/my-queues" style={styles.navLink}>Мои очереди</Link>
                <Link to="/admin" style={styles.navLink}>Админка</Link>
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
              <>
                <Link to="/login" style={styles.navLink}>Войти</Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="small">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Активные мероприятия</h1>
          <p style={styles.subtitle}>
            Выберите мероприятие и встаньте в очередь онлайн
          </p>

          {/* User Info */}
          {currentUser && (
            <div style={styles.userCard}>
              <div style={styles.userAvatar}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{currentUser.name}</div>
                <div style={styles.userEmail}>{currentUser.email}</div>
              </div>
            </div>
          )}

          {/* Search */}
          <div style={styles.searchContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Поиск мероприятий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                style={styles.clearButton}
                onClick={() => setSearchTerm('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={styles.content}>
        <div style={styles.contentWrapper}>
          {/* Loading */}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Загрузка мероприятий...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
              <Button onClick={loadEvents} variant="primary" style={{ marginTop: '15px' }}>
                Попробовать снова
              </Button>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <>
              {filteredEvents.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📭</div>
                  <h2 style={styles.emptyTitle}>
                    {searchTerm ? 'Ничего не найдено' : 'Нет активных мероприятий'}
                  </h2>
                  <p style={styles.emptyText}>
                    {searchTerm
                      ? 'Попробуйте изменить поисковый запрос'
                      : 'Мероприятия появятся здесь, когда будут добавлены'}
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm('')}>
                      Сбросить поиск
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div style={styles.resultsCount}>
                    {searchTerm ? 'Найдено' : 'Всего'} мероприятий: <strong>{filteredEvents.length}</strong>
                  </div>
                  <div style={styles.eventsGrid}>
                    {filteredEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/event/${event.id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div style={styles.eventCard}>
                          {/* Event Header */}
                          <div style={styles.eventHeader}>
                            <div style={styles.eventIcon}>🎯</div>
                            <div style={{
                              ...styles.statusBadge,
                              backgroundColor: event.is_active ? '#4CAF50' : '#F44336',
                            }}>
                              {event.is_active ? '✓ Активно' : '✕ Завершено'}
                            </div>
                          </div>

                          {/* Event Content */}
                          <h3 style={styles.eventName}>{event.name}</h3>
                          <p style={styles.eventDescription}>
                            {event.description || 'Описание отсутствует'}
                          </p>

                          {/* Event Details */}
                          <div style={styles.eventDetails}>
                            <div style={styles.detailItem}>
                              <span style={styles.detailIcon}>📍</span>
                              <span style={styles.detailText}>
                                {event.location || 'Локация не указана'}
                              </span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailIcon}>⏱️</span>
                              <span style={styles.detailText}>
                                ~{event.avg_service_time} минут
                              </span>
                            </div>
                            <div style={styles.detailItem}>
                              <span style={styles.detailIcon}>👥</span>
                              <span style={styles.detailText}>
                                До {event.max_queue_size} человек
                              </span>
                            </div>
                          </div>

                          {/* Event Footer */}
                          <div style={styles.eventFooter}>
                            <Button variant="primary" fullWidth>
                              Подробнее →
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <div style={styles.footerLogo}>T-Bank Queue</div>
            <p style={styles.footerTagline}>
              Электронная очередь для мероприятий
            </p>
          </div>
          <div style={styles.footerRight}>
            <Link to="/" style={styles.footerLink}>Главная</Link>
            <Link to="/login" style={styles.footerLink}>Войти</Link>
            <Link to="/register" style={styles.footerLink}>Регистрация</Link>
            <Link to="/admin" style={styles.footerLink}>Админка</Link>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>
            © 2024 T-Bank Queue. Создано для хакатона Т-Банк × НГТУ
          </p>
        </div>
      </footer>
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
    transition: 'color 0.3s ease',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: '60px 40px',
    borderBottom: '1px solid #E0E0E0',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: '#191919',
    marginBottom: '15px',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    fontSize: '1.3rem',
    color: '#666666',
    marginBottom: '40px',
  },
  userCard: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px 30px',
    backgroundColor: '#F5F5F5',
    borderRadius: '100px',
    marginBottom: '30px',
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#FFDD2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#191919',
  },
  userInfo: {},
  userName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '0.9rem',
    color: '#666666',
  },
  searchContainer: {
    position: 'relative',
    maxWidth: '600px',
  },
  searchIcon: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.3rem',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '16px 55px 16px 55px',
    fontSize: '1rem',
    backgroundColor: '#F5F5F5',
    border: '2px solid #E0E0E0',
    borderRadius: '100px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#666666',
    fontSize: '1.3rem',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  content: {
    padding: '60px 40px',
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 20px',
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
  errorBox: {
    backgroundColor: '#FFF3F3',
    border: '3px solid #F44336',
    borderRadius: '30px',
    padding: '30px',
    textAlign: 'center',
    color: '#C62828',
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  errorIcon: {
    fontSize: '2rem',
  },
  resultsCount: {
    fontSize: '1rem',
    color: '#666666',
    marginBottom: '30px',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '30px',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid #E0E0E0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  eventIcon: {
    fontSize: '2.5rem',
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventName: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '12px',
    letterSpacing: '-0.01em',
  },
  eventDescription: {
    fontSize: '1rem',
    color: '#666666',
    lineHeight: '1.6',
    marginBottom: '20px',
    minHeight: '48px',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: '#F5F5F5',
    borderRadius: '16px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '0.95rem',
    color: '#191919',
  },
  detailIcon: {
    fontSize: '1.3rem',
  },
  detailText: {
    fontWeight: '500',
  },
  eventFooter: {
    marginTop: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: '100px 40px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '30px',
  },
  emptyTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '15px',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#666666',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  footer: {
    borderTop: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
    marginTop: '60px',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '60px 40px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '40px',
  },
  footerLeft: {
    maxWidth: '400px',
  },
  footerLogo: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '15px',
    color: '#191919',
  },
  footerTagline: {
    fontSize: '0.95rem',
    color: '#666666',
  },
  footerRight: {
    display: 'flex',
    gap: '30px',
  },
  footerLink: {
    color: '#666666',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.3s ease',
  },
  footerBottom: {
    borderTop: '1px solid #E0E0E0',
    padding: '25px 40px',
  },
  copyright: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#999999',
  },
};

const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
} catch (e) {}

export default EventsPage;
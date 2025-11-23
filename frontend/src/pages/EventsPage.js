import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import eventService from '../services/eventService';
import authService from '../services/authService';
import Button from '../components/common/Button';
import './EventsPage.css';

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
    <div className="events-container">
      {/* Navigation */}
      <nav className="events-nav">
        <div className="events-nav-content">
          <Link to="/" className="events-logo">
            <span className="events-logo-text">T-Bank Queue</span>
          </Link>
          <div className="events-nav-links">
            {currentUser ? (
              <>
                <Link to="/my-queues" className="events-nav-link">Мои очереди</Link>
                <Link to="/admin" className="events-nav-link">Админ</Link>
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
                <Link to="/login" className="events-nav-link">Войти</Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="small">Регистрация</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="events-header">
        <div className="events-header-content">
          <h1 className="events-title">Активные мероприятия</h1>
          <p className="events-subtitle">
            Выберите мероприятие и встаньте в очередь онлайн
          </p>

          {/* User Info */}
          {currentUser && (
            <div className="events-user-card">
              <div className="events-user-avatar">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="events-user-info">
                <div className="events-user-name">{currentUser.name}</div>
                <div className="events-user-email">{currentUser.email}</div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="events-search-container">
            <svg className="events-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск мероприятий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="events-search-input"
            />
            {searchTerm && (
              <button
                className="events-clear-button"
                onClick={() => setSearchTerm('')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="events-content">
        <div className="events-content-wrapper">
          {/* Loading */}
          {loading && (
            <div className="events-loading">
              <div className="events-spinner"></div>
              <p>Загрузка мероприятий...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="events-error-box">
              <svg className="events-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
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
                <div className="events-empty-state">
                  <svg className="events-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 3h18v18H3z"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                  <h2 className="events-empty-title">
                    {searchTerm ? 'Ничего не найдено' : 'Нет активных мероприятий'}
                  </h2>
                  <p className="events-empty-text">
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
                  <div className="events-results-count">
                    {searchTerm ? 'Найдено' : 'Всего'} мероприятий: <strong>{filteredEvents.length}</strong>
                  </div>
                  <div className="events-grid">
                    {filteredEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/event/${event.id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="events-event-card">
                          {/* Event Header */}
                          <div className="events-event-header">
                            <svg className="events-event-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                            <div 
                              className="events-status-badge"
                              style={{
                                backgroundColor: event.is_active ? '#4CAF50' : '#F44336',
                              }}
                            >
                              {event.is_active ? 'Активно' : 'Завершено'}
                            </div>
                          </div>

                          {/* Event Content */}
                          <h3 className="events-event-name">{event.name}</h3>
                          <p className="events-event-description">
                            {event.description || 'Описание отсутствует'}
                          </p>

                          {/* Event Details */}
                          <div className="events-event-details">
                            <div className="events-detail-item">
                              <svg className="events-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              <span className="events-detail-text">
                                {event.location || 'Локация не указана'}
                              </span>
                            </div>
                            <div className="events-detail-item">
                              <svg className="events-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              <span className="events-detail-text">
                                ~{event.avg_service_time} минут
                              </span>
                            </div>
                            <div className="events-detail-item">
                              <svg className="events-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                              </svg>
                              <span className="events-detail-text">
                                До {event.max_queue_size} человек
                              </span>
                            </div>
                          </div>

                          {/* Event Footer */}
                          <div className="events-event-footer">
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
      <footer className="events-footer">
        <div className="events-footer-content">
          <div className="events-footer-left">
            <div className="events-footer-logo">T-Bank Queue</div>
            <p className="events-footer-tagline">
              Электронная очередь для мероприятий
            </p>
          </div>
          <div className="events-footer-right">
            <Link to="/" className="events-footer-link">Главная</Link>
            <Link to="/login" className="events-footer-link">Войти</Link>
            <Link to="/register" className="events-footer-link">Регистрация</Link>
            <Link to="/admin" className="events-footer-link">Админ</Link>
          </div>
        </div>
        <div className="events-footer-bottom">
          <p className="events-copyright">
            © 2025 T-Bank Queue. Создано для хакатона Т-Банк × НГТУ
          </p>
        </div>
      </footer>
    </div>
  );
}

export default EventsPage;
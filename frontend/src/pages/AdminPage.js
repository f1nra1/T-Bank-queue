import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import Button from '../components/common/Button';
import './AdminPage.css';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    location: '',
    avg_service_time: 5,
    max_queue_size: 50,
  });
  
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'stats') {
        const data = await adminService.getStats();
        setStats(data);
      } else if (activeTab === 'users') {
        const data = await adminService.getAllUsers();
        setUsers(data);
      } else if (activeTab === 'events') {
        const data = await adminService.getAllEventsAdmin();
        setEvents(data);
      } else if (activeTab === 'queues') {
        const data = await adminService.getAllQueues();
        setQueues(data);
      }
    } catch (err) {
      setError(err.error || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await adminService.createEvent(eventForm);
      setShowCreateEventModal(false);
      setEventForm({
        name: '',
        description: '',
        location: '',
        avg_service_time: 5,
        max_queue_size: 50,
      });
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка создания события');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Удалить пользователя "${userName}"?`)) return;
    try {
      await adminService.deleteUser(userId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка удаления');
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Удалить событие "${eventName}"?`)) return;
    try {
      await adminService.deleteEvent(eventId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка удаления');
    }
  };

  const handleToggleEvent = async (eventId, isActive) => {
    try {
      await adminService.toggleEvent(eventId, !isActive);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка изменения статуса');
    }
  };

  const handleDeleteQueue = async (entryId, userName) => {
    if (!window.confirm(`Удалить "${userName}" из очереди?`)) return;
    try {
      await adminService.deleteQueueEntry(entryId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка удаления');
    }
  };

  const handleCallQueue = async (entryId) => {
    try {
      await adminService.callQueueEntry(entryId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка вызова');
    }
  };

  const handleCompleteQueue = async (entryId) => {
    try {
      await adminService.completeQueueEntry(entryId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка завершения');
    }
  };

  // Фильтрация
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && event.is_active) ||
      (filterStatus === 'inactive' && !event.is_active);
    return matchesSearch && matchesFilter;
  });

  const filteredQueues = queues.filter(queue => {
    const matchesSearch = queue.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      queue.event_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || queue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-container">
      {/* Navigation */}
      <nav className="admin-nav">
        <div className="admin-nav-content">
          <Link to="/" className="admin-logo">
            <span className="admin-logo-text">T-Bank Queue</span>
          </Link>
          <div className="admin-nav-links">
            <Link to="/events" className="admin-nav-link">Мероприятия</Link>
            {currentUser && (
              <>
                <span className="admin-badge">Админ</span>
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
      <div className="admin-header">
        <h1 className="admin-title">Панель управления</h1>
        <p className="admin-subtitle">Управление системой очередей</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-wrapper">
        <div className="admin-tabs">
          {[
            { id: 'stats', label: 'Статистика' },
            { id: 'users', label: 'Пользователи' },
            { id: 'events', label: 'События' },
            { id: 'queues', label: 'Очереди' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'admin-tab-active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {activeTab !== 'stats' && (
        <div className="admin-controls">
          <div className="admin-search-wrapper">
            <svg className="admin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          {(activeTab === 'events' || activeTab === 'queues') && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Все</option>
              {activeTab === 'events' ? (
                <>
                  <option value="active">Активные</option>
                  <option value="inactive">Неактивные</option>
                </>
              ) : (
                <>
                  <option value="waiting">Ожидают</option>
                  <option value="called">Вызваны</option>
                </>
              )}
            </select>
          )}

          {activeTab === 'events' && (
            <button
              className="admin-create-button"
              onClick={() => setShowCreateEventModal(true)}
            >
              Создать событие
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <main className="admin-main">
        {loading && (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Загрузка...</p>
          </div>
        )}

        {error && (
          <div className="admin-error-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            {activeTab === 'stats' && stats && (
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <svg className="admin-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <div className="admin-stat-value">{stats.totalUsers || 0}</div>
                  <div className="admin-stat-label">Пользователей</div>
                </div>
                <div className="admin-stat-card">
                  <svg className="admin-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <div className="admin-stat-value">{stats.totalEvents || 0}</div>
                  <div className="admin-stat-label">Событий</div>
                </div>
                <div className="admin-stat-card">
                  <svg className="admin-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 5H2v15h7V5z"/>
                    <path d="M22 5h-7v15h7V5z"/>
                  </svg>
                  <div className="admin-stat-value">{stats.activeQueues || 0}</div>
                  <div className="admin-stat-label">В очередях</div>
                </div>
                <div className="admin-stat-card">
                  <svg className="admin-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div className="admin-stat-value">{stats.completedServices || 0}</div>
                  <div className="admin-stat-label">Обслужено</div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="admin-card">
                <h3 className="admin-card-title">Пользователи ({filteredUsers.length})</h3>
                {filteredUsers.length === 0 ? (
                  <div className="admin-empty-state">
                    <svg className="admin-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M3 9h18"/>
                      <path d="M9 21V9"/>
                    </svg>
                    <p>Пользователи не найдены</p>
                  </div>
                ) : (
                  <div className="admin-list">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="admin-list-item">
                        <div className="admin-user-info">
                          <div className="admin-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="admin-user-name">{user.name}</div>
                            <div className="admin-user-email">{user.email}</div>
                          </div>
                        </div>
                        <div className="admin-user-meta">
                          <span className={`admin-role-badge ${user.role === 'admin' ? 'admin-role-admin' : ''}`}>
                            {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                          </span>
                        </div>
                        <div className="admin-actions">
                          <button
                            className="admin-btn-danger"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events */}
            {activeTab === 'events' && (
              <div>
                {filteredEvents.length === 0 ? (
                  <div className="admin-card">
                    <div className="admin-empty-state">
                      <svg className="admin-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 3h18v18H3z"/>
                        <path d="M3 9h18"/>
                        <path d="M9 21V9"/>
                      </svg>
                      <p>События не найдены</p>
                      <button
                        className="admin-create-button"
                        onClick={() => setShowCreateEventModal(true)}
                      >
                        Создать первое событие
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-events-grid">
                    {filteredEvents.map(event => (
                      <div key={event.id} className="admin-event-card-new">
                        {/* Header with Icon and Badge */}
                        <div className="admin-event-card-header">
                          <svg className="admin-event-card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                          </svg>
                          <span className={`admin-event-badge ${event.is_active ? 'admin-event-badge-active' : 'admin-event-badge-inactive'}`}>
                            {event.is_active ? 'Активно' : 'Неактивно'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="admin-event-card-name">{event.name}</h3>

                        {/* Description */}
                        <p className="admin-event-card-desc">
                          {event.description || 'Описание отсутствует'}
                        </p>

                        {/* Info Section */}
                        <div className="admin-event-info-box">
                          <div className="admin-event-info-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>{event.location || 'Не указано'}</span>
                          </div>
                          <div className="admin-event-info-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>{event.avg_service_time} мин</span>
                          </div>
                          <div className="admin-event-info-row">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                            </svg>
                            <span>Макс: {event.max_queue_size}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="admin-event-card-actions">
                          <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                            <button className="admin-event-btn admin-event-btn-open">Открыть</button>
                          </Link>
                          <button
                            className={`admin-event-btn ${event.is_active ? 'admin-event-btn-deactivate' : 'admin-event-btn-activate'}`}
                            onClick={() => handleToggleEvent(event.id, event.is_active)}
                          >
                            {event.is_active ? 'Деактивировать' : 'Активировать'}
                          </button>
                          <button
                            className="admin-event-btn admin-event-btn-delete"
                            onClick={() => handleDeleteEvent(event.id, event.name)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Queues */}
            {activeTab === 'queues' && (
              <div className="admin-card">
                <h3 className="admin-card-title">Очереди ({filteredQueues.length})</h3>
                {filteredQueues.length === 0 ? (
                  <div className="admin-empty-state">
                    <svg className="admin-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 3h18v18H3z"/>
                      <path d="M3 9h18"/>
                      <path d="M9 21V9"/>
                    </svg>
                    <p>Очереди пусты</p>
                  </div>
                ) : (
                  <div className="admin-list">
                    {filteredQueues.map(queue => (
                      <div key={queue.id} className="admin-queue-item">
                        <div className="admin-queue-position">#{queue.position}</div>
                        <div className="admin-queue-info">
                          <div className="admin-queue-user-name">{queue.user_name}</div>
                          <div className="admin-queue-event-name">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M12 6v6l4 2"/>
                            </svg>
                            {queue.event_name}
                          </div>
                        </div>
                        <div className={`admin-queue-status ${
                          queue.status === 'waiting' ? 'admin-queue-waiting' : 'admin-queue-called'
                        }`}>
                          {queue.status === 'waiting' ? 'Ожидает' : 'Вызван'}
                        </div>
                        <div className="admin-queue-actions">
                          {queue.status === 'waiting' ? (
                            <button
                              className="admin-btn-success"
                              onClick={() => handleCallQueue(queue.id)}
                            >
                              Вызвать
                            </button>
                          ) : (
                            <button
                              className="admin-btn-success"
                              onClick={() => handleCompleteQueue(queue.id)}
                            >
                              Завершить
                            </button>
                          )}
                          <button
                            className="admin-btn-danger"
                            onClick={() => handleDeleteQueue(queue.id, queue.user_name)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateEventModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2 className="admin-modal-title">Создать событие</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="admin-form-group">
                <label className="admin-form-label">Название *</label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="admin-form-input"
                  placeholder="Викторина по IT"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Описание</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="admin-form-input admin-form-textarea"
                  placeholder="Интересная викторина с призами"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Локация</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="admin-form-input"
                  placeholder="Главная сцена"
                />
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Время обсл. (мин)</label>
                  <input
                    type="number"
                    value={eventForm.avg_service_time}
                    onChange={(e) => setEventForm({ ...eventForm, avg_service_time: parseInt(e.target.value) })}
                    className="admin-form-input"
                    min="1"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Макс. очередь</label>
                  <input
                    type="number"
                    value={eventForm.max_queue_size}
                    onChange={(e) => setEventForm({ ...eventForm, max_queue_size: parseInt(e.target.value) })}
                    className="admin-form-input"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-btn-outline"
                  onClick={() => setShowCreateEventModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="admin-btn-primary">
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
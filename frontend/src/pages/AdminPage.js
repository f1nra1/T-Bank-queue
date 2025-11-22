import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import Button from '../components/common/Button';

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
                <span style={styles.adminBadge}>👨‍💼 Админ</span>
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
        <h1 style={styles.title}>Панель управления</h1>
        <p style={styles.subtitle}>Управление системой очередей</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <div style={styles.tabs}>
          {[
            { id: 'stats', icon: '📊', label: 'Статистика' },
            { id: 'users', icon: '👥', label: 'Пользователи' },
            { id: 'events', icon: '🎯', label: 'События' },
            { id: 'queues', icon: '📋', label: 'Очереди' },
          ].map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchTerm('');
                setFilterStatus('all');
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {activeTab !== 'stats' && (
        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {(activeTab === 'events' || activeTab === 'queues') && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
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
              style={styles.createButton}
              onClick={() => setShowCreateEventModal(true)}
            >
              ➕ Создать событие
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <main style={styles.main}>
        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Загрузка...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            {activeTab === 'stats' && stats && (
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>👥</div>
                  <div style={styles.statValue}>{stats.totalUsers || 0}</div>
                  <div style={styles.statLabel}>Пользователей</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>🎯</div>
                  <div style={styles.statValue}>{stats.totalEvents || 0}</div>
                  <div style={styles.statLabel}>Событий</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>📋</div>
                  <div style={styles.statValue}>{stats.activeQueues || 0}</div>
                  <div style={styles.statLabel}>В очередях</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIcon}>✅</div>
                  <div style={styles.statValue}>{stats.completedServices || 0}</div>
                  <div style={styles.statLabel}>Обслужено</div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Пользователи ({filteredUsers.length})</h3>
                {filteredUsers.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <p>Пользователи не найдены</p>
                  </div>
                ) : (
                  <div style={styles.list}>
                    {filteredUsers.map(user => (
                      <div key={user.id} style={styles.listItem}>
                        <div style={styles.userInfo}>
                          <div style={styles.avatar}>
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={styles.userName}>{user.name}</div>
                            <div style={styles.userEmail}>{user.email}</div>
                          </div>
                        </div>
                        <div style={styles.userMeta}>
                          <span style={{
                            ...styles.roleBadge,
                            backgroundColor: user.role === 'admin' ? '#FFDD2D' : '#E0E0E0',
                            color: user.role === 'admin' ? '#191919' : '#666666',
                          }}>
                            {user.role === 'admin' ? '👨‍💼 Админ' : '👤 Пользователь'}
                          </span>
                        </div>
                        <div style={styles.actions}>
                          <button
                            style={styles.btnDanger}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            🗑️ Удалить
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
                  <div style={styles.card}>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📭</div>
                      <p>События не найдены</p>
                      <button
                        style={styles.createButton}
                        onClick={() => setShowCreateEventModal(true)}
                      >
                        ➕ Создать первое событие
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.eventsGrid}>
                    {filteredEvents.map(event => (
                      <div key={event.id} style={styles.eventCard}>
                        <div style={styles.eventHeader}>
                          <span style={styles.eventIcon}>🎯</span>
                          <span style={{
                            ...styles.statusBadge,
                            backgroundColor: event.is_active ? '#4CAF50' : '#F44336',
                          }}>
                            {event.is_active ? '✓ Активно' : '✕ Неактивно'}
                          </span>
                        </div>
                        <h4 style={styles.eventName}>{event.name}</h4>
                        <p style={styles.eventDescription}>
                          {event.description || 'Без описания'}
                        </p>
                        <div style={styles.eventMeta}>
                          <div style={styles.metaItem}>
                            <span>📍</span>
                            <span>{event.location || 'Не указано'}</span>
                          </div>
                          <div style={styles.metaItem}>
                            <span>⏱️</span>
                            <span>{event.avg_service_time} мин</span>
                          </div>
                          <div style={styles.metaItem}>
                            <span>👥</span>
                            <span>Макс: {event.max_queue_size}</span>
                          </div>
                        </div>
                        <div style={styles.eventActions}>
                          <Link to={`/event/${event.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                            <button style={styles.btnPrimary}>👁️ Открыть</button>
                          </Link>
                          <button
                            style={event.is_active ? styles.btnWarning : styles.btnSuccess}
                            onClick={() => handleToggleEvent(event.id, event.is_active)}
                          >
                            {event.is_active ? '⏸️' : '▶️'}
                          </button>
                          <button
                            style={styles.btnDanger}
                            onClick={() => handleDeleteEvent(event.id, event.name)}
                          >
                            🗑️
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
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Очереди ({filteredQueues.length})</h3>
                {filteredQueues.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <p>Очереди пусты</p>
                  </div>
                ) : (
                  <div style={styles.list}>
                    {filteredQueues.map(queue => (
                      <div key={queue.id} style={styles.queueItem}>
                        <div style={styles.queuePosition}>#{queue.position}</div>
                        <div style={styles.queueInfo}>
                          <div style={styles.queueUserName}>{queue.user_name}</div>
                          <div style={styles.queueEventName}>🎯 {queue.event_name}</div>
                        </div>
                        <div style={{
                          ...styles.queueStatus,
                          backgroundColor: queue.status === 'waiting' ? '#E3F2FD' : '#FFF3E0',
                          color: queue.status === 'waiting' ? '#1976D2' : '#E65100',
                        }}>
                          {queue.status === 'waiting' ? '⏳ Ожидает' : '📢 Вызван'}
                        </div>
                        <div style={styles.queueActions}>
                          {queue.status === 'waiting' ? (
                            <button
                              style={styles.btnSuccess}
                              onClick={() => handleCallQueue(queue.id)}
                            >
                              📢 Вызвать
                            </button>
                          ) : (
                            <button
                              style={styles.btnSuccess}
                              onClick={() => handleCompleteQueue(queue.id)}
                            >
                              ✅ Завершить
                            </button>
                          )}
                          <button
                            style={styles.btnDanger}
                            onClick={() => handleDeleteQueue(queue.id, queue.user_name)}
                          >
                            🗑️
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
        <div style={styles.modalOverlay} onClick={() => setShowCreateEventModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>➕ Создать событие</h2>
            <form onSubmit={handleCreateEvent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Название *</label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  style={styles.formInput}
                  placeholder="Викторина по IT"
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Описание</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  style={{ ...styles.formInput, minHeight: '80px' }}
                  placeholder="Интересная викторина с призами"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Локация</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  style={styles.formInput}
                  placeholder="Главная сцена"
                />
              </div>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Время обсл. (мин)</label>
                  <input
                    type="number"
                    value={eventForm.avg_service_time}
                    onChange={(e) => setEventForm({ ...eventForm, avg_service_time: parseInt(e.target.value) })}
                    style={styles.formInput}
                    min="1"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Макс. очередь</label>
                  <input
                    type="number"
                    value={eventForm.max_queue_size}
                    onChange={(e) => setEventForm({ ...eventForm, max_queue_size: parseInt(e.target.value) })}
                    style={styles.formInput}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.btnOutline}
                  onClick={() => setShowCreateEventModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  ✓ Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  adminBadge: {
    padding: '6px 12px',
    backgroundColor: '#FFDD2D',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#191919',
  },
  header: {
    textAlign: 'center',
    padding: '50px 40px 30px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#191919',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666666',
  },
  tabsWrapper: {
    padding: '0 40px',
    borderBottom: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '5px',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '18px 25px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#666666',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  tabActive: {
    color: '#191919',
    borderBottomColor: '#FFDD2D',
    backgroundColor: '#FFFDF5',
  },
  controls: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '25px 40px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    flex: 1,
    minWidth: '250px',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.1rem',
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px 14px 45px',
    fontSize: '1rem',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  filterSelect: {
    padding: '14px 20px',
    fontSize: '1rem',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  createButton: {
    padding: '14px 24px',
    backgroundColor: '#FFDD2D',
    color: '#191919',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 40px 60px',
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
    padding: '20px',
    backgroundColor: '#FFF3F3',
    border: '2px solid #F44336',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#C62828',
    marginBottom: '25px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '35px 25px',
    textAlign: 'center',
    border: '1px solid #E0E0E0',
  },
  statIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
  },
  statValue: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#191919',
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#666666',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid #E0E0E0',
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '25px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666666',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '15px',
    opacity: 0.5,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#F5F5F5',
    borderRadius: '16px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1,
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#FFDD2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#191919',
  },
  userName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '3px',
  },
  userEmail: {
    fontSize: '0.9rem',
    color: '#666666',
  },
  userMeta: {},
  roleBadge: {
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '25px',
    border: '1px solid #E0E0E0',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  eventIcon: {
    fontSize: '2rem',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventName: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '10px',
  },
  eventDescription: {
    fontSize: '0.95rem',
    color: '#666666',
    marginBottom: '15px',
    minHeight: '40px',
  },
  eventMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '15px',
    backgroundColor: '#F5F5F5',
    borderRadius: '12px',
    marginBottom: '15px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#666666',
  },
  eventActions: {
    display: 'flex',
    gap: '10px',
  },
  queueItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#F5F5F5',
    borderRadius: '16px',
  },
  queuePosition: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#191919',
    minWidth: '50px',
  },
  queueInfo: {
    flex: 1,
  },
  queueUserName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '3px',
  },
  queueEventName: {
    fontSize: '0.9rem',
    color: '#666666',
  },
  queueStatus: {
    padding: '8px 14px',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  queueActions: {
    display: 'flex',
    gap: '10px',
  },
  btnPrimary: {
    flex: 1,
    padding: '12px 18px',
    backgroundColor: '#FFDD2D',
    color: '#191919',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnOutline: {
    padding: '12px 18px',
    backgroundColor: 'transparent',
    color: '#191919',
    border: '2px solid #E0E0E0',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSuccess: {
    padding: '12px 18px',
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    border: '1px solid #4CAF50',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnWarning: {
    padding: '12px 18px',
    backgroundColor: '#FFF3E0',
    color: '#E65100',
    border: '1px solid #FF9800',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '12px 18px',
    backgroundColor: '#FFEBEE',
    color: '#C62828',
    border: '1px solid #F44336',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '35px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '25px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#191919',
    marginBottom: '8px',
  },
  formInput: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '1rem',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '25px',
  },
};

// CSS анимации
const addKeyframes = () => {
  const styleId = 'admin-page-keyframes';
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

export default AdminPage;
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import { colors, commonStyles } from '../styles/theme';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Модальные окна
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Поиск и фильтры
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Форма создания события
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
    if (!window.confirm(`Удалить пользователя "${userName}"? Это также удалит все его очереди и сообщения.`)) return;
    
    try {
      await adminService.deleteUser(userId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка удаления');
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Удалить событие "${eventName}"? Это также удалит все очереди и сообщения этого события.`)) return;
    
    try {
      await adminService.deleteEvent(eventId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка удаления');
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

  const handleCompleteQueue = async (entryId, userName) => {
    if (!window.confirm(`Завершить обслуживание для "${userName}"?`)) return;
    
    try {
      await adminService.completeQueueEntry(entryId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка');
    }
  };

  const handleSkipQueue = async (entryId, userName) => {
    if (!window.confirm(`Переместить "${userName}" в конец очереди?`)) return;
    
    try {
      await adminService.skipQueueEntry(entryId);
      loadData();
    } catch (err) {
      alert(err.error || 'Ошибка');
    }
  };

  // Фильтрация данных
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && event.is_active) ||
                         (filterStatus === 'inactive' && !event.is_active);
    return matchesSearch && matchesFilter;
  });

  const filteredQueues = queues.filter(queue => {
    const matchesSearch = queue.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         queue.event_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || queue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>👨‍💼 Админ-панель</h1>
          <p style={styles.subtitle}>Управление системой очередей</p>
        </div>
        <div style={styles.headerActions}>
          <Link to="/events" style={{ textDecoration: 'none' }}>
            <Button variant="outline" icon="🎯" size="small">К событиям</Button>
          </Link>
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
      </header>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
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
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Controls (Search + Filters) */}
      {activeTab !== 'stats' && (
        <div style={styles.controls}>
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={`Поиск ${
                activeTab === 'users' ? 'пользователей' :
                activeTab === 'events' ? 'событий' :
                'очередей'
              }...`}
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

          {(activeTab === 'events' || activeTab === 'queues') && (
            <div style={styles.filters}>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">Все статусы</option>
                {activeTab === 'events' ? (
                  <>
                    <option value="active">Активные</option>
                    <option value="inactive">Неактивные</option>
                  </>
                ) : (
                  <>
                    <option value="waiting">Ожидают</option>
                    <option value="paused">На паузе</option>
                    <option value="completed">Завершены</option>
                  </>
                )}
              </select>
            </div>
          )}

          {activeTab === 'events' && (
            <Button
              variant="primary"
              icon="➕"
              onClick={() => setShowCreateEventModal(true)}
            >
              Создать событие
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p>Загрузка данных...</p>
          </div>
        )}

        {error && (
          <Card style={{ backgroundColor: colors.error.dark, marginBottom: '20px' }}>
            <div style={styles.errorMessage}>⚠️ {error}</div>
          </Card>
        )}

        {!loading && (
          <>
            {/* Статистика */}
            {activeTab === 'stats' && stats && (
              <div>
                <div style={styles.statsGrid}>
                  <Card hoverable>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>👥</div>
                      <div style={styles.statValue}>{stats.totalUsers}</div>
                      <div style={styles.statLabel}>Всего пользователей</div>
                    </div>
                  </Card>
                  <Card hoverable>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>🎯</div>
                      <div style={styles.statValue}>{stats.totalEvents}</div>
                      <div style={styles.statLabel}>Всего событий</div>
                    </div>
                  </Card>
                  <Card hoverable>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>📋</div>
                      <div style={styles.statValue}>{stats.activeQueues}</div>
                      <div style={styles.statLabel}>Активных очередей</div>
                    </div>
                  </Card>
                  <Card hoverable>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>✅</div>
                      <div style={styles.statValue}>{stats.completedServices}</div>
                      <div style={styles.statLabel}>Обслужено людей</div>
                    </div>
                  </Card>
                  <Card hoverable>
                    <div style={styles.statCard}>
                      <div style={styles.statIcon}>💬</div>
                      <div style={styles.statValue}>{stats.totalMessages}</div>
                      <div style={styles.statLabel}>Отправлено сообщений</div>
                    </div>
                  </Card>
                </div>

                {/* Быстрые действия */}
                <Card style={{ marginTop: '30px' }}>
                  <h3 style={styles.sectionTitle}>⚡ Быстрые действия</h3>
                  <div style={styles.quickActions}>
                    <Button
                      variant="primary"
                      icon="➕"
                      onClick={() => {
                        setActiveTab('events');
                        setShowCreateEventModal(true);
                      }}
                    >
                      Создать событие
                    </Button>
                    <Button
                      variant="outline"
                      icon="👥"
                      onClick={() => setActiveTab('users')}
                    >
                      Управление пользователями
                    </Button>
                    <Button
                      variant="outline"
                      icon="📋"
                      onClick={() => setActiveTab('queues')}
                    >
                      Управление очередями
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Пользователи */}
            {activeTab === 'users' && (
              <Card>
                <div style={styles.tableHeader}>
                  <h3 style={styles.sectionTitle}>
                    Пользователи ({filteredUsers.length})
                  </h3>
                </div>
                {filteredUsers.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔍</div>
                    <div style={styles.emptyText}>Пользователи не найдены</div>
                  </div>
                ) : (
                  <div style={styles.table}>
                    {filteredUsers.map((user) => (
                      <div key={user.id} style={styles.tableRow}>
                        <div style={styles.userInfo}>
                          <div style={styles.userAvatar}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={styles.userName}>{user.name}</div>
                            <div style={styles.userEmail}>{user.email}</div>
                            {user.phone && (
                              <div style={styles.userPhone}>📱 {user.phone}</div>
                            )}
                          </div>
                        </div>
                        <div style={styles.userMeta}>
                          <div style={styles.userRole}>
                            {user.role === 'admin' ? '👨‍💼 Админ' : '👤 Пользователь'}
                          </div>
                          <div style={styles.userDate}>
                            Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        <div style={styles.rowActions}>
                          <Button
                            variant="outline"
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetailsModal(true);
                            }}
                            icon="👁️"
                          >
                            Детали
                          </Button>
                          <Button
                            variant="error"
                            size="small"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            icon="🗑️"
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* События */}
            {activeTab === 'events' && (
              <div>
                {filteredEvents.length === 0 ? (
                  <Card>
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🔍</div>
                      <div style={styles.emptyText}>
                        {searchTerm ? 'События не найдены' : 'Нет событий'}
                      </div>
                      {!searchTerm && (
                        <Button
                          variant="primary"
                          icon="➕"
                          onClick={() => setShowCreateEventModal(true)}
                          style={{ marginTop: '20px' }}
                        >
                          Создать первое событие
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  <div style={styles.eventsGrid}>
                    {filteredEvents.map((event) => (
                      <Card key={event.id} hoverable>
                        <div style={styles.eventCard}>
                          <div style={styles.eventHeader}>
                            <div style={styles.eventIcon}>🎯</div>
                            <div style={{
                              ...styles.eventStatusBadge,
                              backgroundColor: event.is_active ? colors.success.main : colors.error.main,
                            }}>
                              {event.is_active ? '✓ Активно' : '✕ Неактивно'}
                            </div>
                          </div>
                          <h4 style={styles.eventName}>{event.name}</h4>
                          <p style={styles.eventDescription}>
                            {event.description || 'Без описания'}
                          </p>
                          <div style={styles.eventMeta}>
                            <div style={styles.metaItem}>
                              <span style={styles.metaIcon}>📍</span>
                              <span>{event.location || 'Не указано'}</span>
                            </div>
                            <div style={styles.metaItem}>
                              <span style={styles.metaIcon}>⏱️</span>
                              <span>{event.avg_service_time} мин</span>
                            </div>
                            <div style={styles.metaItem}>
                              <span style={styles.metaIcon}>👥</span>
                              <span>До {event.max_queue_size}</span>
                            </div>
                          </div>
                          <div style={styles.eventActions}>
                            <Link
                              to={`/event/${event.id}`}
                              style={{ textDecoration: 'none', flex: 1 }}
                            >
                              <Button variant="outline" size="small" fullWidth icon="👁️">
                                Просмотр
                              </Button>
                            </Link>
                            <Button
                              variant="error"
                              size="small"
                              onClick={() => handleDeleteEvent(event.id, event.name)}
                              icon="🗑️"
                            >
                              Удалить
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Очереди */}
            {activeTab === 'queues' && (
              <Card>
                <h3 style={styles.sectionTitle}>
                  Управление очередями ({filteredQueues.length})
                </h3>
                {filteredQueues.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🔍</div>
                    <div style={styles.emptyText}>Очереди не найдены</div>
                  </div>
                ) : (
                  <div style={styles.table}>
                    {filteredQueues.map((queue) => (
                      <div key={queue.id} style={styles.queueRow}>
                        <div style={styles.queuePosition}>
                          #{queue.position}
                        </div>
                        <div style={styles.queueMainInfo}>
                          <div style={styles.queueUser}>
                            <div style={styles.queueUserName}>{queue.user_name}</div>
                            <div style={styles.queueUserEmail}>{queue.user_email}</div>
                          </div>
                          <div style={styles.queueEvent}>
                            🎯 {queue.event_name}
                          </div>
                        </div>
                        <div style={styles.queueStatusSection}>
                          <div style={{
                            ...styles.queueStatusBadge,
                            backgroundColor:
                              queue.status === 'waiting' ? colors.success.main :
                              queue.status === 'paused' ? colors.warning.main :
                              colors.text.secondary,
                          }}>
                            {queue.status === 'waiting' ? '⏳ Ожидает' :
                             queue.status === 'paused' ? '⏸️ Пауза' :
                             '✅ Завершен'}
                          </div>
                          <div style={styles.queueTime}>
                            {new Date(queue.joined_at).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                        <div style={styles.queueActions}>
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => handleCompleteQueue(queue.id, queue.user_name)}
                            icon="✅"
                            disabled={queue.status === 'completed'}
                          >
                            Завершить
                          </Button>
                          <Button
                            variant="warning"
                            size="small"
                            onClick={() => handleSkipQueue(queue.id, queue.user_name)}
                            icon="⏭️"
                            disabled={queue.status === 'completed'}
                          >
                            Пропустить
                          </Button>
                          <Button
                            variant="error"
                            size="small"
                            onClick={() => handleDeleteQueue(queue.id, queue.user_name)}
                            icon="🗑️"
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>

      {/* Модальное окно создания события */}
      <Modal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        title="➕ Создать новое событие"
      >
        <form onSubmit={handleCreateEvent} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Название события *</label>
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
              style={{ ...styles.formInput, minHeight: '100px', resize: 'vertical' }}
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
              <label style={styles.formLabel}>Время обслуживания (мин)</label>
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
              <label style={styles.formLabel}>Макс. очередь (чел)</label>
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

          <div style={styles.formActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateEventModal(false)}
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" icon="✓">
              Создать событие
            </Button>
          </div>
        </form>
      </Modal>

      {/* Модальное окно деталей пользователя */}
      <Modal
        isOpen={showUserDetailsModal}
        onClose={() => setShowUserDetailsModal(false)}
        title="👤 Детали пользователя"
      >
        {selectedUser && (
          <div style={styles.userDetails}>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>ID:</div>
              <div style={styles.detailValue}>{selectedUser.id}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Имя:</div>
              <div style={styles.detailValue}>{selectedUser.name}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Email:</div>
              <div style={styles.detailValue}>{selectedUser.email}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Телефон:</div>
              <div style={styles.detailValue}>{selectedUser.phone || 'Не указан'}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Роль:</div>
              <div style={styles.detailValue}>{selectedUser.role}</div>
            </div>
            <div style={styles.detailRow}>
              <div style={styles.detailLabel}>Дата регистрации:</div>
              <div style={styles.detailValue}>
                {new Date(selectedUser.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const styles = {
  container: {
    ...commonStyles.container,
    maxWidth: '1800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px 40px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    ...commonStyles.pageTitle,
    fontSize: '2.8rem',
    marginBottom: '5px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: colors.text.secondary,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  tabsContainer: {
    padding: '0 40px',
    borderBottom: `2px solid ${colors.divider}`,
  },
  tabs: {
    display: 'flex',
    gap: '5px',
    overflowX: 'auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '15px 25px',
    background: 'transparent',
    border: 'none',
    borderBottom: `3px solid transparent`,
    color: colors.text.secondary,
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: colors.primary.main,
    borderBottomColor: colors.primary.main,
    backgroundColor: `${colors.primary.main}11`,
  },
  tabIcon: {
    fontSize: '1.3rem',
  },
  controls: {
    display: 'flex',
    gap: '15px',
    padding: '25px 40px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchBar: {
    flex: 1,
    position: 'relative',
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.2rem',
  },
  searchInput: {
    ...commonStyles.input,
    paddingLeft: '45px',
    paddingRight: '40px',
  },
  clearButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: colors.text.secondary,
    cursor: 'pointer',
    fontSize: '1.5rem',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  filterSelect: {
    ...commonStyles.input,
    paddingRight: '35px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    appearance: 'none',
  },
  content: {
    padding: '0 40px 40px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: colors.text.secondary,
    fontSize: '1.1rem',
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
  errorMessage: {
    textAlign: 'center',
    color: 'white',
    fontSize: '1.1rem',
    padding: '10px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '25px',
  },
  statCard: {
    textAlign: 'center',
    padding: '30px 20px',
  },
  statIcon: {
    fontSize: '4rem',
    marginBottom: '15px',
  },
  statValue: {
    fontSize: '3.5rem',
    fontWeight: '700',
    background: colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
    lineHeight: '1',
  },
  statLabel: {
    fontSize: '1.1rem',
    color: colors.text.secondary,
    fontWeight: '500',
  },
  quickActions: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  tableHeader: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: colors.info.main,
    margin: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyIcon: {
    fontSize: '5rem',
    marginBottom: '20px',
    opacity: 0.5,
  },
  emptyText: {
    fontSize: '1.3rem',
    color: colors.text.secondary,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tableRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: colors.background.input,
    borderRadius: '12px',
    transition: 'all 0.3s',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: 1,
  },
  userAvatar: {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    background: colors.primary.gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: 'white',
    flexShrink: 0,
  },
  userName: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '4px',
  },
  userEmail: {
    fontSize: '0.95rem',
    color: colors.text.secondary,
  },
  userPhone: {
    fontSize: '0.9rem',
    color: colors.text.secondary,
    marginTop: '2px',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  userRole: {
    padding: '6px 14px',
    backgroundColor: colors.info.main,
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  userDate: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
  },
  rowActions: {
    display: 'flex',
    gap: '10px',
  },
  eventsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '25px',
  },
  eventCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventIcon: {
    fontSize: '2.5rem',
  },
  eventStatusBadge: {
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'white',
  },
  eventName: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: colors.text.primary,
    margin: 0,
  },
  eventDescription: {
    fontSize: '1rem',
    color: colors.text.secondary,
    lineHeight: '1.5',
    minHeight: '48px',
  },
  eventMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '15px',
    backgroundColor: colors.background.input,
    borderRadius: '10px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: colors.text.secondary,
  },
  metaIcon: {
    fontSize: '1.2rem',
  },
  eventActions: {
    display: 'flex',
    gap: '10px',
  },
  queueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: colors.background.input,
    borderRadius: '12px',
  },
  queuePosition: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: colors.primary.main,
    minWidth: '70px',
    textAlign: 'center',
    padding: '10px',
    backgroundColor: `${colors.primary.main}22`,
    borderRadius: '10px',
  },
  queueMainInfo: {
    flex: 1,
  },
  queueUser: {
    marginBottom: '8px',
  },
  queueUserName: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '4px',
  },
  queueUserEmail: {
    fontSize: '0.9rem',
    color: colors.text.secondary,
  },
  queueEvent: {
    fontSize: '0.95rem',
    color: colors.info.main,
    fontWeight: '500',
  },
  queueStatusSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  },
  queueStatusBadge: {
    padding: '6px 14px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'white',
  },
  queueTime: {
    fontSize: '0.85rem',
    color: colors.text.secondary,
  },
  queueActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formLabel: {
    fontSize: '1rem',
    fontWeight: '500',
    color: colors.text.primary,
  },
  formInput: {
    ...commonStyles.input,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '10px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    backgroundColor: colors.background.input,
    borderRadius: '10px',
  },
  detailLabel: {
    fontWeight: '600',
    color: colors.text.secondary,
  },
  detailValue: {
    color: colors.text.primary,
    textAlign: 'right',
  },
};

export default AdminPage;
import api from './api';

const adminService = {
  // Пользователи
  getAllUsers: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data.users;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения пользователей' };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка удаления пользователя' };
    }
  },

  // События
  getAllEventsAdmin: async () => {
    try {
      const response = await api.get('/admin/events/all');
      return response.data.events;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения событий' };
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/admin/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка удаления события' };
    }
  },

  // Очереди
  getAllQueues: async () => {
    try {
      const response = await api.get('/admin/queues');
      return response.data.queues;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения очередей' };
    }
  },

  deleteQueueEntry: async (entryId) => {
    try {
      const response = await api.delete(`/admin/queues/${entryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка удаления записи' };
    }
  },

  completeQueueEntry: async (entryId) => {
    try {
      const response = await api.patch(`/admin/queues/${entryId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка завершения' };
    }
  },

  skipQueueEntry: async (entryId) => {
    try {
      const response = await api.patch(`/admin/queues/${entryId}/skip`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка пропуска' };
    }
  },

  // Статистика
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.stats;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения статистики' };
    }
  },

  // Создать событие
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка создания события' };
    }
  },
};

export default adminService;
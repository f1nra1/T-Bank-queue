import api from './api';

const queueService = {
  // Получить очередь для события
  getQueueByEvent: async (eventId) => {
    try {
      const response = await api.get(`/queue/${eventId}`);
      return response.data.queue || response.data || [];
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения очереди' };
    }
  },

  // Встать в очередь
  joinQueue: async (eventId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.post(`/queue/${eventId}/join`, {
        userId: user?.id
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка входа в очередь' };
    }
  },

  // Покинуть очередь
  leaveQueue: async (queueId) => {
    try {
      const response = await api.delete(`/queue/${queueId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка выхода из очереди' };
    }
  },

  // Поставить на паузу
  pauseQueue: async (queueId, minutes = 15) => {
    try {
      const response = await api.put(`/queue/${queueId}/pause`, { minutes });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка паузы' };
    }
  },

  // Возобновить
  resumeQueue: async (queueId) => {
    try {
      const response = await api.put(`/queue/${queueId}/resume`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка возобновления' };
    }
  },

  // Получить очереди пользователя по ID
  getUserQueues: async (userId) => {
    try {
      const response = await api.get(`/queue/user/${userId}`);
      return response.data.queues || response.data || [];
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения очередей' };
    }
  },

  // Получить мои очереди
  getMyQueues: async () => {
    try {
      const response = await api.get('/queue/my');
      return response.data.queues || response.data || [];
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения очередей' };
    }
  },
};

export default queueService;
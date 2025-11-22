import api from './api';

const queueService = {
  // Получить очередь для события
  getQueueByEvent: async (eventId) => {
    try {
      const response = await api.get(`/queue/${eventId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения очереди' };
    }
  },

  // Встать в очередь
  joinQueue: async (eventId) => {
    try {
      const response = await api.post(`/queue/${eventId}/join`);
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
  pauseQueue: async (queueId) => {
    try {
      const response = await api.put(`/queue/${queueId}/pause`);
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

  // Получить мои очереди
  getMyQueues: async () => {
    try {
      const response = await api.get('/queue/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Ошибка получения очередей' };
    }
  },
};

export default queueService;
import api from './api';

const queueService = {
  // Получить очередь для события
  getQueue: async (eventId) => {
    try {
      console.log('📋 Получение очереди для события:', eventId);
      const response = await api.get(`/queue/${eventId}`);
      console.log('✅ Очередь получена:', response.data.queue.length, 'человек');
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения очереди:', error);
      throw error.response?.data || { error: 'Ошибка получения очереди' };
    }
  },

  // Встать в очередь
  joinQueue: async (eventId, userId) => {
    try {
      console.log('➕ Вступление в очередь:', eventId);
      const response = await api.post(`/queue/join/${eventId}`, { userId });
      console.log('✅ Встали в очередь на позицию:', response.data.position);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка вступления в очередь:', error);
      throw error.response?.data || { error: 'Ошибка вступления в очередь' };
    }
  },

  // Покинуть очередь
  leaveQueue: async (entryId) => {
    try {
      console.log('❌ Выход из очереди:', entryId);
      const response = await api.delete(`/queue/leave/${entryId}`);
      console.log('✅ Вышли из очереди');
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка выхода из очереди:', error);
      throw error.response?.data || { error: 'Ошибка выхода из очереди' };
    }
  },

  // Получить очереди пользователя
  getUserQueues: async (userId) => {
    try {
      console.log('👤 Получение очередей пользователя:', userId);
      const response = await api.get(`/queue/user/${userId}`);
      console.log('✅ Очереди пользователя получены:', response.data.queues.length);
      return response.data.queues;
    } catch (error) {
      console.error('❌ Ошибка получения очередей:', error);
      throw error.response?.data || { error: 'Ошибка получения очередей' };
    }
  },

  // Поставить на паузу
  pauseQueue: async (entryId, minutes = 15) => {
    try {
      console.log('⏸️ Пауза в очереди:', entryId);
      const response = await api.patch(`/queue/${entryId}/pause`, { minutes });
      console.log('✅ Очередь на паузе');
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка паузы:', error);
      throw error.response?.data || { error: 'Ошибка паузы' };
    }
  },

  // Вернуться в очередь
  resumeQueue: async (entryId) => {
    try {
      console.log('▶️ Возврат в очередь:', entryId);
      const response = await api.patch(`/queue/${entryId}/resume`);
      console.log('✅ Вернулись в очередь');
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка возврата:', error);
      throw error.response?.data || { error: 'Ошибка возврата' };
    }
  },
};

export default queueService;
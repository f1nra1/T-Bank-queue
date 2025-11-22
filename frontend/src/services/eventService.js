import api from './api';

const eventService = {
  // Получить все события
  getEvents: async () => {
    try {
      const response = await api.get('/events');
      console.log('✅ События получены:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения событий:', error);
      throw error.response?.data || { error: 'Ошибка получения событий' };
    }
  },

  // Получить событие по ID
  getEventById: async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      console.log('✅ Событие получено:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка получения события:', error);
      throw error.response?.data || { error: 'Ошибка получения события' };
    }
  },

  // Создать событие
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      console.log('✅ Событие создано:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка создания события:', error);
      throw error.response?.data || { error: 'Ошибка создания события' };
    }
  },

  // Обновить событие
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      console.log('✅ Событие обновлено:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка обновления события:', error);
      throw error.response?.data || { error: 'Ошибка обновления события' };
    }
  },

  // Удалить событие
  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/events/${id}`);
      console.log('✅ Событие удалено');
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка удаления события:', error);
      throw error.response?.data || { error: 'Ошибка удаления события' };
    }
  },
};

export default eventService;
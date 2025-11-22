import api from './api';

const eventService = {
  // Получить все события
  getAllEvents: async () => {
    try {
      console.log('📋 Получение всех событий');
      const response = await api.get('/events');
      console.log('✅ События получены:', response.data.events.length);
      return response.data.events;
    } catch (error) {
      console.error('❌ Ошибка получения событий:', error);
      throw error.response?.data || { error: 'Ошибка получения событий' };
    }
  },

  // Получить событие по ID
  getEventById: async (eventId) => {
    try {
      console.log('🔍 Получение события:', eventId);
      const response = await api.get(`/events/${eventId}`);
      console.log('✅ Событие получено:', response.data.event.name);
      return response.data.event;
    } catch (error) {
      console.error('❌ Ошибка получения события:', error);
      throw error.response?.data || { error: 'Ошибка получения события' };
    }
  },

  // Создать событие (admin)
  createEvent: async (eventData) => {
    try {
      console.log('➕ Создание события:', eventData.name);
      const response = await api.post('/events', eventData);
      console.log('✅ Событие создано');
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка создания события:', error);
      throw error.response?.data || { error: 'Ошибка создания события' };
    }
  },
};

export default eventService;
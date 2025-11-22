import api from './api';

const messageService = {
  // Получить сообщения события
  getEventMessages: async (eventId, limit = 50) => {
    try {
      console.log('💬 Получение сообщений события:', eventId);
      const response = await api.get(`/messages/${eventId}?limit=${limit}`);
      console.log('✅ Сообщения получены:', response.data.messages.length);
      return response.data.messages;
    } catch (error) {
      console.error('❌ Ошибка получения сообщений:', error);
      throw error.response?.data || { error: 'Ошибка получения сообщений' };
    }
  },

  // Отправить сообщение
  sendMessage: async (messageData) => {
    try {
      console.log('📤 Отправка сообщения:', messageData.content);
      const response = await api.post('/messages', messageData);
      console.log('✅ Сообщение отправлено');
      return response.data.data;
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      throw error.response?.data || { error: 'Ошибка отправки сообщения' };
    }
  },

  // Отметить как прочитанное
  markAsRead: async (messageId) => {
    try {
      await api.patch(`/messages/${messageId}/read`);
      console.log('✅ Сообщение отмечено как прочитанное');
    } catch (error) {
      console.error('❌ Ошибка отметки прочитанного:', error);
    }
  },

  // Получить количество непрочитанных
  getUnreadCount: async (userId) => {
    try {
      const response = await api.get(`/messages/unread/${userId}`);
      return response.data.unread_count;
    } catch (error) {
      console.error('❌ Ошибка получения непрочитанных:', error);
      return 0;
    }
  },
};

export default messageService;
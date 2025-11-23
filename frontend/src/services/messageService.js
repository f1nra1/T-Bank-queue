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

  // === ПОДДЕРЖКА (Пользователь <-> Админ) ===

  // Получить сообщения поддержки для пользователя
  getSupportMessages: async (userId) => {
    try {
      console.log('💬 Получение сообщений поддержки для пользователя:', userId);
      const response = await api.get(`/support/messages/${userId}`);
      console.log('✅ Сообщения поддержки получены:', response.data.messages.length);
      return response.data.messages;
    } catch (error) {
      console.error('❌ Ошибка получения сообщений поддержки:', error);
      throw error.response?.data || { error: 'Ошибка получения сообщений' };
    }
  },

  // Отправить сообщение в поддержку (от пользователя)
  sendSupportMessage: async (messageData) => {
    try {
      console.log('📤 Отправка сообщения в поддержку:', messageData.content);
      const response = await api.post('/support/messages', messageData);
      console.log('✅ Сообщение в поддержку отправлено');
      return response.data.data;
    } catch (error) {
      console.error('❌ Ошибка отправки в поддержку:', error);
      throw error.response?.data || { error: 'Ошибка отправки сообщения' };
    }
  },

  // Отправить сообщение от админа пользователю
  sendSupportMessageAsAdmin: async (messageData) => {
    try {
      console.log('📤 Отправка ответа от админа:', messageData);
      const response = await api.post('/support/admin/reply', messageData);
      console.log('✅ Ответ админа отправлен');
      return response.data.data;
    } catch (error) {
      console.error('❌ Ошибка отправки ответа:', error);
      throw error.response?.data || { error: 'Ошибка отправки ответа' };
    }
  },

  // Получить все разговоры (для админа)
  getAllSupportConversations: async () => {
    try {
      console.log('💬 Получение всех разговоров поддержки');
      const response = await api.get('/support/conversations');
      console.log('✅ Разговоры получены:', response.data.conversations.length);
      return response.data.conversations;
    } catch (error) {
      console.error('❌ Ошибка получения разговоров:', error);
      throw error.response?.data || { error: 'Ошибка получения разговоров' };
    }
  },

  // Получить количество непрочитанных сообщений поддержки
  getUnreadSupportCount: async (userId) => {
    try {
      const response = await api.get(`/support/unread/${userId}`);
      return response.data.unread_count;
    } catch (error) {
      console.error('❌ Ошибка получения непрочитанных поддержки:', error);
      return 0;
    }
  },

  // Отметить сообщения поддержки как прочитанные
  markSupportMessagesAsRead: async (userId) => {
    try {
      await api.patch(`/support/messages/${userId}/read`);
      console.log('✅ Сообщения отмечены как прочитанные');
    } catch (error) {
      console.error('❌ Ошибка отметки прочитанного:', error);
    }
  },
};

export default messageService;
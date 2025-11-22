import api from './api';

const authService = {
  // Регистрация
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Сохраняем токен и пользователя
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      console.log('✅ Регистрация успешна:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
      throw error.response?.data || { error: 'Ошибка регистрации' };
    }
  },

  // Вход
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Сохраняем токен и пользователя
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      console.log('✅ Вход успешен:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      throw error.response?.data || { error: 'Ошибка входа' };
    }
  },

  // Выход
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Выход выполнен');
  },

  // Получить текущего пользователя
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Ошибка получения пользователя:', error);
      return null;
    }
  },

  // Проверка авторизации
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Получить токен
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
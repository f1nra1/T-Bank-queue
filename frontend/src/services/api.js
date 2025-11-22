import axios from 'axios';

// ЖЕСТКО ПРОПИСЫВАЕМ URL
const API_URL = 'http://localhost:5001/api';

console.log('🔧 API URL:', API_URL);

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    console.log('📤 Запрос:', config.method?.toUpperCase(), config.baseURL + config.url, config.data);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => {
    console.log('✅ Ответ:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Ошибка ответа:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
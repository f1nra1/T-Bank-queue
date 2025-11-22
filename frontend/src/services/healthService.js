import axios from 'axios';

// ЖЕСТКО ПРОПИСЫВАЕМ URL
const BACKEND_URL = 'http://localhost:5001';

const healthService = {
  // Проверка здоровья сервера
  checkHealth: async () => {
    try {
      console.log('🔍 Проверяем health endpoint:', `${BACKEND_URL}/api/health`);
      const response = await axios.get(`${BACKEND_URL}/api/health`);
      console.log('✅ Health response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return null;
    }
  },

  // Проверка основного endpoint
  checkRoot: async () => {
    try {
      console.log('🔍 Проверяем root endpoint:', BACKEND_URL);
      const response = await axios.get(BACKEND_URL);
      console.log('✅ Root response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Root check failed:', error.message);
      return null;
    }
  },
};

export default healthService;
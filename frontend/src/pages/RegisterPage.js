import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Очищаем ошибку при вводе
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают!');
      return;
    }

    // Проверка длины пароля
    if (formData.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      // Отправляем данные без confirmPassword
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authService.register(dataToSend);
      
      console.log('✅ Регистрация успешна:', response);
      
      // Перенаправляем на главную после успешной регистрации
      alert('Регистрация успешна! Вы автоматически вошли в систему.');
      navigate('/');
    } catch (err) {
      console.error('❌ Ошибка регистрации:', err);
      setError(err.error || err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h1 style={styles.title}>📝 Регистрация</h1>
        
        {error && (
          <div style={styles.error}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Имя:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Иван Иванов"
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Телефон:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              placeholder="+7 (999) 123-45-67"
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Минимум 6 символов"
              required
              minLength="6"
              disabled={loading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Подтвердите пароль:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Повторите пароль"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? '⏳ Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/login" style={styles.link}>
            Уже есть аккаунт? Войти
          </Link>
          <Link to="/" style={styles.link}>
            ← Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#282c34',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  formBox: {
    backgroundColor: '#1e2127',
    padding: '40px',
    borderRadius: '15px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  title: {
    color: '#61dafb',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '2rem',
  },
  error: {
    backgroundColor: '#ff4444',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '500',
  },
  input: {
    padding: '12px 15px',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid #3a3f4b',
    backgroundColor: '#282c34',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    padding: '15px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.2s',
  },
  links: {
    marginTop: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'center',
  },
  link: {
    color: '#61dafb',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.3s',
  },
};

export default RegisterPage;
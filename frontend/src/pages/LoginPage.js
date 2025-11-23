import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button';
import './LoginPage.css';

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData);
      navigate('/events');
    } catch (err) {
      setError(err.error || err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Navigation */}
      <nav className="login-nav">
        <div className="login-nav-content">
          <Link to="/" className="login-logo">
            <span className="login-logo-text">T-Bank Queue</span>
          </Link>
          <div className="login-nav-links">
            <Link to="/events" className="login-nav-link">Мероприятия</Link>
            <Link to="/register" className="login-nav-link">Регистрация</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-form-container">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">Вход</h1>
            <p className="login-subtitle">
              Войдите в аккаунт, чтобы управлять очередями
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error-box">
              <svg className="login-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="login-input-group">
              <label className="login-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="login-input"
                placeholder="ivan@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="login-input-group">
              <label className="login-label">Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="login-input"
                placeholder="Введите пароль"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="login-footer">
            <p className="login-footer-text">
              Нет аккаунта?{' '}
              <Link to="/register" className="login-footer-link">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        {/* Side Info */}
        <div className="login-side-info">
          <div className="login-info-card">
            <div className="login-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <h3 className="login-info-title">Быстрый вход</h3>
            <p className="login-info-text">
              Войдите в систему за несколько секунд и начните пользоваться всеми возможностями.
            </p>
          </div>

          <div className="login-info-card">
            <div className="login-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            </div>
            <h3 className="login-info-title">Real-time обновления</h3>
            <p className="login-info-text">
              Следите за позицией в очереди в режиме реального времени через WebSocket.
            </p>
          </div>

          <div className="login-info-card">
            <div className="login-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3 className="login-info-title">Общайтесь в чате</h3>
            <p className="login-info-text">
              Обменивайтесь сообщениями с другими участниками прямо в приложении.
            </p>
          </div>

          <div className="login-demo-note">
            <p className="login-demo-text">
              <strong>Демо-данные для входа:</strong>
              <br />
              Email: demo@example.com
              <br />
              Пароль: demo123
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
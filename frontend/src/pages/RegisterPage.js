import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button';
import './RegisterPage.css';

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
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await authService.register(dataToSend);
      navigate('/events');
    } catch (err) {
      setError(err.error || err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const length = formData.password.length;
    if (length === 0) return null;
    if (length < 6) return { label: 'Слабый', color: '#F44336', width: '33%' };
    if (length < 10) return { label: 'Средний', color: '#FF9800', width: '66%' };
    return { label: 'Сильный', color: '#4CAF50', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="register-container">
      {/* Navigation */}
      <nav className="register-nav">
        <div className="register-nav-content">
          <Link to="/" className="register-logo">
            <span className="register-logo-text">T-Bank Queue</span>
          </Link>
          <div className="register-nav-links">
            <Link to="/events" className="register-nav-link">Мероприятия</Link>
            <Link to="/login" className="register-nav-link">Войти</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="register-main">
        <div className="register-form-container">
          {/* Header */}
          <div className="register-header">
            <h1 className="register-title">Регистрация</h1>
            <p className="register-subtitle">
              Создайте аккаунт, чтобы управлять очередями
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="register-error-box">
              <svg className="register-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Name */}
            <div className="register-input-group">
              <label className="register-label">Имя</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="register-input"
                placeholder="Иван Иванов"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="register-input-group">
              <label className="register-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="register-input"
                placeholder="ivan@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="register-input-group">
              <label className="register-label">Телефон (необязательно)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="register-input"
                placeholder="+7 (999) 123-45-67"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="register-input-group">
              <label className="register-label">Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="register-input"
                placeholder="Минимум 6 символов"
                required
                minLength="6"
                disabled={loading}
              />
              {strength && (
                <div className="register-strength-container">
                  <div className="register-strength-bar">
                    <div 
                      className="register-strength-fill"
                      style={{
                        width: strength.width,
                        backgroundColor: strength.color,
                      }}
                    ></div>
                  </div>
                  <span 
                    className="register-strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="register-input-group">
              <label className="register-label">Подтвердите пароль</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="register-input"
                placeholder="Повторите пароль"
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
              {loading ? 'Регистрация...' : 'Создать аккаунт'}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="register-footer">
            <p className="register-footer-text">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="register-footer-link">
                Войти
              </Link>
            </p>
          </div>
        </div>

        {/* Side Info */}
        <div className="register-side-info">
          <div className="register-info-card">
            <div className="register-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="register-info-title">Быстрая регистрация</h3>
            <p className="register-info-text">
              Займёт всего 30 секунд. Никаких сложных форм.
            </p>
          </div>

          <div className="register-info-card">
            <div className="register-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h3 className="register-info-title">Безопасность данных</h3>
            <p className="register-info-text">
              Все данные защищены и не передаются третьим лицам.
            </p>
          </div>

          <div className="register-info-card">
            <div className="register-info-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h3 className="register-info-title">Сразу в работу</h3>
            <p className="register-info-text">
              После регистрации можете сразу встать в очередь.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button';

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

    // Валидация
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
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <Link to="/" style={styles.logo}>
            <span style={styles.logoText}>T-Bank Queue</span>
          </Link>
          <div style={styles.navLinks}>
            <Link to="/events" style={styles.navLink}>Мероприятия</Link>
            <Link to="/login" style={styles.navLink}>Войти</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.formContainer}>
          {/* Header */}
          <div style={styles.header}>
            <h1 style={styles.title}>Регистрация</h1>
            <p style={styles.subtitle}>
              Создайте аккаунт, чтобы управлять очередями
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Name */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Имя</label>
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

            {/* Email */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                placeholder="ivan@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Телефон (необязательно)</label>
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

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Пароль</label>
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
              {strength && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBar}>
                    <div style={{
                      ...styles.strengthFill,
                      width: strength.width,
                      backgroundColor: strength.color,
                    }}></div>
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Подтвердите пароль</label>
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
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Уже есть аккаунт?{' '}
              <Link to="/login" style={styles.footerLink}>
                Войти
              </Link>
            </p>
          </div>
        </div>

        {/* Side Info */}
        <div style={styles.sideInfo}>
          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>✨</div>
            <h3 style={styles.infoTitle}>Быстрая регистрация</h3>
            <p style={styles.infoText}>
              Займёт всего 30 секунд. Никаких сложных форм.
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🔒</div>
            <h3 style={styles.infoTitle}>Безопасность данных</h3>
            <p style={styles.infoText}>
              Все данные защищены и не передаются третьим лицам.
            </p>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoIcon}>🎯</div>
            <h3 style={styles.infoTitle}>Сразу в работу</h3>
            <p style={styles.infoText}>
              После регистрации можете сразу встать в очередь.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
    fontFamily: '"Inter", sans-serif',
  },

  // Navigation
  nav: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E0E0E0',
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    textDecoration: 'none',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#191919',
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    gap: '30px',
  },
  navLink: {
    color: '#191919',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.3s ease',
  },

  // Main
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 40px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'start',
  },

  // Form Container
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    padding: '50px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
  },

  // Header
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#191919',
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666666',
    lineHeight: '1.5',
  },

  // Error
  errorBox: {
  backgroundColor: '#FFF3F3',
  border: '3px solid #F44336', // Изменили с 1px на 3px
  borderRadius: '30px', // Увеличили закругление
  padding: '16px',
  marginBottom: '30px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#C62828',
  fontSize: '0.95rem',
},
  errorIcon: {
    fontSize: '1.2rem',
  },

  // Form
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#191919',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '1rem',
    color: '#191919',
    backgroundColor: '#F5F5F5',
    border: '2px solid #E0E0E0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },

  // Password Strength
  strengthContainer: {
    marginTop: '8px',
  },
  strengthBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#E0E0E0',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  strengthFill: {
    height: '100%',
    transition: 'width 0.3s ease',
    borderRadius: '2px',
  },
  strengthLabel: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },

  // Footer
  footer: {
    marginTop: '30px',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.95rem',
    color: '#666666',
  },
  footerLink: {
    color: '#191919',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: '2px solid #FFDD2D',
    transition: 'border-color 0.3s ease',
  },

  // Side Info
  sideInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: '24px', // Увеличили закругление
  padding: '30px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  border: '1px solid #E0E0E0', // Добавили легкую границу
},
  infoIcon: {
    fontSize: '2.5rem',
    marginBottom: '16px',
  },
  infoTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '12px',
  },
  infoText: {
    fontSize: '1rem',
    color: '#666666',
    lineHeight: '1.6',
  },
};

export default RegisterPage;
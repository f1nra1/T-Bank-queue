import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { colors, commonStyles } from '../styles/theme';

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
      setError('Пароли не совпадают!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;
      const response = await authService.register(dataToSend);
      
      console.log('✅ Регистрация успешна:', response);
      navigate('/events');
    } catch (err) {
      console.error('❌ Ошибка регистрации:', err);
      setError(err.error || err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const length = formData.password.length;
    if (length === 0) return null;
    if (length < 6) return { text: 'Слабый', color: colors.error.main };
    if (length < 10) return { text: 'Средний', color: colors.warning.main };
    return { text: 'Сильный', color: colors.success.main };
  };

  const strength = passwordStrength();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo/Brand */}
        <div style={styles.brand}>
          <div style={styles.logo}>📝</div>
          <h1 style={styles.title}>Регистрация</h1>
          <p style={styles.subtitle}>Создайте аккаунт для управления очередями</p>
        </div>

        {/* Register Form */}
        <Card style={styles.formCard}>
          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Name Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>👤</span>
                Имя
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={commonStyles.input}
                placeholder="Иван Иванов"
                required
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.divider;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📧</span>
                Email адрес
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={commonStyles.input}
                placeholder="your@email.com"
                required
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.divider;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Phone Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📱</span>
                Телефон (необязательно)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={commonStyles.input}
                placeholder="+7 (999) 123-45-67"
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.divider;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔒</span>
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={commonStyles.input}
                placeholder="Минимум 6 символов"
                required
                minLength="6"
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.divider;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {strength && (
                <div style={styles.strengthIndicator}>
                  <div style={{
                    ...styles.strengthBar,
                    width: strength.text === 'Слабый' ? '33%' : strength.text === 'Средний' ? '66%' : '100%',
                    backgroundColor: strength.color,
                  }} />
                  <span style={{ ...styles.strengthText, color: strength.color }}>
                    {strength.text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🔐</span>
                Подтвердите пароль
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={commonStyles.input}
                placeholder="Повторите пароль"
                required
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = colors.primary.main;
                  e.target.style.boxShadow = `0 0 0 3px ${colors.primary.main}22`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = colors.divider;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="secondary"
              fullWidth
              disabled={loading}
              size="large"
              icon={loading ? '⏳' : '🚀'}
            >
              {loading ? 'Регистрация...' : 'Создать аккаунт'}
            </Button>
          </form>

          {/* Links */}
          <div style={styles.links}>
            <div style={styles.divider}>
              <span style={styles.dividerText}>или</span>
            </div>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth icon="🔐">
                Уже есть аккаунт? Войти
              </Button>
            </Link>
          </div>
        </Card>

        {/* Back to Home */}
        <div style={styles.footer}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="ghost" icon="←">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    ...commonStyles.container,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  content: {
    width: '100%',
    maxWidth: '500px',
    animation: 'fadeIn 0.6s ease-out',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logo: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: colors.secondary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: colors.text.secondary,
  },
  formCard: {
    padding: '40px',
  },
  errorAlert: {
    backgroundColor: `${colors.error.main}22`,
    border: `2px solid ${colors.error.main}`,
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: colors.error.light,
    fontSize: '1rem',
  },
  errorIcon: {
    fontSize: '1.3rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '1rem',
    fontWeight: '500',
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  labelIcon: {
    fontSize: '1.2rem',
  },
  strengthIndicator: {
    marginTop: '8px',
  },
  strengthBar: {
    height: '4px',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
    marginBottom: '5px',
  },
  strengthText: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  links: {
    marginTop: '30px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '25px 0',
  },
  dividerText: {
    flex: 1,
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: '0.9rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
  },
};

export default RegisterPage;
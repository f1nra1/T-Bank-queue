import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { colors, commonStyles } from '../styles/theme';

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
      const response = await authService.login(formData);
      console.log('✅ Вход успешен:', response);
      navigate('/events');
    } catch (err) {
      console.error('❌ Ошибка входа:', err);
      setError(err.error || err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo/Brand */}
        <div style={styles.brand}>
          <div style={styles.logo}>🔐</div>
          <h1 style={styles.title}>Вход в систему</h1>
          <p style={styles.subtitle}>Войдите, чтобы управлять очередями</p>
        </div>

        {/* Login Form */}
        <Card style={styles.formCard}>
          {error && (
            <div style={styles.errorAlert}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
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
                style={{
                  ...commonStyles.input,
                  ...(error ? styles.inputError : {}),
                }}
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
                style={{
                  ...commonStyles.input,
                  ...(error ? styles.inputError : {}),
                }}
                placeholder="Введите пароль"
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
              variant="primary"
              fullWidth
              disabled={loading}
              size="large"
              icon={loading ? '⏳' : '🚀'}
            >
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {/* Links */}
          <div style={styles.links}>
            <div style={styles.divider}>
              <span style={styles.dividerText}>или</span>
            </div>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="outline" fullWidth icon="📝">
                Создать аккаунт
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
    maxWidth: '450px',
    animation: 'fadeIn 0.6s ease-out',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logo: {
    fontSize: '4rem',
    marginBottom: '20px',
    animation: 'bounce 2s infinite',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: colors.primary.gradient,
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
    gap: '25px',
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
  inputError: {
    borderColor: colors.error.main,
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
    position: 'relative',
    '::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      backgroundColor: colors.divider,
    },
  },
  footer: {
    textAlign: 'center',
    marginTop: '30px',
  },
};

export default LoginPage;
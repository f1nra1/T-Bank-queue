import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import healthService from '../services/healthService';

function HomePage() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    setLoading(true);
    const health = await healthService.checkHealth();
    const root = await healthService.checkRoot();
    
    setBackendStatus({
      health,
      root,
      isConnected: !!(health && root),
    });
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎯 Система управления очередью</h1>
        <h2 style={styles.subtitle}>Т-Банк Хакатон - НГТУ</h2>
        
        <div style={styles.statusBox}>
          <h3 style={styles.statusTitle}>✅ Статус проекта:</h3>
          <p style={styles.statusItem}>✔️ Docker контейнеры запущены</p>
          <p style={styles.statusItem}>✔️ React приложение работает</p>
          <p style={styles.statusItem}>✔️ React Router настроен</p>
          <p style={styles.statusItem}>
            {loading ? '⏳ Проверка Backend...' : 
             backendStatus?.isConnected ? '✔️ Backend API подключен' : '❌ Backend не отвечает'}
          </p>
          
          {backendStatus?.isConnected && (
            <div style={styles.apiInfo}>
              <p style={styles.apiText}>
                📡 API: {backendStatus.root?.message}
              </p>
              <p style={styles.apiText}>
                🏥 Health: {backendStatus.health?.status}
              </p>
            </div>
          )}
        </div>

        <div style={styles.buttonContainer}>
          <Link to="/login" style={styles.button}>
            🔐 Войти
          </Link>
          <Link to="/register" style={styles.buttonSecondary}>
            📝 Регистрация
          </Link>
        </div>

        <button onClick={checkBackend} style={styles.refreshButton}>
          🔄 Проверить подключение
        </button>
      </header>
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
  },
  header: {
    textAlign: 'center',
    padding: '40px 20px',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#61dafb',
    marginBottom: '40px',
  },
  statusBox: {
    marginTop: '40px',
    textAlign: 'left',
    backgroundColor: '#1e2127',
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '600px',
    margin: '40px auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  statusTitle: {
    color: '#61dafb',
    marginBottom: '20px',
    fontSize: '1.3rem',
  },
  statusItem: {
    margin: '12px 0',
    fontSize: '1.1rem',
    lineHeight: '1.6',
  },
  apiInfo: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #3a3f4b',
  },
  apiText: {
    margin: '8px 0',
    fontSize: '0.95rem',
    color: '#a0a0a0',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '40px',
    flexWrap: 'wrap',
  },
  button: {
    padding: '15px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
  buttonSecondary: {
    padding: '15px 40px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
  refreshButton: {
    padding: '12px 30px',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: 'white',
    background: '#3a3f4b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'background 0.3s',
  },
};

export default HomePage;
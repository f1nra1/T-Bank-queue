import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { colors } from '../styles/theme';


function HomePage() {
  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>⚡</span>
            <span style={styles.logoText}>QueueFlow</span>
          </div>
          <div style={styles.navLinks}>
            <Link to="/events" style={styles.navLink}>События</Link>
            <Link to="/login" style={styles.navLink}>Войти</Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="small">Регистрация</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Электронная очередь для мероприятий
          </h1>
          <p style={styles.heroSubtitle}>
            Встаньте в очередь онлайн. Экономьте время. 
            Получайте уведомления в режиме реального времени.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/events" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="large">
                Смотреть события
              </Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="large">
                Начать бесплатно
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.featuresContent}>
          <h2 style={styles.featuresTitle}>Всё что нужно для управления очередями</h2>
          
          <div style={styles.featuresList}>
            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>🔄</div>
              <div style={styles.featureText}>
                <h3 style={styles.featureTitle}>Real-time обновления</h3>
                <p style={styles.featureDescription}>
                  Мгновенное обновление позиции через WebSocket
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>💬</div>
              <div style={styles.featureText}>
                <h3 style={styles.featureTitle}>Встроенный чат</h3>
                <p style={styles.featureDescription}>
                  Общайтесь с участниками события в реальном времени
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>⏸️</div>
              <div style={styles.featureText}>
                <h3 style={styles.featureTitle}>Умная пауза</h3>
                <p style={styles.featureDescription}>
                  Временно покиньте очередь без потери места
                </p>
              </div>
            </div>

            <div style={styles.featureItem}>
              <div style={styles.featureIcon}>📊</div>
              <div style={styles.featureText}>
                <h3 style={styles.featureTitle}>Точный расчёт времени</h3>
                <p style={styles.featureDescription}>
                  Автоматический подсчёт времени ожидания
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howItWorks}>
        <div style={styles.howItWorksContent}>
          <h2 style={styles.howItWorksTitle}>Как это работает</h2>
          
          <div style={styles.steps}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <h3 style={styles.stepTitle}>Зарегистрируйтесь</h3>
              <p style={styles.stepDescription}>
                Создайте бесплатный аккаунт за 30 секунд
              </p>
            </div>

            <div style={styles.stepArrow}>→</div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <h3 style={styles.stepTitle}>Выберите событие</h3>
              <p style={styles.stepDescription}>
                Найдите интересующее мероприятие
              </p>
            </div>

            <div style={styles.stepArrow}>→</div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <h3 style={styles.stepTitle}>Встаньте в очередь</h3>
              <p style={styles.stepDescription}>
                Займите место одним кликом
              </p>
            </div>

            <div style={styles.stepArrow}>→</div>

            <div style={styles.step}>
              <div style={styles.stepNumber}>4</div>
              <h3 style={styles.stepTitle}>Получите уведомление</h3>
              <p style={styles.stepDescription}>
                Узнайте, когда подойдёт очередь
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.cta}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Готовы начать?</h2>
          <p style={styles.ctaSubtitle}>
            Присоединяйтесь к тысячам пользователей, которые экономят время
          </p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="large">
              Зарегистрироваться бесплатно
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <div style={styles.footerLogo}>
              <span style={styles.footerLogoIcon}>⚡</span>
              <span style={styles.footerLogoText}>QueueFlow</span>
            </div>
            <p style={styles.footerTagline}>
              Электронная очередь нового поколения
            </p>
          </div>
          <div style={styles.footerRight}>
            <Link to="/events" style={styles.footerLink}>События</Link>
            <Link to="/login" style={styles.footerLink}>Войти</Link>
            <Link to="/register" style={styles.footerLink}>Регистрация</Link>
            <Link to="/admin" style={styles.footerLink}>Админка</Link>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p style={styles.copyright}>
            © 2025 QueueFlow. Создано для хакатона Т-Банк × НГТУ
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    color: '#191919',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  // Navigation
  nav: {
    borderBottom: '1px solid #E0E0E0',
    position: 'sticky',
    top: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
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
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#191919',
  },
  logoIcon: {
    fontSize: '2rem',
  },
  logoText: {
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  navLink: {
    color: '#191919',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.3s',
  },
  
  // Hero
  hero: {
    padding: '120px 40px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  heroContent: {
    maxWidth: '800px',
  },
  heroTitle: {
    fontSize: '5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '30px',
    color: '#191919',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    lineHeight: '1.6',
    color: '#666666',
    marginBottom: '50px',
    maxWidth: '600px',
  },
  heroButtons: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  
  // Features
  features: {
    padding: '100px 40px',
    backgroundColor: '#F9F9F9',
  },
  featuresContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  featuresTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '60px',
    color: '#191919',
    letterSpacing: '-0.02em',
  },
  featuresList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
  },
  featureItem: {
    display: 'flex',
    gap: '20px',
  },
  featureIcon: {
    fontSize: '3rem',
    flexShrink: 0,
  },
  featureText: {},
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#191919',
  },
  featureDescription: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#666666',
  },
  
  // How it works
  howItWorks: {
    padding: '100px 40px',
  },
  howItWorksContent: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  howItWorksTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '60px',
    color: '#191919',
    letterSpacing: '-0.02em',
  },
  steps: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  step: {
    flex: '1',
    minWidth: '200px',
    maxWidth: '250px',
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#FFDD2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#191919',
  },
  stepArrow: {
    fontSize: '2rem',
    color: '#FFDD2D',
    marginTop: '15px',
  },
  stepTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#191919',
  },
  stepDescription: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#666666',
  },
  
  // CTA
  cta: {
    padding: '100px 40px',
    backgroundColor: '#191919',
  },
  ctaContent: {
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '3.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
  },
  ctaSubtitle: {
    fontSize: '1.3rem',
    lineHeight: '1.6',
    color: '#B0B0B0',
    marginBottom: '40px',
  },
  
  // Footer
  footer: {
    borderTop: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '60px 40px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '40px',
  },
  footerLeft: {
    maxWidth: '400px',
  },
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '15px',
    color: '#191919',
  },
  footerLogoIcon: {
    fontSize: '2rem',
  },
  footerLogoText: {
    letterSpacing: '-0.02em',
  },
  footerTagline: {
    fontSize: '1rem',
    color: '#666666',
    lineHeight: '1.6',
  },
  footerRight: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
  },
  footerLink: {
    color: '#666666',
    textDecoration: 'none',
    fontSize: '1rem',
    transition: 'color 0.3s',
  },
  footerBottom: {
    borderTop: '1px solid #E0E0E0',
    padding: '30px 40px',
  },
  copyright: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#999999',
    maxWidth: '1400px',
    margin: '0 auto',
  },
};

export default HomePage;
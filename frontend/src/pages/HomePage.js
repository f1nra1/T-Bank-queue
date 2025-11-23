import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const [theme, setTheme] = useState('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bankcardRef = useRef(null);
  const bankcardInnerRef = useRef(null);

  // Инициализация темы
  useEffect(() => {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const savedTheme = localStorage.getItem('tbank-theme') || (prefersLight ? 'light' : 'dark');
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  // Применение темы
  const applyTheme = (themeName) => {
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.setAttribute('data-theme', themeName);
    
    // Устанавливаем цвет фона напрямую
    if (themeName === 'light') {
      document.body.style.backgroundColor = '#ffffff';
      document.documentElement.style.backgroundColor = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#0B0F17';
      document.documentElement.style.backgroundColor = '#0B0F17';
    }
  };

  // 3D анимация карты
  useEffect(() => {
    const inner = bankcardInnerRef.current;
    const card = bankcardRef.current;
    if (!inner || !card) return;

    const MIN = 0;
    const MAX = 180;
    const SNAP_THRESHOLD = 90;
    const lerpK = 0.12;

    let target = 0;
    let angle = 0;
    const dragSpeed = 0.22;
    const wheelSpeed = 0.18;

    let dragging = false;
    let lastX = 0;
    let animationId;

    const clamp = v => Math.min(MAX, Math.max(MIN, v));

    function apply() {
      inner.style.transform = `rotateY(${angle}deg)`;
      card.dataset.side = (angle >= SNAP_THRESHOLD) ? 'back' : 'front';
    }

    function tick() {
      angle += (target - angle) * lerpK;
      apply();
      animationId = requestAnimationFrame(tick);
    }

    const handlePointerDown = (e) => {
      dragging = true;
      lastX = e.clientX;
      card.classList.add('dragging');
      card.setPointerCapture?.(e.pointerId);
    };

    const handlePointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      target = clamp(target + dx * dragSpeed);
    };

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      card.classList.remove('dragging');
      card.releasePointerCapture?.(e.pointerId);
      target = (angle >= SNAP_THRESHOLD) ? MAX : MIN;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      target = clamp(target + delta * wheelSpeed);
    };

    card.addEventListener('pointerdown', handlePointerDown);
    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    card.addEventListener('mouseleave', () => { dragging = false; });
    card.addEventListener('wheel', handleWheel, { passive: false });

    apply();
    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
      card.removeEventListener('pointerdown', handlePointerDown);
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerup', endDrag);
      card.removeEventListener('pointercancel', endDrag);
      card.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="homepage">
      <a href="#main" className="sr-only">Перейти к основному содержанию</a>

      {/* Header */}
      <header className="header" role="banner">
        <div className="container nav" aria-label="Основная навигация">
          <div className="nav__left">
            <Link to="/" className="logo" aria-label="T‑Bank — на главную">
              <span className="logo__mark" aria-hidden="true">T</span>
              <span>T‑Bank Queue</span>
            </Link>
            <nav className="menu" aria-label="Разделы сайта">
              <Link to="/events">Мероприятия</Link>
              <a href="#about">О нас</a>
            </nav>
          </div>
          <div className="nav__cta">
            <Link to="/login" className="btn outline">Войти</Link>
            <Link to="/register" className="btn">Регистрация</Link>
            <button 
              className="burger btn outline" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobileMenu"
            >
              Меню
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav id="mobileMenu" className="container">
            <div className="card" style={{padding: '12px', marginBottom: '12px'}}>
              <Link to="/events">Мероприятия</Link> ·
              <a href="#about">О нас</a> ·
              <Link to="/login">Войти</Link> ·
              <Link to="/register">Регистрация</Link>
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero" id="top">
        <div className="container hero__inner">
          <div>
            <div className="eyebrow">Мы уважаем наших клиентов.</div>
            <h1 className="h1">T‑Bank Queue — электронная очередь для мероприятий.</h1>
            <p className="lead">Каждый участник знает своё место в очереди, а организаторы — кто следующий.</p>
            <div className="hero__actions">
              <Link to="/events" className="btn">Смотреть мероприятия</Link>
            </div>
          </div>
          <div className="card shadow bankcard-wrap" aria-label="Визуализация карты T‑Bank" style={{padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div className="bankcard" ref={bankcardRef} aria-label="Банковская карта T‑Bank" data-side="front">
              <div className="bankcard__inner" ref={bankcardInnerRef}>
                {/* FRONT */}
                <div className="bankcard__face bankcard__front" aria-hidden="false">
                  <svg viewBox="0 0 856 540" width="100%" height="auto" role="img" aria-label="Лицевая сторона карты T‑Bank">
                    <defs>
                      <linearGradient id="bggrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0E1524"/>
                        <stop offset="100%" stopColor="#0B0F17"/>
                      </linearGradient>
                      <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E6D79B"/>
                        <stop offset="100%" stopColor="#B8923A"/>
                      </linearGradient>
                      <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,.18)"/>
                        <stop offset="60%" stopColor="rgba(255,255,255,0)"/>
                      </linearGradient>
                    </defs>
                    <rect x="6" y="6" width="844" height="528" rx="28" fill="url(#bggrad)"/>
                    <rect x="6" y="6" width="844" height="528" rx="28" fill="none" stroke="url(#gold)" strokeWidth="2"/>
                    <rect x="6" y="6" width="844" height="528" rx="28" fill="url(#sheen)" opacity="0.25"/>
                    {/* Logo coin */}
                    <g transform="translate(40,38)">
                      <rect width="76" height="76" rx="18" fill="url(#gold)" />
                      <text x="38" y="50" textAnchor="middle" fontFamily="Spectral,Georgia,serif" fontSize="38" fill="#0B0F17" fontWeight="800">T</text>
                    </g>
                    {/* Chip */}
                    <g transform="translate(40,160)" opacity="0.9">
                      <rect width="92" height="68" rx="10" fill="#1b2333" stroke="#2b3343"/>
                      <g stroke="#4b5466" strokeWidth="2">
                        <path d="M10 20H82"/>
                        <path d="M10 34H82"/>
                        <path d="M10 48H82"/>
                        <path d="M30 10V58"/>
                        <path d="M62 10V58"/>
                      </g>
                    </g>
                    {/* Number */}
                    <g transform="translate(40,300)" fill="#E6E9EE">
                      <text fontSize="34" fontFamily="Inter,system-ui" letterSpacing="4">•••• •••• •••• 8899</text>
                    </g>
                    {/* Holder */}
                    <g transform="translate(40,360)" fill="#9AA6B2">
                      <text fontSize="16" fontFamily="Inter,system-ui" opacity=".9">CARDHOLDER</text>
                      <text y="26" fontSize="20" fontFamily="Inter,system-ui" fill="#E6E9EE">PRIVATE CLIENT</text>
                    </g>
                    {/* Tier & brand */}
                    <g transform="translate(640,420)" textAnchor="end">
                      <text fontSize="18" fontFamily="Inter,system-ui" fill="#9AA6B2">T‑Bank •</text>
                      <text x="0" y="28" fontSize="20" fontFamily="Inter,system-ui" fill="url(#gold)">SOVEREIGN</text>
                    </g>
                  </svg>
                </div>
                {/* BACK */}
                <div className="bankcard__face bankcard__back" aria-hidden="true">
                  <svg viewBox="0 0 856 540" width="100%" height="auto" role="img" aria-label="Оборотная сторона карты T‑Bank">
                    <defs>
                      <linearGradient id="bggrad2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0E1524"/>
                        <stop offset="100%" stopColor="#0B0F17"/>
                      </linearGradient>
                      <linearGradient id="gold2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E6D79B"/>
                        <stop offset="100%" stopColor="#B8923A"/>
                      </linearGradient>
                    </defs>
                    <rect x="6" y="6" width="844" height="528" rx="28" fill="url(#bggrad2)"/>
                    <rect x="6" y="6" width="844" height="528" rx="28" fill="none" stroke="url(#gold2)" strokeWidth="2"/>
                    {/* Mag stripe */}
                    <rect x="30" y="80" width="796" height="72" rx="10" fill="#0b0f17" opacity=".9"/>
                    {/* Signature panel */}
                    <rect x="520" y="200" width="286" height="56" rx="8" fill="#e6e9ee" opacity=".9"/>
                    <text x="540" y="236" fontSize="20" fontFamily="Inter,system-ui" fill="#0B0F17">CVV •••</text>
                    {/* Info lines */}
                    <g transform="translate(40,300)" opacity=".8">
                      <rect width="600" height="14" rx="6" fill="#1b2333"/>
                      <rect y="28" width="560" height="14" rx="6" fill="#1b2333"/>
                      <rect y="56" width="520" height="14" rx="6" fill="#1b2333"/>
                    </g>
                  </svg>
                  <div className="bankcard__caption">Конфиденциальность в приоритете.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <div className="container about-wrap">
          <div className="section__head about-grid">
            <article className="about-card card" style={{padding: '24px'}}>
              <p className="about-lead" style={{fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px'}}>
                T-Bank — пространство роста и новых возможностей.
              </p>
              <p style={{color: 'var(--muted)', marginBottom: '12px'}}>
                Наши мероприятия создают условия для безопасного общения, расширения кругозора и получения практических навыков.
              </p>
              <p style={{color: 'var(--muted)'}}>
                Каждая активность помогает участникам развиваться, находить инсайты и укреплять уверенность в собственных решениях.
              </p>
            </article>

            <aside className="about-card about-legal card" style={{padding: '24px'}}>
              <h3 className="about-title" style={{marginBottom: '16px'}}>Официальная информация</h3>
              <ul className="about-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                <li style={{marginBottom: '8px'}}><strong>Формат:</strong> Образовательные и практические мероприятия.</li>
                <li style={{marginBottom: '8px'}}><strong>Цель:</strong> Развитие навыков и обмен опытом.</li>
                <li style={{marginBottom: '8px'}}><strong>Контроль качества:</strong> Программы регулярно обновляются.</li>
                <li style={{marginBottom: '8px'}}><strong>Поддержка:</strong> Участникам доступна консультационная помощь.</li>
                <li><strong>Данные:</strong> Используются только для организации участия.</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features">
        <div className="container">
          <div className="section__head">
            <div>
              <h2 className="section__title">Мероприятия от T‑Bank</h2>
              <p className="section__desc">Выберите активность, на которую можно записаться по электронной очереди.</p>
            </div>
          </div>

          <div className="grid features">
            <Link to="/events" className="card feature">
              <div className="feature__icon" aria-hidden="true">
                <svg className="fi" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 10h8"/></svg>
              </div>
              <div>
                <h3 className="feature__title">VR‑зона «Будущее Финтеха»</h3>
                <p>Иммерсивный опыт и демонстрация технологий T‑Bank.</p>
              </div>
            </Link>

            <Link to="/events" className="card feature">
              <div className="feature__icon" aria-hidden="true">
                <svg className="fi" viewBox="0 0 24 24"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>
              </div>
              <div>
                <h3 className="feature__title">Консультации по инвестициям</h3>
                <p>Эксперты банка отвечают на ваши вопросы.</p>
              </div>
            </Link>

            <Link to="/events" className="card feature">
              <div className="feature__icon" aria-hidden="true">
                <svg className="fi" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>
              </div>
              <div>
                <h3 className="feature__title">Зона «Искусственный интеллект»</h3>
                <p>Презентация алгоритмов T‑Bank и их применения.</p>
              </div>
            </Link>

            <Link to="/events" className="card feature">
              <div className="feature__icon" aria-hidden="true">
                <svg className="fi" viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 10h16"/></svg>
              </div>
              <div>
                <h3 className="feature__title">Оформление карт T‑Bank</h3>
                <p>Операторы оформят карту прямо на мероприятии.</p>
              </div>
            </Link>

            <Link to="/events" className="card feature">
              <div className="feature__icon" aria-hidden="true">
                <svg className="fi" viewBox="0 0 24 24"><path d="M5 20v-8l7-4 7 4v8"/><path d="M9 12v8"/></svg>
              </div>
              <div>
                <h3 className="feature__title">Питч‑сессия стартапов</h3>
                <p>Выступления команд и консультации инвесторов.</p>
              </div>
            </Link>

            <Link to="/events" className="card feature">
              <div className="feature__icon" aria-hidden="true">
                <svg className="fi" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </div>
              <div>
                <h3 className="feature__title">Игровая зона T‑Bank</h3>
                <p>Геймифицированные активности с призами.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="cta-section">
        <div className="container" style={{textAlign: 'center', padding: '60px 20px'}}>
          <h2 className="section__title">Готовы начать?</h2>
          <p className="section__desc" style={{maxWidth: '600px', margin: '0 auto 30px'}}>
            Зарегистрируйтесь бесплатно и встаньте в электронную очередь на любое мероприятие T‑Bank
          </p>
          <div style={{display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/register" className="btn">Зарегистрироваться</Link>
            <Link to="/events" className="btn outline">Смотреть мероприятия</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="legal" aria-labelledby="footerTitle">
        <div className="container footer">
          <h2 id="footerTitle" className="sr-only">Навигация и контакты T‑Bank</h2>
          <div className="footer__grid">
            <div className="footer__brand">
              <Link to="/" className="logo" aria-label="T‑Bank — на главную">
                <span className="logo__mark" aria-hidden="true">T</span>
                <span>T‑Bank Queue</span>
              </Link>
              <p className="footer__copy">© {currentYear} T‑Bank. Сервис для деловых клиентов.</p>
            </div>
            <nav className="footer__col" aria-label="Разделы">
              <div className="footer__title">Разделы</div>
              <ul className="footer__links">
                <li><Link to="/events">Мероприятия</Link></li>
                <li><a href="#about">О нас</a></li>
                <li><Link to="/my-queues">Мои очереди</Link></li>
              </ul>
            </nav>
            <nav className="footer__col" aria-label="Аккаунт">
              <div className="footer__title">Аккаунт</div>
              <ul className="footer__links">
                <li><Link to="/login">Войти</Link></li>
                <li><Link to="/register">Регистрация</Link></li>
                <li><Link to="/admin">Админ</Link></li>
              </ul>
            </nav>
            <nav className="footer__col" aria-label="Контакты">
              <div className="footer__title">Контакты</div>
              <ul className="footer__links">
                <li><a href="https://instagram.com/tbank" target="_blank" rel="noopener noreferrer">Instagram T‑Bank</a></li>
                <li><a href="mailto:support@tbank.ru">support@tbank.ru</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
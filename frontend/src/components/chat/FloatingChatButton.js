import React, { useState, useEffect } from 'react';
import SupportChat from './SupportChat';
import authService from '../../services/authService';
import messageService from '../../services/messageService';

function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // Не показываем кнопку на главной странице или если не авторизован
  const shouldShow = isAuthenticated && window.location.pathname !== '/';

  useEffect(() => {
    if (shouldShow && currentUser) {
      loadUnreadCount();
      // Обновляем счетчик каждые 5 секунд для быстрого отклика
      const interval = setInterval(loadUnreadCount, 5000);
      return () => clearInterval(interval);
    }
  }, [shouldShow, currentUser]);

  const loadUnreadCount = async () => {
    if (!currentUser) return;
    try {
      const count = await messageService.getUnreadSupportCount(currentUser.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Ошибка загрузки непрочитанных:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Сбрасываем счетчик при открытии
      setUnreadCount(0);
    }
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      {/* Плавающая кнопка */}
      <div
        style={{
          ...styles.floatingButton,
          backgroundColor: isOpen ? '#191919' : '#FFDD2D',
        }}
        onClick={handleToggle}
        title="Поддержка"
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {unreadCount > 0 && !isOpen && (
          <div style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</div>
        )}
        {isOpen ? (
          <svg style={{...styles.icon, color: '#FFDD2D'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg style={{...styles.icon, color: '#191919'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </div>

      {/* Окно чата */}
      {isOpen && (
        <div style={styles.chatWindow}>
          <SupportChat onClose={() => setIsOpen(false)} onMessageSent={loadUnreadCount} />
        </div>
      )}
    </>
  );
}

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 1000,
    border: 'none',
  },
  icon: {
    width: '28px',
    height: '28px',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#FF3B30',
    color: 'white',
    borderRadius: '12px',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: '700',
    minWidth: '22px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(255, 59, 48, 0.4)',
    border: '2px solid white',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '104px',
    right: '24px',
    width: '400px',
    height: '600px',
    borderRadius: '16px',
    overflow: 'hidden',
    zIndex: 999,
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default FloatingChatButton;
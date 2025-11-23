import React, { useState, useEffect, useRef } from 'react';
import messageService from '../../services/messageService';
import authService from '../../services/authService';
import useWebSocket from '../../hooks/useWebSocket';

function SupportChat({ onClose, onMessageSent }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const currentUser = authService.getCurrentUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadMessages();
    
    // Обновление каждые 3 секунды для быстрого получения новых сообщений
    const interval = setInterval(() => {
      loadMessages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket для real-time сообщений
  useWebSocket('new-support-message', (data) => {
    console.log('💬 Новое сообщение поддержки:', data);
    if (data.userId === currentUser.id || data.senderId === currentUser.id) {
      setMessages(prev => {
        // Проверяем, нет ли уже этого сообщения
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    }
  });

  const loadMessages = async () => {
    try {
      const data = await messageService.getSupportMessages(currentUser.id);
      setMessages(data);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      await messageService.sendSupportMessage({
        content: newMessage.trim(),
      });
      setNewMessage('');
      if (onMessageSent) onMessageSent();
      // Немедленно обновляем сообщения
      setTimeout(() => loadMessages(), 100);
    } catch (error) {
      alert(error.error || 'Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    return date.toLocaleString('ru-RU', { 
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>💬 Поддержка</h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>💬 Поддержка</h3>
          <p style={styles.subtitle}>Онлайн</p>
        </div>
        <button style={styles.closeButton} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyChat}>
            <div style={styles.emptyIcon}>👋</div>
            <p style={styles.emptyTitle}>Здравствуйте!</p>
            <p style={styles.emptyText}>Задайте нам вопрос, и мы вам поможем</p>
          </div>
        ) : (
          messages.map((message) => {
            // ИСПРАВЛЕНИЕ: используем is_admin_message вместо sender_id
            const isMyMessage = !message.is_admin_message; // Если НЕ от админа, значит мое
            
            return (
              <div
                key={message.id}
                style={{
                  ...styles.messageWrapper,
                  justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    ...styles.message,
                    ...(isMyMessage ? styles.myMessage : styles.adminMessage),
                  }}
                >
                  {!isMyMessage && (
                    <div style={styles.adminBadge}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                      Администратор
                    </div>
                  )}
                  <div style={styles.messageContent}>{message.content}</div>
                  <div style={styles.messageTime}>{formatTime(message.created_at)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Напишите сообщение..."
          style={styles.input}
          disabled={sending}
          autoFocus
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          style={{
            ...styles.sendButton,
            opacity: (sending || !newMessage.trim()) ? 0.4 : 1,
            cursor: (sending || !newMessage.trim()) ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? (
            <div style={styles.sendingSpinner}></div>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E5E5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  title: {
    color: '#191919',
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  subtitle: {
    color: '#00C853',
    fontSize: '0.8rem',
    fontWeight: '500',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#666666',
    cursor: 'pointer',
    padding: '8px',
    lineHeight: 0,
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #F0F0F0',
    borderTop: '4px solid #FFDD2D',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#666666',
    fontSize: '0.95rem',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#FAFAFA',
  },
  emptyChat: {
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '8px',
  },
  emptyTitle: {
    color: '#191919',
    fontSize: '1.2rem',
    fontWeight: '600',
    margin: 0,
  },
  emptyText: {
    color: '#666666',
    fontSize: '0.95rem',
    margin: 0,
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
    animation: 'fadeInUp 0.3s ease',
  },
  message: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '16px',
    wordWrap: 'break-word',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  myMessage: {
    backgroundColor: '#FFDD2D',
    color: '#191919',
    borderBottomRightRadius: '4px',
  },
  adminMessage: {
    backgroundColor: '#FFFFFF',
    color: '#191919',
    borderBottomLeftRadius: '4px',
    border: '1px solid #E5E5E5',
  },
  adminBadge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '6px',
    color: '#666666',
    display: 'flex',
    alignItems: 'center',
  },
  messageContent: {
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '6px',
    color: '#191919',
  },
  messageTime: {
    fontSize: '0.7rem',
    color: '#999999',
    textAlign: 'right',
  },
  inputContainer: {
    padding: '16px 24px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E5E5E5',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#F5F5F5',
    border: '2px solid transparent',
    borderRadius: '12px',
    color: '#191919',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  sendButton: {
    padding: '12px',
    backgroundColor: '#FFDD2D',
    border: 'none',
    borderRadius: '12px',
    color: '#191919',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    flexShrink: 0,
  },
  sendingSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(25, 25, 25, 0.2)',
    borderTop: '2px solid #191919',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default SupportChat;
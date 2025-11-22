import React, { useState, useEffect, useRef } from 'react';
import messageService from '../../services/messageService';
import authService from '../../services/authService';
import useWebSocket from '../../hooks/useWebSocket';

function ChatBox({ eventId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // Автопрокрутка вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Загрузка сообщений
  useEffect(() => {
    loadMessages();
  }, [eventId]);

  // Прокрутка при новых сообщениях
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket для real-time сообщений
  useWebSocket('new-message', (data) => {
    console.log('💬 Новое сообщение через WebSocket:', data);
    if (data.eventId === parseInt(eventId)) {
      setMessages(prev => [...prev, data.message]);
    }
  });

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await messageService.getEventMessages(eventId);
      setMessages(data);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Войдите в систему, чтобы отправлять сообщения');
      return;
    }

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      await messageService.sendMessage({
        sender_id: currentUser.id,
        event_id: parseInt(eventId),
        content: newMessage.trim(),
      });
      setNewMessage('');
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
    
    // Если сегодня - показываем только время
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // Иначе дата и время
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
        <div style={styles.loading}>⏳ Загрузка чата...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>💬 Чат события</h3>
        <span style={styles.count}>{messages.length} сообщений</span>
      </div>

      <div style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div style={styles.emptyChat}>
            <p>📭 Пока нет сообщений</p>
            <p style={styles.hint}>Будьте первым, кто напишет!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMyMessage = currentUser && message.sender_id === currentUser.id;
            
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
                    ...(isMyMessage ? styles.myMessage : styles.otherMessage),
                  }}
                >
                  {!isMyMessage && (
                    <div style={styles.senderName}>{message.sender_name}</div>
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
          placeholder={isAuthenticated ? "Напишите сообщение..." : "Войдите, чтобы писать"}
          style={styles.input}
          disabled={!isAuthenticated || sending}
        />
        <button
          type="submit"
          disabled={!isAuthenticated || sending || !newMessage.trim()}
          style={{
            ...styles.sendButton,
            opacity: (!isAuthenticated || sending || !newMessage.trim()) ? 0.5 : 1,
          }}
        >
          {sending ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#1e2127',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '500px',
  },
  header: {
    padding: '15px 20px',
    backgroundColor: '#282c34',
    borderBottom: '1px solid #3a3f4b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#61dafb',
    fontSize: '1.2rem',
    margin: 0,
  },
  count: {
    color: '#a0a0a0',
    fontSize: '0.9rem',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#61dafb',
    fontSize: '1.1rem',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyChat: {
    textAlign: 'center',
    color: '#a0a0a0',
    padding: '60px 20px',
  },
  hint: {
    fontSize: '0.9rem',
    marginTop: '10px',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  message: {
    maxWidth: '70%',
    padding: '10px 15px',
    borderRadius: '12px',
    wordWrap: 'break-word',
  },
  myMessage: {
    backgroundColor: '#667eea',
    color: 'white',
    borderBottomRightRadius: '4px',
  },
  otherMessage: {
    backgroundColor: '#3a3f4b',
    color: 'white',
    borderBottomLeftRadius: '4px',
  },
  senderName: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '5px',
    opacity: 0.8,
  },
  messageContent: {
    fontSize: '0.95rem',
    lineHeight: '1.4',
    marginBottom: '5px',
  },
  messageTime: {
    fontSize: '0.75rem',
    opacity: 0.6,
    textAlign: 'right',
  },
  inputContainer: {
    padding: '15px',
    backgroundColor: '#282c34',
    borderTop: '1px solid #3a3f4b',
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    backgroundColor: '#1e2127',
    border: '1px solid #3a3f4b',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default ChatBox;
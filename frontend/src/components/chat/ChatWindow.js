import React, { useState, useEffect, useRef } from 'react';
import messageService from '../../services/messageService';
import './ChatWindow.css';

function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Автообновление каждые 5 секунд
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await messageService.getMyMessages();
      setMessages(data);
      // Отметить как прочитанные
      await messageService.markAsRead();
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const sentMessage = await messageService.sendMessage(newMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      alert('Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-window-header-info">
          <svg className="chat-window-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <div>
            <h3 className="chat-window-title">Поддержка</h3>
            <p className="chat-window-subtitle">Обычно отвечаем в течение часа</p>
          </div>
        </div>
        <button className="chat-window-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-window-messages">
        {loading ? (
          <div className="chat-window-loading">
            <div className="chat-window-spinner"></div>
            <p>Загрузка...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-window-empty">
            <svg className="chat-window-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Нет сообщений</p>
            <span>Начните диалог с администратором</span>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.is_from_admin == 1 ? 'chat-message-admin' : 'chat-message-user'}`}
              >
                <div className="chat-message-content">
                  <div className="chat-message-text">{msg.message}</div>
                  <div className="chat-message-time">
                    {new Date(msg.created_at + 'Z').toLocaleString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form className="chat-window-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          className="chat-window-input"
          disabled={sending}
        />
        <button
          type="submit"
          className="chat-window-send-button"
          disabled={!newMessage.trim() || sending}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
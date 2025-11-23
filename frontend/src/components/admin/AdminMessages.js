import React, { useState, useEffect, useRef } from 'react';
import messageService from '../../services/messageService';
import './AdminMessages.css';

function AdminMessages() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    // Автообновление каждые 5 секунд
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.user_id);
      // Автообновление сообщений
      const interval = setInterval(() => loadMessages(selectedChat.user_id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await messageService.getAllChats();
      setChats(data);
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await messageService.getUserMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const sentMessage = await messageService.sendMessage(newMessage, selectedChat.user_id);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      // Обновить список чатов
      loadChats();
    } catch (err) {
      alert('Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-messages-loading">
        <div className="admin-messages-spinner"></div>
        <p>Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="admin-messages-container">
      {/* Sidebar - список чатов */}
      <div className="admin-messages-sidebar">
        <h3 className="admin-messages-sidebar-title">Чаты ({chats.length})</h3>
        {chats.length === 0 ? (
          <div className="admin-messages-empty">
            <svg className="admin-messages-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Нет сообщений</p>
          </div>
        ) : (
          <div className="admin-messages-chat-list">
            {chats.map((chat) => (
              <div
                key={chat.user_id}
                className={`admin-messages-chat-item ${selectedChat?.user_id === chat.user_id ? 'active' : ''}`}
                onClick={() => handleSelectChat(chat)}
              >
                <div className="admin-messages-chat-avatar">
                  {chat.user_name?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-messages-chat-info">
                  <div className="admin-messages-chat-header">
                    <span className="admin-messages-chat-name">{chat.user_name}</span>
                    {chat.unread_count > 0 && (
                      <span className="admin-messages-chat-unread">{chat.unread_count}</span>
                    )}
                  </div>
                  <p className="admin-messages-chat-last-message">
                    {chat.last_message?.substring(0, 40)}
                    {chat.last_message?.length > 40 ? '...' : ''}
                  </p>
                  <span className="admin-messages-chat-time">
                    {new Date(chat.last_message_time + 'Z').toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main - окно сообщений */}
      <div className="admin-messages-main">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="admin-messages-header">
              <div className="admin-messages-header-info">
                <div className="admin-messages-header-avatar">
                  {selectedChat.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="admin-messages-header-name">{selectedChat.user_name}</h3>
                  <p className="admin-messages-header-email">{selectedChat.user_email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="admin-messages-messages">
              {messages.length === 0 ? (
                <div className="admin-messages-no-messages">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p>Нет сообщений</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`admin-message ${msg.is_from_admin == 1 ? 'admin-message-sent' : 'admin-message-received'}`}
                    >
                      <div className="admin-message-content">
                        <div className="admin-message-text">{msg.message}</div>
                        <div className="admin-message-time">
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
            <form className="admin-messages-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                className="admin-messages-input"
                disabled={sending}
              />
              <button
                type="submit"
                className="admin-messages-send-button"
                disabled={!newMessage.trim() || sending}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="admin-messages-no-chat-selected">
            <svg className="admin-messages-no-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3>Выберите чат</h3>
            <p>Выберите пользователя из списка слева</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMessages;
import React, { useState, useEffect, useRef } from 'react';
import messageService from '../../services/messageService';
import useWebSocket from '../../hooks/useWebSocket';

function AdminSupportPanel() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
    
    // Обновление каждые 3 секунды
    const interval = setInterval(() => {
      loadConversations();
      if (selectedUser) {
        loadMessagesQuiet(selectedUser.id);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket для real-time обновлений
  useWebSocket('new-support-message', (data) => {
    console.log('💬 Новое сообщение поддержки (админ):', data);
    
    // Обновляем список разговоров
    loadConversations();
    
    // Если это сообщение от выбранного пользователя, добавляем в чат
    if (selectedUser && data.userId === selectedUser.id) {
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === data.message.id);
        if (exists) return prev;
        return [...prev, data.message];
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await messageService.getAllSupportConversations();
      setConversations(data);
    } catch (error) {
      console.error('Ошибка загрузки разговоров:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await messageService.getSupportMessages(userId);
      setMessages(data);
      
      // Отмечаем сообщения как прочитанные
      await messageService.markSupportMessagesAsRead(userId);
      
      // Обновляем список разговоров
      loadConversations();
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const loadMessagesQuiet = async (userId) => {
    try {
      const data = await messageService.getSupportMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) {
      return;
    }

    setSending(true);
    try {
      await messageService.sendSupportMessageAsAdmin({
        user_id: selectedUser.id,
        content: newMessage.trim(),
      });
      setNewMessage('');
      // Немедленно обновляем сообщения
      setTimeout(() => loadMessagesQuiet(selectedUser.id), 100);
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

  const filteredConversations = conversations.filter(conv =>
    conv.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && conversations.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Загрузка разговоров...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Список разговоров */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div>
            <h3 style={styles.sidebarTitle}>💬 Чаты</h3>
            <p style={styles.sidebarSubtitle}>{conversations.length} разговоров</p>
          </div>
        </div>
        
        <div style={styles.searchContainer}>
          <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск пользователя..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.conversationList}>
          {filteredConversations.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>Нет сообщений</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.user_id}
                style={{
                  ...styles.conversationItem,
                  ...(selectedUser?.id === conv.user_id ? styles.conversationItemActive : {}),
                }}
                onClick={() => setSelectedUser({ 
                  id: conv.user_id, 
                  name: conv.user_name,
                  email: conv.user_email 
                })}
              >
                <div style={styles.conversationAvatar}>
                  {conv.user_name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.conversationInfo}>
                  <div style={styles.conversationName}>{conv.user_name}</div>
                  <div style={styles.conversationPreview}>
                    {conv.last_message || 'Нет сообщений'}
                  </div>
                </div>
                <div style={styles.conversationMeta}>
                  {conv.last_message_time && (
                    <div style={styles.conversationTime}>
                      {formatTime(conv.last_message_time)}
                    </div>
                  )}
                  {conv.unread_count > 0 && (
                    <div style={styles.unreadBadge}>{conv.unread_count}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Область чата */}
      <div style={styles.chatArea}>
        {!selectedUser ? (
          <div style={styles.noChat}>
            <div style={styles.noChatIcon}>💬</div>
            <p style={styles.noChatTitle}>Выберите разговор</p>
            <p style={styles.noChatText}>Выберите пользователя из списка слева</p>
          </div>
        ) : (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.chatUserAvatar}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.chatUserName}>{selectedUser.name}</div>
                <div style={styles.chatUserEmail}>{selectedUser.email}</div>
              </div>
            </div>

            <div style={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div style={styles.emptyMessages}>
                  <div style={styles.emptyMessagesIcon}>💭</div>
                  <p style={styles.emptyMessagesText}>Нет сообщений</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isAdminMessage = message.is_admin_message;
                  
                  return (
                    <div
                      key={message.id}
                      style={{
                        ...styles.messageWrapper,
                        justifyContent: isAdminMessage ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          ...styles.message,
                          ...(isAdminMessage ? styles.adminMessage : styles.userMessage),
                        }}
                      >
                        {!isAdminMessage && (
                          <div style={styles.userBadge}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{marginRight: '4px'}}>
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            Пользователь
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
                placeholder="Напишите ответ..."
                style={styles.input}
                disabled={sending}
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
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '700px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #E5E5E5',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
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
  sidebar: {
    width: '340px',
    backgroundColor: '#FAFAFA',
    borderRight: '1px solid #E5E5E5',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  sidebarTitle: {
    color: '#191919',
    fontSize: '1.3rem',
    fontWeight: '700',
    margin: 0,
  },
  sidebarSubtitle: {
    color: '#666666',
    fontSize: '0.85rem',
    margin: '4px 0 0 0',
  },
  searchContainer: {
    padding: '16px 20px',
    borderBottom: '1px solid #E5E5E5',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: '32px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '18px',
    height: '18px',
    color: '#999999',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    backgroundColor: '#F5F5F5',
    border: '2px solid transparent',
    borderRadius: '10px',
    color: '#191919',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  conversationList: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#FAFAFA',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '12px',
  },
  emptyText: {
    color: '#666666',
    fontSize: '0.95rem',
    margin: 0,
  },
  conversationItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    gap: '14px',
    cursor: 'pointer',
    borderBottom: '1px solid #E5E5E5',
    transition: 'all 0.2s ease',
    backgroundColor: '#FFFFFF',
  },
  conversationItemActive: {
    backgroundColor: '#FFF9E6',
    borderLeft: '4px solid #FFDD2D',
  },
  conversationAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#FFDD2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#191919',
    fontSize: '1.3rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  },
  conversationName: {
    color: '#191919',
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '4px',
  },
  conversationPreview: {
    color: '#666666',
    fontSize: '0.85rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  conversationMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  conversationTime: {
    color: '#999999',
    fontSize: '0.75rem',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    color: 'white',
    borderRadius: '10px',
    padding: '3px 8px',
    fontSize: '0.75rem',
    fontWeight: '700',
    minWidth: '20px',
    textAlign: 'center',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  noChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
  },
  noChatIcon: {
    fontSize: '4rem',
    marginBottom: '16px',
  },
  noChatTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#191919',
    marginBottom: '8px',
  },
  noChatText: {
    fontSize: '0.95rem',
    color: '#666666',
  },
  chatHeader: {
    padding: '20px 28px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E5E5',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  chatUserAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#FFDD2D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#191919',
    fontSize: '1.2rem',
    fontWeight: '700',
  },
  chatUserName: {
    color: '#191919',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  chatUserEmail: {
    color: '#666666',
    fontSize: '0.85rem',
    marginTop: '2px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    backgroundColor: '#FAFAFA',
  },
  emptyMessages: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  emptyMessagesIcon: {
    fontSize: '3rem',
    marginBottom: '12px',
  },
  emptyMessagesText: {
    color: '#666666',
    fontSize: '0.95rem',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
    animation: 'fadeInUp 0.3s ease',
  },
  message: {
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    wordWrap: 'break-word',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  adminMessage: {
    backgroundColor: '#FFDD2D',
    color: '#191919',
    borderBottomRightRadius: '4px',
  },
  userMessage: {
    backgroundColor: '#FFFFFF',
    color: '#191919',
    borderBottomLeftRadius: '4px',
    border: '1px solid #E5E5E5',
  },
  userBadge: {
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
    padding: '20px 28px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E5E5E5',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '14px 18px',
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
    padding: '14px',
    backgroundColor: '#FFDD2D',
    border: 'none',
    borderRadius: '12px',
    color: '#191919',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    flexShrink: 0,
  },
  sendingSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(25, 25, 25, 0.2)',
    borderTop: '2px solid #191919',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

export default AdminSupportPanel;
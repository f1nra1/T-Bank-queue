import React, { useState, useEffect } from 'react';
import messageService from '../../services/messageService';
import './ChatButton.css';

function ChatButton({ onClick, unreadCount }) {
  return (
    <button className="chat-button" onClick={onClick}>
      <svg className="chat-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      {unreadCount > 0 && (
        <span className="chat-button-badge">{unreadCount}</span>
      )}
    </button>
  );
}

export default ChatButton;
import React from 'react';
import { colors } from '../../styles/theme';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    animation: 'fadeIn 0.3s ease-out',
  },
  modal: {
    backgroundColor: colors.background.card,
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px',
    borderBottom: `2px solid ${colors.divider}`,
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '600',
    color: colors.text.primary,
    margin: 0,
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '2rem',
    color: colors.text.secondary,
    cursor: 'pointer',
    padding: '0',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.3s',
  },
  content: {
    padding: '30px',
  },
};

// Добавляем CSS анимации
const styleSheet = document.styleSheets[0];
try {
  styleSheet.insertRule(`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `, styleSheet.cssRules.length);
  
  styleSheet.insertRule(`
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `, styleSheet.cssRules.length);
} catch (e) {}

export default Modal;
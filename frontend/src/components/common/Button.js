import React from 'react';

function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  icon = null,
  type = 'button',
  style = {},
}) {
  const baseStyles = {
    padding: size === 'small' ? '10px 20px' : size === 'large' ? '16px 32px' : '12px 24px',
    fontSize: size === 'small' ? '0.9rem' : size === 'large' ? '1.1rem' : '1rem',
    fontWeight: '600',
    borderRadius: '100px', // Очень закругленные углы как на картинке
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    boxSizing: 'border-box',
  };

  const variants = {
    primary: {
      backgroundColor: '#FFDD2D',
      color: '#191919',
      border: '3px solid #FFDD2D',
      boxShadow: 'none',
    },
    secondary: {
      backgroundColor: '#191919',
      color: '#FFFFFF',
      border: '3px solid #191919',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#191919',
      border: '3px solid #E0E0E0',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#666666',
      border: '3px solid transparent',
    },
    success: {
      backgroundColor: '#4CAF50',
      color: '#FFFFFF',
      border: '3px solid #4CAF50',
    },
    warning: {
      backgroundColor: '#FF9800',
      color: '#FFFFFF',
      border: '3px solid #FF9800',
    },
    error: {
      backgroundColor: '#F44336',
      color: '#FFFFFF',
      border: '3px solid #F44336',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const hoverStyles = isHovered && !disabled ? {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    opacity: 0.9,
  } : {};

  const finalStyles = {
    ...baseStyles,
    ...variants[variant],
    ...hoverStyles,
    ...style,
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      style={finalStyles}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
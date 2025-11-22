import React from 'react';
import { colors, commonStyles } from '../../styles/theme';

function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled, 
  type = 'button',
  fullWidth = false,
  size = 'medium',
  icon,
  style = {},
}) {
  const getButtonStyles = () => {
    const baseStyles = {
      ...commonStyles.button,
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: fullWidth ? '100%' : 'auto',
    };

    const sizeStyles = {
      small: { padding: '8px 20px', fontSize: '0.875rem' },
      medium: { padding: '12px 28px', fontSize: '1rem' },
      large: { padding: '16px 36px', fontSize: '1.1rem' },
    };

    const variantStyles = {
      primary: {
        background: colors.primary.gradient,
        color: colors.text.primary,
      },
      secondary: {
        background: colors.secondary.gradient,
        color: colors.text.primary,
      },
      success: {
        background: colors.success.main,
        color: colors.text.primary,
      },
      warning: {
        background: colors.warning.main,
        color: colors.text.primary,
      },
      error: {
        background: colors.error.main,
        color: colors.text.primary,
      },
      outline: {
        background: 'transparent',
        border: `2px solid ${colors.primary.main}`,
        color: colors.primary.main,
      },
      ghost: {
        background: 'transparent',
        color: colors.info.main,
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={getButtonStyles()}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
      {children}
    </button>
  );
}

export default Button;
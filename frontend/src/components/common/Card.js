import React from 'react';
import { colors } from '../../styles/theme';

function Card({ children, hoverable = false, style = {}, onClick }) {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseStyles = {
    backgroundColor: colors.background.card,
    borderRadius: '16px',
    padding: '30px',
    border: `1px solid ${colors.divider}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  };

  const hoverStyles = hoverable ? {
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    boxShadow: isHovered 
      ? '0 12px 32px rgba(0, 0, 0, 0.1), 0 0 0 2px #FFDD2D' 
      : '0 2px 8px rgba(0, 0, 0, 0.08)',
    borderColor: isHovered ? colors.primary.main : colors.divider,
    cursor: onClick ? 'pointer' : 'default',
  } : {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  };

  const combinedStyles = {
    ...baseStyles,
    ...hoverStyles,
    ...style,
  };

  return (
    <div
      style={combinedStyles}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
      onClick={onClick}
    >
      {/* Декоративная линия сверху */}
      {hoverable && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: colors.primary.gradient,
            transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.3s ease',
            transformOrigin: 'left',
          }}
        />
      )}
      {children}
    </div>
  );
}

export default Card;
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
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  };

  const hoverStyles = hoverable && isHovered ? {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1), 0 0 0 2px #FFDD2D',
    borderColor: colors.primary.main,
    cursor: onClick ? 'pointer' : 'default',
  } : {};

  return (
    <div
      style={{ ...baseStyles, ...hoverStyles, ...style }}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Card;
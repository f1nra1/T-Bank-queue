export const colors = {
  // Фирменные цвета Т-Банк
  brand: {
    yellow: '#FFDD2D',
    yellowDark: '#F5C700',
    yellowLight: '#FFF59D',
    black: '#191919',
  },
  
  // Основные цвета
  primary: {
    main: '#FFDD2D',
    light: '#FFF59D',
    dark: '#F5C700',
    gradient: 'linear-gradient(135deg, #FFDD2D 0%, #F5C700 100%)',
  },
  secondary: {
    main: '#191919',
    light: '#252525',
    dark: '#000000',
  },
  
  // Статусы
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#F44336',
    light: '#E57373',
    dark: '#D32F2F',
  },
  info: {
    main: '#FFDD2D',
    light: '#FFF59D',
    dark: '#F5C700',
  },
  
  // Фоны - БЕЛЫЕ
  background: {
    default: '#FFFFFF',
    paper: '#F9F9F9',
    card: '#FFFFFF',
    input: '#F5F5F5',
    hover: '#F0F0F0',
  },
  
  // Текст - ЧЕРНЫЙ
  text: {
    primary: '#191919',
    secondary: '#666666',
    disabled: '#AAAAAA',
    inverse: '#FFFFFF',
  },
  
  // Границы
  divider: '#E0E0E0',
  border: '#D0D0D0',
};

export const commonStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background.default,
    color: colors.text.primary,
    fontFamily: '"Inter", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  
  pageTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    background: colors.primary.gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '20px',
  },
  
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: '20px',
  },
  
  input: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '1rem',
    color: colors.text.primary,
    backgroundColor: colors.background.input,
    border: `2px solid ${colors.divider}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  
  button: {
    padding: '14px 28px',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
};

export default { colors, commonStyles };
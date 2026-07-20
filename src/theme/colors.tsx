

export const colors = {
  // Azuis principais
  primary: '#2455E6',
  primaryDark: '#122A6B',
  primaryLight: '#5B8DEF',
  gradientStart: '#5B8DEF',
  gradientEnd: '#122A6B',

  // Fundo / superfícies
  background: '#F2F5FC',
  card: '#FFFFFF',
  cardAlt: '#EAF0FE',

  // Texto
  textDark: '#0F1B3D',
  textMuted: '#66708C',
  textOnPrimary: '#FFFFFF',
  border: '#DCE4F5',

  // Estados de encomenda
  pendente: '#F59E0B',
  pendenteBg: '#FEF3E2',
  entregue: '#1FAA59',
  entregueBg: '#E4F7EC',
  cancelado: '#E23744',
  canceladoBg: '#FCE8E9',
  reagendado: '#8B5CF6',
  reagendadoBg: '#F0EBFE',

  // Extras
  danger: '#E23744',
  success: '#1FAA59',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
};

export const statusMeta = {
  pendente: { label: 'Pendente', color: colors.pendente, bg: colors.pendenteBg },
  entregue: { label: 'Entregue', color: colors.entregue, bg: colors.entregueBg },
  cancelado: { label: 'Cancelado', color: colors.cancelado, bg: colors.canceladoBg },
  reagendado: { label: 'Reagendado', color: colors.reagendado, bg: colors.reagendadoBg },
};

export default colors;

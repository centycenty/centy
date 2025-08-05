import { Theme } from '../types';

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#6D6D70',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF9F0A',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#98989D',
    border: '#38383A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
  },
};

export const workerCategories = [
  { id: 'electrician', name: 'Electrician', icon: '⚡', color: '#FF9500' },
  { id: 'plumber', name: 'Plumber', icon: '🔧', color: '#007AFF' },
  { id: 'carpenter', name: 'Carpenter', icon: '🔨', color: '#8B4513' },
  { id: 'ac_technician', name: 'AC Technician', icon: '❄️', color: '#00BCD4' },
  { id: 'tailor', name: 'Tailor', icon: '✂️', color: '#E91E63' },
  { id: 'mechanic', name: 'Mechanic', icon: '🔩', color: '#9E9E9E' },
  { id: 'painter', name: 'Painter', icon: '🎨', color: '#FF5722' },
  { id: 'cleaner', name: 'Cleaner', icon: '🧹', color: '#4CAF50' },
  { id: 'gardener', name: 'Gardener', icon: '🌱', color: '#8BC34A' },
  { id: 'security', name: 'Security', icon: '🛡️', color: '#607D8B' },
  { id: 'other', name: 'Other', icon: '🔧', color: '#9C27B0' },
];
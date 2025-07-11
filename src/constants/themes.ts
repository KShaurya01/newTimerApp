import { Theme } from '../types';

const commonSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const commonBorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
};

const commonTypography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
  },
};

export const lightTheme: Theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E5E5EA',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    accent: '#AF52DE',
  },
  spacing: commonSpacing,
  borderRadius: commonBorderRadius,
  typography: commonTypography,
};

export const darkTheme: Theme = {
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#ADADB8',
    border: '#38383A',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    accent: '#BF5AF2',
  },
  spacing: commonSpacing,
  borderRadius: commonBorderRadius,
  typography: commonTypography,
};

export const categoryColors = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF3B30', // Red
  '#AF52DE', // Purple
  '#5856D6', // Indigo
  '#FF2D92', // Pink
  '#64D2FF', // Light Blue
  '#30B0C7', // Teal
  '#32ADE6', // Sky Blue
];

export const getRandomCategoryColor = (): string => {
  return categoryColors[Math.floor(Math.random() * categoryColors.length)];
};

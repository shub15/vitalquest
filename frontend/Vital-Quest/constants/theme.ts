// Fantasy RPG Theme for Vital Quest
export const theme = {
  colors: {
    // Primary Fantasy Colors
    primary: {
      dark: '#4A1D96',      // Deep purple
      main: '#6B2FBF',      // Royal purple
      light: '#8B5CF6',     // Bright purple
      lighter: '#A78BFA',   // Light purple
    },
    
    // Mystical Accents
    accent: {
      gold: '#FFD700',      // Gold
      silver: '#C0C0C0',    // Silver
      bronze: '#CD7F32',    // Bronze
      legendary: '#FF6B35', // Legendary orange
    },
    
    // RPG Stats Colors
    stats: {
      hp: '#EF4444',        // Health red
      xp: '#10B981',        // Experience green
      mana: '#3B82F6',      // Mana blue
      stamina: '#F59E0B',   // Stamina orange
    },
    
    // Background & Surfaces
    background: {
      primary: '#0F0A1E',   // Deep dark purple
      secondary: '#1A1333', // Dark purple
      tertiary: '#2D1B4E',  // Medium purple
      card: '#1E1538',      // Card background
    },
    
    // Text Colors
    text: {
      primary: '#F9FAFB',   // Almost white
      secondary: '#D1D5DB', // Light gray
      tertiary: '#9CA3AF',  // Medium gray
      disabled: '#6B7280',  // Dark gray
    },
    
    // Quest & Challenge Colors
    quest: {
      daily: '#8B5CF6',     // Purple
      weekly: '#EC4899',    // Pink
      custom: '#06B6D4',    // Cyan
      completed: '#10B981', // Green
    },
    
    // Rarity Colors
    rarity: {
      common: '#9CA3AF',    // Gray
      uncommon: '#10B981',  // Green
      rare: '#3B82F6',      // Blue
      epic: '#A855F7',      // Purple
      legendary: '#F59E0B', // Gold
    },
    
    // Status Colors
    status: {
      success: '#10B981',   // Green
      warning: '#F59E0B',   // Orange
      error: '#EF4444',     // Red
      info: '#3B82F6',      // Blue
    },
    
    // Gradients (for LinearGradient)
    gradients: {
      primary: ['#6B2FBF', '#8B5CF6'] as const,
      gold: ['#FFD700', '#FFA500'] as const,
      health: ['#EF4444', '#DC2626'] as const,
      xp: ['#10B981', '#059669'] as const,
      card: ['#1E1538', '#2D1B4E'] as const,
      legendary: ['#FF6B35', '#F59E0B'] as const,
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      mono: 'SpaceMono',
      // Add custom fantasy fonts here when loaded
      fantasy: 'System', // Placeholder for custom font
    },
    
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      lg: 16,
      xl: 18,
      '2xl': 20,
      '3xl': 24,
      '4xl': 28,
      '5xl': 32,
      '6xl': 40,
    },
    
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },
  
  // Shadows (for elevation)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    glow: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    },
  },
  
  // Animation Durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export type Theme = typeof theme;

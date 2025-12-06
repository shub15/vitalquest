// Modern Dark RPG Theme for Vital Quest
// Minimal, Material-inspired, High Contrast

export const theme = {
  colors: {
    // Primary Brand Colors - Heroic Steel/Mystic
    primary: {
      dark: '#0F172A',      // Slate 900 (Deepest)
      main: '#334155',      // Slate 700 (Main UI)
      light: '#475569',     // Slate 600 (Highlight)
      lighter: '#94A3B8',   // Slate 400 (Text/Icon)
    },
    
    // RPG Class/Stat Accents (Slightly desaturated for premium feel)
    stats: {
      hp: '#DC2626',        // Red 600
      xp: '#CA8A04',        // Yellow 600
      mana: '#0891B2',      // Cyan 600
      stamina: '#059669',   // Emerald 600
    },
    
    // Backgrounds - Deep Obsidian
    background: {
      primary: '#020617',   // Slate 950 (Main BG - Darker)
      secondary: '#0F172A', // Slate 900 (Secondary BG)
      tertiary: '#1E293B',  // Slate 800
      card: '#0F172A',      // Slate 900 (Card Surface)
      overlay: 'rgba(2, 6, 23, 0.9)', // Modal overlay
    },
    
    // Text - High Contrast & Clean
    text: {
      primary: '#F1F5F9',   // Slate 100
      secondary: '#94A3B8', // Slate 400
      tertiary: '#64748B',  // Slate 500
      disabled: '#334155',  // Slate 700
      inverse: '#020617',   // Slate 950
    },
    
    // Interactive Elements (Subtle Borders)
    border: {
      subtle: 'rgba(255, 255, 255, 0.05)',    // Very subtle glass border
      default: 'rgba(255, 255, 255, 0.1)',    // Default component border
      highlight: 'rgba(148, 163, 184, 0.2)',  // Active state border
    },

    // Accents & Rarity
    accent: {
      gold: '#EAB308',      // Yellow 500
      silver: '#94A3B8',    // Slate 400
      bronze: '#B45309',    // Amber 700
      legendary: '#F59E0B', // Amber 500
      mythic: '#A855F7',    // Purple 500
    },

    // Rarity Colors
    rarity: {
      common: '#64748B',    // Slate 500
      uncommon: '#10B981',  // Emerald 500
      rare: '#3B82F6',      // Blue 500
      epic: '#8B5CF6',      // Violet 500
      legendary: '#F59E0B', // Amber 500
    },
    
    // Quest Types
    quest: {
      daily: '#3B82F6',     // Blue 500
      weekly: '#8B5CF6',    // Violet 500
      custom: '#10B981',    // Emerald 500
      completed: '#059669', // Emerald 600
    },
    
    // Status
    status: {
      success: '#10B981',   // Emerald 500
      warning: '#F59E0B',   // Amber 500
      error: '#EF4444',     // Red 500
      info: '#3B82F6',      // Blue 500
    },
    
    // Gradients - Subtle Lighting Effects
    gradients: {
      primary: ['#1E293B', '#334155'] as const,   // Slate 800 -> Slate 700 (Subtle Lift)
      card: ['#0F172A', '#0F172A'] as const,      // Flat/Matte
      gold: ['#713F12', '#CA8A04'] as const,      // Deep Bronze -> Gold
      health: ['#7F1D1D', '#991B1B'] as const,    // Deep Red -> Red
      xp: ['#064E3B', '#065F46'] as const,        // Deep Emerald -> Emerald
      legendary: ['#78350F', '#B45309'] as const, // Deep Amber -> Amber
      darkOffset: ['#020617', '#0F172A'] as const,
    },
  },
  
  // Typography - Clean Sans-Serif
  typography: {
    fontFamily: {
      regular: 'System',
      mono: 'SpaceMono',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
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
  
  // Spacing - Standard 4px grid
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },
  
  // Border Radius
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
  },
  
  // Modern Shadows (Subtle Glows)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    // Glow effects
    glow: {
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
  },
  
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

export type Theme = typeof theme;

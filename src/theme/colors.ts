export const Colors = {
    primary: '#F5A623',
    primaryDark: '#E8941A',
    primaryLight: '#FFD580',

    white: '#FFFFFF',
    black: '#000000',

    light: {
        background: '#FFFFFF',
        surface: '#F7F7F7',
        surfaceElevated: '#FFFFFF',
        card: '#FFFFFF',
        text: '#1A1A2E',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        border: '#E5E7EB',
        scaffoldBg: '#F9FAFB',
        tabBar: '#FFFFFF',
        tabBarInactive: '#9CA3AF',
        skeleton: '#E5E7EB',
        miniplayer: '#FFFFFF',
        overlay: 'rgba(0,0,0,0.5)',
        inputBg: '#F3F3F3',
    },

    dark: {
        background: '#0F0F1A',
        surface: '#1A1A2E',
        surfaceElevated: '#252540',
        card: '#1E1E30',
        text: '#F8F8FF',
        textSecondary: '#A8A8C0',
        textTertiary: '#6B6B80',
        border: '#2A2A40',
        scaffoldBg: '#0A0A14',
        tabBar: '#12121F',
        tabBarInactive: '#6B6B80',
        skeleton: '#252540',
        miniplayer: '#1A1A2E',
        overlay: 'rgba(0,0,0,0.75)',
        inputBg: '#1E1E30',
    },
};

export type ThemeColors = typeof Colors.light;

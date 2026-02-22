import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeColors } from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    isDark: boolean;
    colors: ThemeColors;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    mode: 'system',
    isDark: false,
    colors: Colors.light,
    setMode: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>('system');

    useEffect(() => {
        AsyncStorage.getItem('themeMode').then((saved) => {
            if (saved) setModeState(saved as ThemeMode);
        });
    }, []);

    const setMode = async (newMode: ThemeMode) => {
        setModeState(newMode);
        await AsyncStorage.setItem('themeMode', newMode);
    };

    const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
    const colors = isDark ? Colors.dark : Colors.light;

    return (
        <ThemeContext.Provider value={{ mode, isDark, colors, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

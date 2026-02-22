import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MiniPlayer from '../components/MiniPlayer';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import Svg, { Path, Circle, Rect, Polygon } from 'react-native-svg';

export type BottomTabParamList = {
    Home: undefined;
    Favorites: undefined;
    Playlists: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function HomeIcon({ focused }: { focused: boolean }) {
    const color = focused ? Colors.primary : '#9CA3AF';
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill={focused ? Colors.primary : 'none'} stroke={color} strokeWidth={2} />
            <Path d="M9 21V12h6v9" stroke={focused ? Colors.white : color} strokeWidth={2} />
        </Svg>
    );
}

function HeartIcon({ focused }: { focused: boolean }) {
    const color = focused ? Colors.primary : '#9CA3AF';
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={focused ? Colors.primary : 'none'} stroke={color} strokeWidth={2} />
        </Svg>
    );
}

function PlaylistIcon({ focused }: { focused: boolean }) {
    const color = focused ? Colors.primary : '#9CA3AF';
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Rect x={3} y={5} width={14} height={2} rx={1} fill={color} />
            <Rect x={3} y={10} width={10} height={2} rx={1} fill={color} />
            <Rect x={3} y={15} width={8} height={2} rx={1} fill={color} />
            <Circle cx={18} cy={15} r={3} stroke={color} strokeWidth={2} />
            <Path d="M21 9v6" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
    );
}

function GearIcon({ focused }: { focused: boolean }) {
    const color = focused ? Colors.primary : '#9CA3AF';
    return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
            <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke={color} strokeWidth={2} />
        </Svg>
    );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ backgroundColor: 'transparent' }}>
            <MiniPlayer />
            <View style={[styles.tabBar, {
                backgroundColor: colors.tabBar,
                paddingBottom: insets.bottom || 8,
                borderTopColor: colors.border,
            }]}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const focused = state.index === index;

                    const icons: Record<string, React.ReactNode> = {
                        Home: <HomeIcon focused={focused} />,
                        Favorites: <HeartIcon focused={focused} />,
                        Playlists: <PlaylistIcon focused={focused} />,
                        Settings: <GearIcon focused={focused} />,
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tabItem}
                            activeOpacity={0.7}>
                            {icons[route.name]}
                            <View style={[styles.dot, { opacity: focused ? 1 : 0 }]} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
            <Tab.Screen name="Playlists" component={PlaylistsScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingTop: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.primary,
    },
});

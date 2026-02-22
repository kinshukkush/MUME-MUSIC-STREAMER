import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Animated, Easing, StatusBar, Image, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';

type Nav = StackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
    const navigation = useNavigation<Nav>();
    const { colors } = useTheme();
    const spin = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 10 }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();

        Animated.loop(
            Animated.timing(spin, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: Platform.OS !== 'web',
            })
        ).start();

        const timer = setTimeout(async () => {
            const seen = await AsyncStorage.getItem('onboarding_done');
            navigation.replace(seen ? 'Main' : 'Onboarding');
        }, 2800);

        return () => clearTimeout(timer);
    }, []);

    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: 'center' }}>
                <Image source={require('../../assets/splash-icon.png')} style={styles.logo} resizeMode="contain" />
                <Text style={[styles.appName, { color: colors.text }]}>Mume</Text>
            </Animated.View>
            <View style={styles.loaderContainer}>
                {[...Array(8)].map((_, i) => {
                    const angle = (i / 8) * 2 * Math.PI;
                    const x = Math.cos(angle) * 28;
                    const y = Math.sin(angle) * 28;
                    const delay = (i / 8) * 1200;
                    return (
                        <Animated.View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    left: 35 + x,
                                    top: 35 + y,
                                    opacity: spin.interpolate({
                                        inputRange: [
                                            Math.min(delay / 1200, 0.98),
                                            Math.min((delay + 150) / 1200, 0.99),
                                            1,
                                        ],
                                        outputRange: [0.15, 1, 0.15],
                                        extrapolate: 'clamp',
                                    }),
                                    width: i % 2 === 0 ? 9 : 6,
                                    height: i % 2 === 0 ? 9 : 6,
                                    borderRadius: i % 2 === 0 ? 4.5 : 3,
                                },
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 28,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        marginTop: 12,
        letterSpacing: 0.5,
    },
    loaderContainer: {
        width: 80,
        height: 80,
        position: 'relative',
        marginTop: 80,
    },
    dot: {
        position: 'absolute',
        backgroundColor: Colors.primary,
        borderRadius: 5,
    },
});

import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface Props {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export default function SkeletonLoader({ width = 100, height = 100, borderRadius = 8, style }: Props) {
    const { colors } = useTheme();
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

    return (
        <Animated.View style={[{ width: width as any, height, borderRadius, backgroundColor: colors.skeleton, opacity }, style]} />
    );
}

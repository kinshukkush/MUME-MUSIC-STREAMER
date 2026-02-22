import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image, Animated, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl, getArtistNames } from '../services/api';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';
import Svg, { Path, Rect } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;

export default function MiniPlayer() {
    const navigation = useNavigation<Nav>();
    const { colors } = useTheme();
    const { currentSong, isPlaying, playPause, next, position, duration } = usePlayerStore();
    const translateY = useRef(new Animated.Value(80)).current;

    // ✅ Always call hooks before any early return
    const progress = duration > 0 ? Math.min((position / duration) * 100, 100) : 0;

    useEffect(() => {
        Animated.spring(translateY, {
            toValue: currentSong ? 0 : 80,
            useNativeDriver: Platform.OS !== 'web',
            damping: 15,
        }).start();
    }, [!!currentSong]);

    if (!currentSong) return null;

    const imageUrl = getImageUrl(currentSong.image, '150x150');
    const artistName = getArtistNames(currentSong);

    return (
        <Animated.View style={[styles.container, { backgroundColor: colors.miniplayer, borderTopColor: colors.border, transform: [{ translateY }] }]}>
            <TouchableOpacity style={styles.inner} onPress={() => navigation.navigate('Player')} activeOpacity={0.9}>
                <Image source={{ uri: imageUrl ?? undefined }} style={styles.albumArt} />
                <View style={styles.info}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentSong.name}</Text>
                    <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{artistName}</Text>
                </View>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={playPause} style={styles.controlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {isPlaying ? (
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Rect x={6} y={4} width={4} height={16} rx={1} fill={Colors.primary} />
                                <Rect x={14} y={4} width={4} height={16} rx={1} fill={Colors.primary} />
                            </Svg>
                        ) : (
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path d="M5 3l14 9-14 9V3z" fill={Colors.primary} />
                            </Svg>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={next} style={styles.controlBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                            <Path d="M5 4l10 8-10 8V4z" fill={colors.textSecondary} />
                            <Rect x={19} y={4} width={2} height={16} rx={1} fill={colors.textSecondary} />
                        </Svg>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View style={[styles.progress, { width: `${progress}%` as any, backgroundColor: Colors.primary }]} />
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 12,
    },
    albumArt: {
        width: 46,
        height: 46,
        borderRadius: 10,
        backgroundColor: '#EEE',
    },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '700' },
    artist: { fontSize: 12, marginTop: 2 },
    controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    controlBtn: { padding: 4 },
    progressBar: { height: 2, width: '100%' },
    progress: { height: 2, borderRadius: 1 },
});

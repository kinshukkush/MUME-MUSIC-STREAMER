import React from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { usePlayerStore } from '../store/playerStore';
import { getImageUrl, getArtistNames, formatDuration } from '../services/api';
import Svg, { Path, Rect } from 'react-native-svg';

export default function QueueScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { queue, currentIndex, currentSong, removeFromQueue, playPause, isPlaying, setQueue } = usePlayerStore();

    const renderItem = ({ item, index }: any) => {
        const isCurrent = index === currentIndex;
        const imageUrl = getImageUrl(item.image, '150x150');
        return (
            <View style={[styles.qItem, { backgroundColor: isCurrent ? (Colors.primary + '18') : 'transparent', borderBottomColor: colors.border }]}>
                <Image source={{ uri: imageUrl ?? undefined }} style={styles.qImage} />
                <View style={{ flex: 1 }}>
                    <Text style={[styles.qTitle, { color: isCurrent ? Colors.primary : colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.qArtist, { color: colors.textSecondary }]} numberOfLines={1}>{getArtistNames(item)}</Text>
                </View>
                {isCurrent && (
                    <View style={styles.playingTag}>
                        <Text style={styles.playingText}>Playing</Text>
                    </View>
                )}
                {!isCurrent && (
                    <TouchableOpacity onPress={() => removeFromQueue(index)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                            <Path d="M18 6L6 18M6 6l12 12" stroke={colors.textTertiary} strokeWidth={2} strokeLinecap="round" />
                        </Svg>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Queue</Text>
                <Text style={[styles.count, { color: colors.textSecondary }]}>{queue.length} songs</Text>
            </View>

            {queue.length === 0 ? (
                <View style={styles.empty}>
                    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                        <Path d="M9 18V5l12-2v13" stroke={colors.border} strokeWidth={1.5} strokeLinecap="round" />
                        <Path d="M6 21a3 3 0 100-6 3 3 0 000 6zM18 19a3 3 0 100-6 3 3 0 000 6z" stroke={colors.border} strokeWidth={1.5} />
                    </Svg>
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your queue is empty</Text>
                </View>
            ) : (
                <FlatList
                    data={queue}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
    backBtn: { padding: 4 },
    title: { flex: 1, fontSize: 20, fontWeight: '800' },
    count: { fontSize: 14 },
    qItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12, borderBottomWidth: 1 },
    qImage: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#DDD' },
    qTitle: { fontSize: 14, fontWeight: '600' },
    qArtist: { fontSize: 12, marginTop: 3 },
    playingTag: { backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    playingText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 14 },
});

import React from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, StatusBar, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Song, getImageUrl, getArtistNames, formatDuration } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import SongCard from '../components/SongCard';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AlbumDetail'>;

const { width } = Dimensions.get('window');

export default function AlbumDetailScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { albumName, albumArtist, songs, coverUrl } = route.params;
    const { setQueue } = usePlayerStore();

    const totalDuration = songs.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
    const totalMins = Math.floor(totalDuration / 60);
    const totalHrs = Math.floor(totalMins / 60);
    const durationStr = totalHrs > 0
        ? `${totalHrs}:${String(totalMins % 60).padStart(2, '0')}:${String(totalDuration % 60).padStart(2, '0')} mins`
        : `${totalMins}:${String(totalDuration % 60).padStart(2, '0')} mins`;

    const playSong = (song: Song) => {
        const idx = songs.findIndex((s) => s.id === song.id);
        setQueue(songs, idx >= 0 ? idx : 0);
        navigation.navigate('Player');
    };

    const playAll = () => {
        if (songs.length > 0) {
            setQueue(songs, 0);
            navigation.navigate('Player');
        }
    };

    const shuffle = () => {
        if (songs.length > 0) {
            const shuffled = [...songs].sort(() => Math.random() - 0.5);
            setQueue(shuffled, 0);
            navigation.navigate('Player');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" />
            <FlatList
                data={songs}
                keyExtractor={(item, idx) => `${item.id}-${idx}`}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => <SongCard song={item} onPress={() => playSong(item)} allSongs={songs} />}
                ListHeaderComponent={
                    <View>
                        {/* Hero */}
                        <View style={styles.hero}>
                            {coverUrl ? (
                                <>
                                    <Image source={{ uri: coverUrl }} style={StyleSheet.absoluteFillObject as any} blurRadius={20} />
                                    <LinearGradient
                                        colors={['transparent', isDark ? '#0F0F1A' : '#FFFFFF']}
                                        style={StyleSheet.absoluteFillObject as any}
                                    />
                                </>
                            ) : (
                                <LinearGradient
                                    colors={[Colors.primary + '60', colors.background]}
                                    style={StyleSheet.absoluteFillObject as any}
                                />
                            )}

                            {/* Back Button */}
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={[styles.backBtn, { top: insets.top + 8 }]}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            >
                                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                    <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                            </TouchableOpacity>

                            {/* Cover Art */}
                            <View style={styles.coverWrapper}>
                                <Image
                                    source={{ uri: coverUrl ?? undefined }}
                                    style={styles.coverArt}
                                />
                            </View>
                        </View>

                        {/* Meta */}
                        <View style={styles.meta}>
                            <Text style={[styles.albumTitle, { color: colors.text }]} numberOfLines={2}>{albumName}</Text>
                            <Text style={[styles.albumArtist, { color: colors.textSecondary }]} numberOfLines={1}>{albumArtist}</Text>
                            <Text style={[styles.albumStats, { color: colors.textSecondary }]}>
                                1 Album  |  {songs.length} Songs  |  {durationStr}
                            </Text>
                        </View>

                        {/* Shuffle / Play */}
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                onPress={shuffle}
                                style={[styles.shuffleBtn, { borderColor: Colors.primary }]}
                                activeOpacity={0.85}
                            >
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M16 3h5v5M4 20l16-16M16 20h5v-5M4 4l16 16" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </Svg>
                                <Text style={[styles.shuffleBtnText, { color: Colors.primary }]}>Shuffle</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={playAll}
                                style={[styles.playAllBtn, { backgroundColor: Colors.primary }]}
                                activeOpacity={0.85}
                            >
                                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                    <Path d="M5 3l14 9-14 9V3z" fill="#FFF" />
                                </Svg>
                                <Text style={styles.playAllBtnText}>Play</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Songs Header */}
                        <View style={[styles.songsHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.songsTitle, { color: colors.text }]}>Songs</Text>
                            <TouchableOpacity onPress={playAll}>
                                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 14 }}>See All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    hero: { height: 280, position: 'relative', alignItems: 'center', justifyContent: 'flex-end' },
    backBtn: {
        position: 'absolute', left: 16, zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 20, padding: 8
    },
    coverWrapper: {
        width: width * 0.52,
        height: width * 0.52,
        borderRadius: 18,
        elevation: 18,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 20,
        marginBottom: -20,
        overflow: 'hidden',
    },
    coverArt: { width: '100%', height: '100%', backgroundColor: '#333' },
    meta: { paddingHorizontal: 24, paddingTop: 28, alignItems: 'center' },
    albumTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
    albumArtist: { fontSize: 14, marginTop: 6, textAlign: 'center' },
    albumStats: { fontSize: 13, marginTop: 8, textAlign: 'center' },
    actionRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 24, marginTop: 20 },
    shuffleBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 30, borderWidth: 2, paddingVertical: 13,
        backgroundColor: 'transparent'
    },
    shuffleBtnText: { fontWeight: '700', fontSize: 15 },
    playAllBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 30, paddingVertical: 13,
    },
    playAllBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
    songsHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14, marginTop: 16,
        borderBottomWidth: 1,
    },
    songsTitle: { fontSize: 18, fontWeight: '700' },
});

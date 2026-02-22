import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Image, ScrollView, StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { getArtist, getArtistSongs, getImageUrl, Song, getArtistNames } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import SongCard from '../components/SongCard';
import Svg, { Path } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ArtistDetail'>;

const { width } = Dimensions.get('window');

export default function ArtistDetailScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { artistId, artistName } = route.params;
    const { setQueue } = usePlayerStore();

    const [artist, setArtist] = useState<any>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                // Fetch artist info and songs together, but don't let one failure block the other
                const [artistResult, songsResult] = await Promise.allSettled([
                    getArtist(artistId),
                    getArtistSongs(artistId, 1),
                ]);

                if (!cancelled) {
                    if (artistResult.status === 'fulfilled') {
                        setArtist(artistResult.value);
                    }
                    if (songsResult.status === 'fulfilled') {
                        const data = songsResult.value;
                        // Handle different API response shapes
                        const extracted: Song[] =
                            data?.songs?.results ??
                            data?.results ??
                            data?.data?.results ??
                            (Array.isArray(data) ? data : []);
                        setSongs(extracted);
                    }
                }
            } catch {
                // Silently fail — the UI will just show empty state
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [artistId]);

    const imageUrl =
        getImageUrl(artist?.image, '500x500') ??
        getImageUrl(artist?.image, '150x150') ??
        null;

    const followerText = (() => {
        const raw = artist?.followerCount;
        if (!raw) return null;
        const n = Number(raw);
        if (isNaN(n)) return String(raw);
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M followers`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K followers`;
        return `${n} followers`;
    })();

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
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <View style={styles.heroContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFillObject as any} blurRadius={8} />
                    ) : (
                        <View style={[StyleSheet.absoluteFillObject as any, { backgroundColor: Colors.primary + '40' }]} />
                    )}
                    <LinearGradient
                        colors={['transparent', isDark ? '#0F0F1A' : '#FFFFFF']}
                        style={StyleSheet.absoluteFillObject as any}
                        start={{ x: 0, y: 0.4 }}
                        end={{ x: 0, y: 1 }}
                    />

                    {/* Back */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.backBtn, { top: insets.top + 8 }]}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                            <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                    </TouchableOpacity>

                    {/* Avatar + Name */}
                    <View style={styles.heroContent}>
                        {imageUrl && (
                            <Image source={{ uri: imageUrl }} style={styles.artistAvatar} />
                        )}
                        <Text style={styles.artistName}>{artist?.name ?? artistName}</Text>
                        {followerText && (
                            <Text style={styles.followerCount}>{followerText}</Text>
                        )}
                    </View>
                </View>

                {/* Shuffle + Play */}
                {!loading && songs.length > 0 && (
                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={shuffle} style={[styles.shuffleBtn, { borderColor: Colors.primary }]} activeOpacity={0.85}>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M16 3h5v5M4 20l16-16M16 20h5v-5M4 4l16 16" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                            <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 15 }}>Shuffle</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={playAll} style={[styles.playAllBtn, { backgroundColor: Colors.primary }]} activeOpacity={0.85}>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M5 3l14 9-14 9V3z" fill="#FFF" />
                            </Svg>
                            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>Play All</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Songs */}
                {loading ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} size="large" />
                ) : songs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={{ fontSize: 44 }}>🎵</Text>
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No songs found for this artist</Text>
                    </View>
                ) : (
                    <View>
                        <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Songs</Text>
                            <Text style={[{ color: colors.textSecondary, fontSize: 13 }]}>{songs.length} tracks</Text>
                        </View>
                        {songs.map((song, index) => (
                            <SongCard key={`${song.id}-${index}`} song={song} onPress={() => playSong(song)} allSongs={songs} />
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroContainer: { height: 320, position: 'relative', justifyContent: 'flex-end' },
    backBtn: {
        position: 'absolute', left: 16, zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8,
    },
    heroContent: { alignItems: 'center', paddingBottom: 24, gap: 8 },
    artistAvatar: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 3, borderColor: '#FFF',
        shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12,
    },
    artistName: {
        fontSize: 26, fontWeight: '800', color: '#FFF',
        textShadow: '0px 0px 8px rgba(0,0,0,0.6)',
        textAlign: 'center', paddingHorizontal: 20,
    },
    followerCount: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    actionRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 20, marginTop: 20, marginBottom: 4 },
    shuffleBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 30, borderWidth: 2, paddingVertical: 12,
    },
    playAllBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 30, paddingVertical: 12,
    },
    sectionHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, marginTop: 8,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 15, textAlign: 'center', paddingHorizontal: 40 },
});

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, StatusBar, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Song, getImageUrl, getArtistNames, formatDuration } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useDownloadsStore } from '../store/downloadsStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import Svg, { Path } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'PlaylistDetail'>;

const PLAYLIST_SONGS_PREFIX = 'mume_playlist_songs_';

export default function PlaylistDetailScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const { playlistId, playlistName } = route.params;
    const { setQueue } = usePlayerStore();
    const { downloads, removeDownload } = useDownloadsStore();
    const [songs, setSongs] = useState<Song[]>([]);

    useFocusEffect(
        useCallback(() => {
            if (playlistId === 'downloads') {
                // Convert downloaded songs to Song format
                const downloadedSongs: Song[] = downloads.map(d => ({
                    id: d.id,
                    name: d.name,
                    album: { name: 'Downloaded', id: '' },
                    year: '',
                    releaseDate: '',
                    duration: typeof d.duration === 'number' ? d.duration.toString() : d.duration,
                    label: '',
                    primaryArtists: d.artist,
                    primaryArtistsId: '',
                    featuredArtists: '',
                    featuredArtistsId: '',
                    explicitContent: 0,
                    playCount: 0,
                    language: '',
                    hasLyrics: false,
                    url: '',
                    copyright: '',
                    image: d.imageUrl ? [{ quality: '500x500', link: d.imageUrl }] : [],
                    downloadUrl: [{ quality: '96kbps', link: d.localUri }]
                }));
                setSongs(downloadedSongs);
            } else {
                const key = PLAYLIST_SONGS_PREFIX + playlistId;
                AsyncStorage.getItem(key).then((data) => {
                    setSongs(data ? JSON.parse(data) : []);
                });
            }
        }, [playlistId, downloads])
    );

    const removeSong = async (songId: string) => {
        if (playlistId === 'downloads') {
            // Remove from downloads store
            Alert.alert(
                'Remove Download',
                'Delete this downloaded song?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => removeDownload(songId)
                    }
                ]
            );
        } else {
            const updated = songs.filter((s) => s.id !== songId);
            setSongs(updated);
            const key = PLAYLIST_SONGS_PREFIX + playlistId;
            await AsyncStorage.setItem(key, JSON.stringify(updated));
        }
    };

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
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.backBtn}
                >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={colors.text} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{playlistName}</Text>
                <View style={{ width: 36 }} />
            </View>

            {songs.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 48 }}>🎵</Text>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No songs yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        Tap the <Text style={{ color: Colors.primary }}>+</Text> button on any song to add it here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={songs}
                    keyExtractor={(item, idx) => `${item.id}-${idx}`}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.songRow, { borderBottomColor: colors.border }]}
                            onPress={() => playSong(item)}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: getImageUrl(item.image, '150x150') ?? undefined }}
                                style={styles.thumb}
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.songName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                                <Text style={[styles.songMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                                    {getArtistNames(item)} · {formatDuration(item.duration)}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => Alert.alert('Remove Song', `Remove "${item.name}" from playlist?`, [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Remove', style: 'destructive', onPress: () => removeSong(item.id) }
                                ])}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={styles.removeBtn}
                            >
                                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                    <Path d="M18 6L6 18M6 6l12 12" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
                                </Svg>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    ListHeaderComponent={
                        songs.length > 0 ? (
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
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1
    },
    backBtn: { padding: 4, width: 36 },
    headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
    actionRow: { flexDirection: 'row', gap: 14, paddingHorizontal: 20, marginVertical: 16 },
    shuffleBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 30, borderWidth: 2, paddingVertical: 12
    },
    playAllBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 30, paddingVertical: 12
    },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
    songRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth
    },
    thumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#DDD' },
    songName: { fontSize: 15, fontWeight: '600' },
    songMeta: { fontSize: 12, marginTop: 3 },
    removeBtn: { padding: 4 },
});

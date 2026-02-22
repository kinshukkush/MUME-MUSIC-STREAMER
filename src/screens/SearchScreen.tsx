import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { searchSongs, searchArtists, searchAlbums, Song, Artist, getArtistNames, getImageUrl } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import Svg, { Path, Circle, Line } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;
const SEARCH_TABS = ['Songs', 'Artists', 'Albums'];
const RECENT_KEY = 'recent_searches';

export default function SearchScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const setQueue = usePlayerStore((s) => s.setQueue);

    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [songs, setSongs] = useState<Song[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [albums, setAlbums] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const debounceTimer = useRef<any>(null);
    const hasResults = (activeTab === 0 && songs.length > 0) ||
        (activeTab === 1 && artists.length > 0) ||
        (activeTab === 2 && albums.length > 0);

    useEffect(() => {
        AsyncStorage.getItem(RECENT_KEY).then((val) => {
            if (val) setRecentSearches(JSON.parse(val));
        });
    }, []);

    const saveRecent = (q: string) => {
        if (!q.trim()) return;
        setRecentSearches((prev) => {
            const updated = [q.trim(), ...prev.filter((r) => r !== q.trim())].slice(0, 10);
            AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearRecent = () => {
        setRecentSearches([]);
        AsyncStorage.removeItem(RECENT_KEY);
    };

    const removeRecent = (item: string) => {
        setRecentSearches((prev) => {
            const updated = prev.filter((r) => r !== item);
            AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const search = useCallback(async (q: string) => {
        if (!q.trim()) { setSongs([]); setArtists([]); setAlbums([]); return; }
        setLoading(true);
        try {
            const [s, a, al] = await Promise.all([
                searchSongs(q, 1, 20),
                searchArtists(q, 1, 15),
                searchAlbums(q, 1, 15),
            ]);
            setSongs(s?.data?.results ?? []);
            setArtists(a?.data?.results ?? []);
            setAlbums(al?.data?.results ?? []);
        } catch { setSongs([]); setArtists([]); setAlbums([]); }
        setLoading(false);
    }, []);

    const onChangeText = (text: string) => {
        setQuery(text);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            if (text.trim()) {
                saveRecent(text.trim());
                search(text);
            } else {
                setSongs([]); setArtists([]); setAlbums([]);
            }
        }, 500);
    };

    const playSong = (song: Song) => {
        const idx = songs.findIndex((s) => s.id === song.id);
        setQueue(songs, idx >= 0 ? idx : 0);
        navigation.navigate('Player');
    };

    const renderSongsTab = () => (
        <FlatList
            data={songs}
            keyExtractor={(i, idx) => `${i.id}-${idx}`}
            renderItem={({ item }) => <SongCard song={item} onPress={() => playSong(item)} allSongs={songs} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NotFound />}
        />
    );

    const renderArtistsTab = () => (
        <FlatList
            data={artists}
            keyExtractor={(i) => i.id}
            numColumns={3}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
                <ArtistCard
                    artist={item}
                    onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id, artistName: item.name })}
                    columns
                />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NotFound />}
        />
    );

    const renderAlbumsTab = () => (
        <FlatList
            data={albums}
            keyExtractor={(i, idx) => `${i.id ?? idx}`}
            renderItem={({ item }) => <AlbumRow album={item} colors={colors} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NotFound />}
        />
    );

    const tabContent = [renderSongsTab, renderArtistsTab, renderAlbumsTab];

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            {/* Search Header */}
            <View style={styles.searchHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path d="M19 12H5M5 12l7-7M5 12l7 7" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </TouchableOpacity>
                <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg ?? colors.surface, borderColor: Colors.primary }]}>
                    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Circle cx={11} cy={11} r={8} stroke={Colors.primary} strokeWidth={2} />
                        <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                    <TextInput
                        autoFocus
                        placeholder="Search songs, artists, albums..."
                        placeholderTextColor={colors.textSecondary}
                        value={query}
                        onChangeText={onChangeText}
                        style={[styles.input, { color: colors.text }]}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); setSongs([]); setArtists([]); setAlbums([]); }}>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M18 6L6 18M6 6l12 12" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
                            </Svg>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Pill Tabs */}
            {query.trim() !== '' && (
                <View style={styles.pillsRow}>
                    {SEARCH_TABS.map((tab, i) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(i)}
                            style={[
                                styles.pill,
                                { borderColor: Colors.primary },
                                activeTab === i && { backgroundColor: Colors.primary },
                            ]}
                        >
                            <Text style={[styles.pillText, { color: activeTab === i ? '#FFF' : Colors.primary }]}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Body */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : query.trim() === '' ? (
                /* Recent Searches */
                <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
                    {recentSearches.length > 0 ? (
                        <>
                            <View style={styles.recentHeader}>
                                <Text style={[styles.recentTitle, { color: colors.text }]}>Recent Searches</Text>
                                <TouchableOpacity onPress={clearRecent}>
                                    <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 13 }}>Clear All</Text>
                                </TouchableOpacity>
                            </View>
                            {recentSearches.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={styles.recentRow}
                                    onPress={() => { setQuery(item); search(item); }}
                                >
                                    <Text style={[styles.recentItem, { color: colors.text }]}>{item}</Text>
                                    <TouchableOpacity onPress={() => removeRecent(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                        <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                            <Path d="M18 6L6 18M6 6l12 12" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
                                        </Svg>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </>
                    ) : (
                        <View style={styles.centered}>
                            <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                                <Circle cx={11} cy={11} r={8} stroke={colors.border} strokeWidth={1.5} />
                                <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={colors.border} strokeWidth={1.5} strokeLinecap="round" />
                            </Svg>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Search for songs, artists &amp; albums</Text>
                        </View>
                    )}
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {tabContent[activeTab]()}
                </View>
            )}
        </View>
    );
}

function AlbumRow({ album, colors }: { album: any; colors: any }) {
    const imageUrl = album.image ? getImageUrl(album.image, '150x150') : null;
    return (
        <View style={[albumStyles.row, { borderBottomColor: colors.border }]}>
            <Image
                source={{ uri: imageUrl ?? undefined }}
                style={albumStyles.image}
            />
            <View style={{ flex: 1 }}>
                <Text style={[albumStyles.name, { color: colors.text }]} numberOfLines={1}>{album.name ?? album.title ?? 'Unknown Album'}</Text>
                <Text style={[albumStyles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {album.primaryArtists ?? album.subtitle ?? ''}
                </Text>
            </View>
        </View>
    );
}

const albumStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 14 },
    image: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#DDD' },
    name: { fontSize: 15, fontWeight: '600' },
    sub: { fontSize: 12, marginTop: 3 },
});

function NotFound() {
    const { colors } = useTheme();
    return (
        <View style={styles.notFound}>
            <Text style={styles.notFoundEmoji}>😔</Text>
            <Text style={[styles.notFoundTitle, { color: colors.text }]}>Not Found</Text>
            <Text style={[styles.notFoundSub, { color: colors.textSecondary }]}>
                Sorry, the keyword you entered cannot be found.{'\n'}Please try a different search.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    backBtn: { padding: 4 },
    inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 22, paddingHorizontal: 14, gap: 8, borderWidth: 1.5, height: 48 },
    input: { flex: 1, fontSize: 15, paddingVertical: 0 },
    pillsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
    pill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    pillText: { fontSize: 13, fontWeight: '700' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    emptyText: { fontSize: 14 },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    recentTitle: { fontSize: 16, fontWeight: '700' },
    recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13 },
    recentItem: { fontSize: 15 },
    notFound: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 10 },
    notFoundEmoji: { fontSize: 64 },
    notFoundTitle: { fontSize: 20, fontWeight: '800' },
    notFoundSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

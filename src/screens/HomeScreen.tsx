import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, ScrollView, RefreshControl, Dimensions, StatusBar, Image,
    Modal, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import {
    searchSongs, getHomeData, getTrendingArtists, searchArtists,
    Song, Artist, getArtistNames, getImageUrl, formatDuration
} from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { RootStackParamList } from '../navigation/RootNavigator';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import AlbumCard from '../components/AlbumCard';
import SkeletonLoader from '../components/SkeletonLoader';
import Svg, { Path, Circle, Line } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;

const TABS = ['Suggested', 'Songs', 'Artists', 'Albums'];
const SORT_OPTIONS = ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added'];

const { width } = Dimensions.get('window');
const CARD_W = (width - 32) / 2; // for 2-column album grid

export default function HomeScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const setQueue = usePlayerStore((s) => s.setQueue);
    const { loadFavorites } = useFavoritesStore();

    const [activeTab, setActiveTab] = useState(0);
    const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
    const [mostPlayed, setMostPlayed] = useState<Song[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [songs, setSongs] = useState<Song[]>([]);
    const [sortOption, setSortOption] = useState('Ascending');
    const [showSort, setShowSort] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [songPage, setSongPage] = useState(1);
    const [totalSongs, setTotalSongs] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);
    const underlineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => { loadFavorites(); }, []);

    const fetchHome = useCallback(async () => {
        setLoading(true);
        try {
            const [homeData, artistsData, songsData] = await Promise.all([
                getHomeData(),
                getTrendingArtists(),
                searchSongs('hindi', 1, 20),
            ]);
            setRecentlyPlayed(homeData.trending.slice(0, 6));
            setMostPlayed(homeData.mostPlayed.slice(0, 6));
            setArtists(artistsData);
            setSongs(homeData.trending);
            setTotalSongs(songsData?.data?.total ?? 0);
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => { fetchHome(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHome();
        setRefreshing(false);
    };

    const switchTab = (index: number) => {
        setActiveTab(index);
        Animated.spring(underlineAnim, { toValue: index * (width / TABS.length), useNativeDriver: true }).start();
    };

    const loadMoreSongs = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const next = songPage + 1;
        const data = await searchSongs('hindi', next, 20);
        const newSongs = data?.data?.results ?? [];
        setSongs((prev) => [...prev, ...newSongs]);
        setSongPage(next);
        setLoadingMore(false);
    };

    const playSong = (song: Song, list: Song[]) => {
        const idx = list.findIndex((s) => s.id === song.id);
        setQueue(list, idx >= 0 ? idx : 0);
        navigation.navigate('Player');
    };

    const sortedSongs = [...songs].sort((a, b) => {
        if (sortOption === 'Ascending') return a.name.localeCompare(b.name);
        if (sortOption === 'Descending') return b.name.localeCompare(a.name);
        if (sortOption === 'Artist') return getArtistNames(a).localeCompare(getArtistNames(b));
        if (sortOption === 'Year') return (b.year ?? '').localeCompare(a.year ?? '');
        return 0;
    });

    const renderSuggested = () => (
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        >
            <View style={{ height: 8 }} />
            <Section title="Recently Played" onSeeAll={() => switchTab(1)}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 8 }}
                >
                    {loading
                        ? [...Array(4)].map((_, i) => <SkeletonLoader key={i} width={140} height={140} borderRadius={14} style={{ marginRight: 12 }} />)
                        : recentlyPlayed.map((song) => (
                            <TouchableOpacity key={song.id} style={styles.recentItem} onPress={() => playSong(song, recentlyPlayed)}>
                                <Image source={{ uri: getImageUrl(song.image, '150x150') ?? undefined }} style={styles.recentImage} />
                                <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={2}>{song.name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </Section>

            <Section title="Artists" onSeeAll={() => switchTab(2)}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 8 }}
                >
                    {loading
                        ? [...Array(4)].map((_, i) => <SkeletonLoader key={i} width={90} height={90} borderRadius={45} style={{ marginRight: 16 }} />)
                        : artists.map((a) => (
                            <ArtistCard key={a.id} artist={a} onPress={() => navigation.navigate('ArtistDetail', { artistId: a.id, artistName: a.name })} />
                        ))
                    }
                </ScrollView>
            </Section>

            <Section title="Most Played" onSeeAll={() => switchTab(1)}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 8 }}
                >
                    {loading
                        ? [...Array(4)].map((_, i) => <SkeletonLoader key={i} width={140} height={140} borderRadius={14} style={{ marginRight: 12 }} />)
                        : mostPlayed.map((song) => (
                            <TouchableOpacity key={song.id} style={styles.recentItem} onPress={() => playSong(song, mostPlayed)}>
                                <Image source={{ uri: getImageUrl(song.image, '150x150') ?? undefined }} style={styles.recentImage} />
                                <Text style={[styles.recentTitle, { color: colors.text }]} numberOfLines={2}>{song.name}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </ScrollView>
            </Section>
            <View style={{ height: 16 }} />
        </ScrollView>
    );

    const renderSongs = () => (
        <View style={{ flex: 1 }}>
            <View style={[styles.songsHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.songsCount, { color: colors.text }]}>{songs.length} songs</Text>
                <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(true)}>
                    <Text style={[styles.sortLabel, { color: Colors.primary }]}>{sortOption}</Text>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path d="M3 6h18M7 12h10M11 18h2" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                </TouchableOpacity>
            </View>
            <FlatList
                data={sortedSongs}
                keyExtractor={(item, i) => `${item.id}-${i}`}
                renderItem={({ item, index }) => (
                    <SongCard song={item} onPress={() => playSong(item, sortedSongs)} allSongs={sortedSongs} />
                )}
                onEndReached={loadMoreSongs}
                onEndReachedThreshold={0.4}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
            />
            <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}>
                <TouchableOpacity style={styles.sortOverlay} onPress={() => setShowSort(false)} activeOpacity={1}>
                    <View style={[styles.sortModal, { backgroundColor: colors.surfaceElevated }]}>
                        {SORT_OPTIONS.map((opt) => (
                            <TouchableOpacity key={opt} style={styles.sortRow} onPress={() => { setSortOption(opt); setShowSort(false); }}>
                                <Text style={[styles.sortOptText, { color: colors.text }]}>{opt}</Text>
                                <View style={[styles.radioOuter, { borderColor: sortOption === opt ? Colors.primary : colors.border }]}>
                                    {sortOption === opt && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );

    const renderArtists = () => (
        <FlatList
            key="artists-3col"
            data={artists}
            keyExtractor={(item) => item.id}
            numColumns={3}
            renderItem={({ item }) => (
                <ArtistCard artist={item} onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id, artistName: item.name })} columns />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        />
    );

    const renderAlbums = () => (
        <FlatList
            key="albums-2col"
            data={recentlyPlayed}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={({ item }) => (
                <AlbumCard
                    song={item}
                    onPress={() => navigation.navigate('AlbumDetail', {
                        albumName: item.album?.name ?? item.name,
                        albumArtist: getArtistNames(item),
                        songs: recentlyPlayed,
                        coverUrl: getImageUrl(item.image, '500x500') ?? getImageUrl(item.image, '150x150') ?? null,
                    })}
                />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 12 }}
        />
    );

    const tabContent = [renderSuggested, renderSongs, renderArtists, renderAlbums];

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.logoRow}>
                    <Image source={require('../../assets/splash-icon.png')} style={styles.logoIcon} />
                    <Text style={[styles.logoText, { color: colors.text }]}>Mume</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.searchBtn}>
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Circle cx={11} cy={11} r={8} stroke={colors.text} strokeWidth={2} />
                        <Line x1={21} y1={21} x2={16.65} y2={16.65} stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
                    </Svg>
                </TouchableOpacity>
            </View>

            <View style={styles.tabsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TABS.map((tab, i) => (
                        <TouchableOpacity key={tab} onPress={() => switchTab(i)} style={styles.tabItem}>
                            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive, { color: activeTab === i ? Colors.primary : colors.textSecondary }]}>
                                {tab}
                            </Text>
                            {activeTab === i && <View style={styles.tabUnderline} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={{ flex: 1 }}>
                {tabContent[activeTab]()}
            </View>
        </View>
    );
}

function Section({ title, onSeeAll, children }: { title: string; onSeeAll: () => void; children: React.ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
                <TouchableOpacity onPress={onSeeAll}>
                    <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logoIcon: { width: 34, height: 34, borderRadius: 10 },
    logoText: { fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
    searchBtn: { padding: 4 },
    tabsContainer: { borderBottomWidth: 1, paddingHorizontal: 16 },
    tabItem: { paddingHorizontal: 6, paddingVertical: 12, marginRight: 16, alignItems: 'center' },
    tabText: { fontSize: 15, fontWeight: '500' },
    tabTextActive: { fontWeight: '700' },
    tabUnderline: { height: 3, width: '100%', backgroundColor: Colors.primary, borderRadius: 2, marginTop: 4 },
    section: { marginTop: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    seeAll: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
    hScroll: {},
    recentItem: { width: 140, marginRight: 12 },
    recentImage: { width: 140, height: 140, borderRadius: 14, backgroundColor: '#EEE' },
    recentTitle: { fontSize: 13, fontWeight: '600', marginTop: 8, lineHeight: 18 },
    songsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
    songsCount: { fontSize: 15, fontWeight: '700' },
    sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    sortLabel: { fontWeight: '600', fontSize: 14 },
    sortOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 100, paddingRight: 20 },
    sortModal: { width: 200, borderRadius: 16, paddingVertical: 8, elevation: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12 },
    sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
    sortOptText: { fontSize: 14, fontWeight: '500' },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
});

import React, { useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { useFavoritesStore } from '../store/favoritesStore';
import { usePlayerStore } from '../store/playerStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import SongCard from '../components/SongCard';
import Svg, { Path, Circle } from 'react-native-svg';

type Nav = StackNavigationProp<RootStackParamList>;

export default function FavoritesScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const { favorites, loadFavorites } = useFavoritesStore();
    const setQueue = usePlayerStore((s) => s.setQueue);

    useEffect(() => { loadFavorites(); }, []);

    const playSong = (index: number) => {
        setQueue(favorites, index);
        navigation.navigate('Player');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Favourites</Text>
                <Text style={[styles.count, { color: colors.textSecondary }]}>{favorites.length} songs</Text>
            </View>

            {favorites.length === 0 ? (
                <View style={styles.empty}>
                    <Svg width={72} height={72} viewBox="0 0 24 24" fill="none">
                        <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={colors.border} strokeWidth={1.5} />
                    </Svg>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No favourites yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Tap the heart icon on any song to add it here</Text>
                    <TouchableOpacity style={styles.discoverBtn} onPress={() => navigation.navigate('Search')}>
                        <Text style={styles.discoverText}>Discover Music</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item, i) => `${item.id}-${i}`}
                    renderItem={({ item, index }) => (
                        <SongCard song={item} onPress={() => playSong(index)} allSongs={favorites} />
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '800' },
    count: { fontSize: 14 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
    discoverBtn: { marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30 },
    discoverText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});

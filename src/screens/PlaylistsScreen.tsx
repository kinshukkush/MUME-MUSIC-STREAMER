import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, TextInput, Alert, Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useDownloadsStore } from '../store/downloadsStore';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface Playlist {
    id: string;
    name: string;
    songCount: number;
    createdAt: string;
}

const PLAYLISTS_KEY = 'mume_playlists';
type Nav = StackNavigationProp<RootStackParamList>;

export default function PlaylistsScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<Nav>();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const { downloads } = useDownloadsStore();

    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.getItem(PLAYLISTS_KEY).then((data) => {
                if (data) setPlaylists(JSON.parse(data));
                else setPlaylists([]);
            });
        }, [])
    );

    const createPlaylist = async () => {
        if (!newName.trim()) return;
        const pl: Playlist = {
            id: Date.now().toString(),
            name: newName.trim(),
            songCount: 0,
            createdAt: new Date().toISOString()
        };
        const updated = [...playlists, pl];
        setPlaylists(updated);
        await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
        setNewName('');
        setShowModal(false);
    };

    const deletePlaylist = (id: string) => {
        Alert.alert('Delete Playlist', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    const updated = playlists.filter((p) => p.id !== id);
                    setPlaylists(updated);
                    await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
                    // Also remove the songs stored for this playlist
                    await AsyncStorage.removeItem(`mume_playlist_songs_${id}`);
                }
            },
        ]);
    };

    const openPlaylist = (item: Playlist) => {
        navigation.navigate('PlaylistDetail', { playlistId: item.id, playlistName: item.name });
    };

    const openDownloads = () => {
        navigation.navigate('PlaylistDetail', { playlistId: 'downloads', playlistName: 'Downloads' });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Playlists</Text>
                <TouchableOpacity
                    onPress={() => setShowModal(true)}
                    style={[styles.addBtn, { backgroundColor: Colors.primary }]}
                    activeOpacity={0.85}>
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {/* Downloads Section */}
            <TouchableOpacity
                style={[styles.playlistItem, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}
                onPress={openDownloads}
                activeOpacity={0.8}>
                <View style={[styles.playlistIcon, { backgroundColor: Colors.primary }]}>
                    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.playlistName, { color: colors.text }]}>Downloads</Text>
                    <Text style={[styles.playlistMeta, { color: colors.textSecondary }]}>{downloads.length} songs · Offline listening</Text>
                </View>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18l6-6-6-6" stroke={colors.textSecondary ?? '#888'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
            </TouchableOpacity>

            {playlists.length === 0 ? (
                <View style={styles.empty}>
                    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
                        <Rect x={3} y={5} width={14} height={2} rx={1} fill={colors.border} />
                        <Rect x={3} y={10} width={10} height={2} rx={1} fill={colors.border} />
                        <Rect x={3} y={15} width={8} height={2} rx={1} fill={colors.border} />
                        <Circle cx={18} cy={15} r={3} stroke={colors.border} strokeWidth={1.5} />
                    </Svg>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No playlists yet</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Create your first playlist</Text>
                    <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
                        <Text style={styles.createBtnText}>Create Playlist</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={playlists}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.playlistItem, { borderBottomColor: colors.border }]}
                            onPress={() => openPlaylist(item)}
                            onLongPress={() => deletePlaylist(item.id)}
                            activeOpacity={0.8}>
                            <View style={[styles.playlistIcon, { backgroundColor: Colors.primary + '20' }]}>
                                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                                    <Path d="M9 18V5l12-2v13" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" />
                                    <Circle cx={6} cy={18} r={3} stroke={Colors.primary} strokeWidth={2} />
                                    <Circle cx={18} cy={16} r={3} stroke={Colors.primary} strokeWidth={2} />
                                </Svg>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.playlistName, { color: colors.text }]}>{item.name}</Text>
                                <Text style={[styles.playlistMeta, { color: colors.textSecondary }]}>{item.songCount} songs · Long press to delete</Text>
                            </View>
                            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                                <Path d="M9 18l6-6-6-6" stroke={colors.textSecondary ?? '#888'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                        </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>New Playlist</Text>
                        <TextInput
                            autoFocus
                            placeholder="Playlist name..."
                            placeholderTextColor={colors.textSecondary}
                            value={newName}
                            onChangeText={setNewName}
                            returnKeyType="done"
                            onSubmitEditing={createPlaylist}
                            style={[styles.modalInput, {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: colors.background
                            }]}
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={[styles.modalBtn, { borderColor: colors.border }]} onPress={() => setShowModal(false)}>
                                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]} onPress={createPlaylist}>
                                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
    title: { fontSize: 24, fontWeight: '800' },
    addBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
    addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptySubtitle: { fontSize: 13, textAlign: 'center' },
    createBtn: { marginTop: 8, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 30 },
    createBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
    playlistItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14, borderBottomWidth: 1 },
    playlistIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    playlistName: { fontSize: 15, fontWeight: '700' },
    playlistMeta: { fontSize: 12, marginTop: 3 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalCard: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, gap: 16 },
    modalTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
    modalInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
    modalBtns: { flexDirection: 'row', gap: 12 },
    modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, alignItems: 'center' },
    modalBtnText: { fontSize: 15, fontWeight: '700' },
});

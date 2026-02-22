import React, { useEffect, useState } from 'react';
import {
    Modal, View, Text, StyleSheet, TouchableOpacity, FlatList,
    TextInput, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Song, getArtistNames } from '../services/api';
import Svg, { Path, Circle } from 'react-native-svg';

const PLAYLISTS_KEY = 'mume_playlists';
const PLAYLIST_SONGS_PREFIX = 'mume_playlist_songs_';

interface Playlist {
    id: string;
    name: string;
    songCount: number;
    createdAt: string;
}

interface Props {
    visible: boolean;
    song: Song | null;
    onClose: () => void;
}

export default function PlaylistPickerModal({ visible, song, onClose }: Props) {
    const { colors, isDark } = useTheme();
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        if (visible) loadPlaylists();
    }, [visible]);

    const loadPlaylists = async () => {
        const data = await AsyncStorage.getItem(PLAYLISTS_KEY);
        if (data) setPlaylists(JSON.parse(data));
        else setPlaylists([]);
    };

    const addToPlaylist = async (playlist: Playlist) => {
        if (!song) return;
        const key = PLAYLIST_SONGS_PREFIX + playlist.id;
        const existing = await AsyncStorage.getItem(key);
        const currentSongs: Song[] = existing ? JSON.parse(existing) : [];
        const alreadyIn = currentSongs.find((s) => s.id === song.id);
        if (alreadyIn) {
            Alert.alert('Already Added', `"${song.name}" is already in "${playlist.name}"`);
            return;
        }
        const updated = [...currentSongs, song];
        await AsyncStorage.setItem(key, JSON.stringify(updated));

        // Update song count on the playlist list
        const allPlaylists: Playlist[] = playlists.map((p) =>
            p.id === playlist.id ? { ...p, songCount: p.songCount + 1 } : p
        );
        await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(allPlaylists));
        setPlaylists(allPlaylists);

        Alert.alert('Added!', `"${song.name}" added to "${playlist.name}"`, [{ text: 'OK', onPress: onClose }]);
    };

    const createAndAdd = async () => {
        if (!newName.trim()) return;
        const pl: Playlist = {
            id: Date.now().toString(),
            name: newName.trim(),
            songCount: song ? 1 : 0,
            createdAt: new Date().toISOString(),
        };
        const allPlaylists = [...playlists, pl];
        await AsyncStorage.setItem(PLAYLISTS_KEY, JSON.stringify(allPlaylists));
        if (song) {
            const key = PLAYLIST_SONGS_PREFIX + pl.id;
            await AsyncStorage.setItem(key, JSON.stringify([song]));
        }
        setNewName('');
        setCreating(false);
        loadPlaylists();
        Alert.alert('Done!', `Playlist "${pl.name}" created and song added!`, [{ text: 'OK', onPress: onClose }]);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrapper}>
                <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
                    {/* Handle */}
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />

                    <Text style={[styles.title, { color: colors.text }]}>Add to Playlist</Text>
                    {song && (
                        <Text style={[styles.songName, { color: colors.textSecondary }]} numberOfLines={1}>
                            {song.name} · {getArtistNames(song)}
                        </Text>
                    )}

                    {playlists.length === 0 && !creating ? (
                        <View style={styles.emptyState}>
                            <Text style={{ fontSize: 36 }}>🎵</Text>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No playlists yet</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={playlists}
                            keyExtractor={(p) => p.id}
                            style={styles.list}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.playlistRow, { borderBottomColor: colors.border }]}
                                    onPress={() => addToPlaylist(item)}
                                    activeOpacity={0.75}
                                >
                                    <View style={[styles.playlistIcon, { backgroundColor: Colors.primary + '22' }]}>
                                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                            <Path d="M9 18V5l12-2v13" stroke={Colors.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            <Circle cx={6} cy={18} r={3} stroke={Colors.primary} strokeWidth={2} />
                                            <Circle cx={18} cy={16} r={3} stroke={Colors.primary} strokeWidth={2} />
                                        </Svg>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.playlistName, { color: colors.text }]}>{item.name}</Text>
                                        <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>{item.songCount} songs</Text>
                                    </View>
                                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                        <Path d="M9 18l6-6-6-6" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </Svg>
                                </TouchableOpacity>
                            )}
                        />
                    )}

                    {/* Create New Playlist inline */}
                    {creating ? (
                        <View style={[styles.createRow, { borderTopColor: colors.border }]}>
                            <TextInput
                                autoFocus
                                placeholder="Playlist name..."
                                placeholderTextColor={colors.textSecondary}
                                value={newName}
                                onChangeText={setNewName}
                                style={[styles.createInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                                returnKeyType="done"
                                onSubmitEditing={createAndAdd}
                            />
                            <TouchableOpacity onPress={createAndAdd} style={[styles.confirmBtn, { backgroundColor: Colors.primary }]}>
                                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Create & Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setCreating(false); setNewName(''); }} style={styles.cancelBtn}>
                                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.newBtn, { borderColor: Colors.primary, borderTopColor: colors.border }]}
                            onPress={() => setCreating(true)}
                        >
                            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                                <Path d="M12 5v14M5 12h14" stroke={Colors.primary} strokeWidth={2.5} strokeLinecap="round" />
                            </Svg>
                            <Text style={{ color: Colors.primary, fontWeight: '700', fontSize: 15 }}>New Playlist</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheetWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 12,
        paddingBottom: 32,
        maxHeight: 500,
        elevation: 24,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 16,
    },
    handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
    title: { fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
    songName: { fontSize: 13, textAlign: 'center', marginBottom: 12, paddingHorizontal: 24 },
    emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyText: { fontSize: 14 },
    list: { maxHeight: 240 },
    playlistRow: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth
    },
    playlistIcon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    playlistName: { fontSize: 15, fontWeight: '600' },
    playlistCount: { fontSize: 12, marginTop: 2 },
    createRow: { paddingHorizontal: 20, paddingTop: 14, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
    createInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },
    confirmBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    cancelBtn: { alignItems: 'center', paddingVertical: 8 },
    newBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, marginHorizontal: 20, marginTop: 14,
        borderRadius: 30, borderWidth: 2, paddingVertical: 13,
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Song, getImageUrl, getArtistNames } from '../services/api';
import { Colors } from '../theme/colors';

interface Props {
    song: Song;
    onPress: () => void;
}

export default function AlbumCard({ song, onPress }: Props) {
    const { colors } = useTheme();
    const imageUrl = getImageUrl(song.image, '150x150');

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <Image source={{ uri: imageUrl ?? undefined }} style={styles.image} />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{song.album?.name ?? song.name}</Text>
            <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{getArtistNames(song)}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { width: '48%', margin: '1%', marginBottom: 16 },
    image: { width: '100%', aspectRatio: 1, borderRadius: 14, backgroundColor: '#DDD' },
    name: { fontSize: 13, fontWeight: '700', marginTop: 8 },
    artist: { fontSize: 11, marginTop: 2 },
});

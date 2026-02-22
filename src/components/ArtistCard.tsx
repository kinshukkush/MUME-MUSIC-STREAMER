import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Artist, getImageUrl } from '../services/api';
import { Colors } from '../theme/colors';

interface Props {
    artist: Artist;
    onPress: () => void;
    columns?: boolean;
}

export default function ArtistCard({ artist, onPress, columns }: Props) {
    const { colors } = useTheme();
    const imageUrl = getImageUrl(artist.image as any, '150x150');

    if (columns) {
        return (
            <TouchableOpacity style={styles.colItem} onPress={onPress} activeOpacity={0.8}>
                <Image source={{ uri: imageUrl ?? undefined }} style={styles.colImage} />
                <Text style={[styles.colName, { color: colors.text }]} numberOfLines={1}>{artist.name}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <Image source={{ uri: imageUrl ?? undefined }} style={styles.image} />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{artist.name}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { width: 90, marginRight: 16, alignItems: 'center' },
    image: { width: 86, height: 86, borderRadius: 43, backgroundColor: '#DDD', borderWidth: 2, borderColor: Colors.primary },
    name: { fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
    colItem: { width: '33.3%', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
    colImage: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#DDD', borderWidth: 2, borderColor: Colors.primary },
    colName: { fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
});

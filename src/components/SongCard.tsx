import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Song, getImageUrl, getArtistNames, formatDuration } from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import Svg, { Path, Circle } from 'react-native-svg';
import PlaylistPickerModal from './PlaylistPickerModal';

interface Props {
    song: Song;
    onPress: () => void;
    allSongs?: Song[];
}

export default function SongCard({ song, onPress, allSongs }: Props) {
    const { colors } = useTheme();
    const imageUrl = getImageUrl(song.image, '150x150');
    const artist = getArtistNames(song);
    const duration = formatDuration(song.duration);
    const iconColor = colors.textSecondary ?? '#888';
    const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            <TouchableOpacity style={styles.left} onPress={onPress} activeOpacity={0.8}>
                <Image source={{ uri: imageUrl ?? undefined }} style={styles.image} />
                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{song.name}</Text>
                    <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={1}>
                        {artist}  ·  {duration}
                    </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.actions}>
                {/* Play button */}
                <TouchableOpacity onPress={onPress} style={styles.playBtn} activeOpacity={0.85}>
                    <Svg width={36} height={36} viewBox="0 0 36 36">
                        <Circle cx={18} cy={18} r={18} fill={Colors.primary} />
                        <Path d="M14 11.5l12 6.5-12 6.5V11.5z" fill="#FFF" />
                    </Svg>
                </TouchableOpacity>

                {/* Add to playlist button */}
                <TouchableOpacity
                    onPress={() => setShowPlaylistPicker(true)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.addBtn}
                    activeOpacity={0.7}
                >
                    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path d="M12 5v14M5 12h14" stroke={iconColor} strokeWidth={2.5} strokeLinecap="round" />
                    </Svg>
                </TouchableOpacity>
            </View>

            {/* Playlist Picker Modal */}
            <PlaylistPickerModal
                visible={showPlaylistPicker}
                song={song}
                onClose={() => setShowPlaylistPicker(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
    image: { width: 54, height: 54, borderRadius: 10, backgroundColor: '#DDD' },
    info: { flex: 1 },
    name: { fontSize: 15, fontWeight: '600' },
    sub: { fontSize: 12, marginTop: 3 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    playBtn: {},
    addBtn: { padding: 4 },
});

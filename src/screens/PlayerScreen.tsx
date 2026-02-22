import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Image,
    Dimensions, StatusBar, Animated, ScrollView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { usePlayerStore } from '../store/playerStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { getImageUrl, getArtistNames, formatDuration } from '../services/api';
import { RootStackParamList } from '../navigation/RootNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path, Rect, Circle, Polyline } from 'react-native-svg';
import * as FileSystem from 'expo-file-system/legacy';
import { useDownloadsStore } from '../store/downloadsStore';

type Nav = StackNavigationProp<RootStackParamList>;
const { width, height } = Dimensions.get('window');

const LYRICS_PLACEHOLDER = [
    '🎵 Let the music take you away',
    'Feel every beat, every note',
    '✨ Close your eyes and just listen',
    'Let the rhythm set you free',
    '🎶 Every song tells a story',
    'Let yours begin right here',
    'The melody flows like a river',
    '🌊 Carrying you to distant shores',
    'Where music meets the soul',
    '💫 And silence speaks the loudest',
    'Lose yourself in the harmony',
    '🎸 Every chord strikes deeper',
    'Feel the bassline in your bones',
    'Let the treble lift your spirit',
];

export default function PlayerScreen() {
    const navigation = useNavigation<Nav>();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    const {
        currentSong, isPlaying, isLoading, position, duration,
        shuffle, repeatMode, playPause, next, prev, seekTo, toggleShuffle, cycleRepeat, addToQueue
    } = usePlayerStore();
    const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
    const { addDownload, isDownloaded } = useDownloadsStore();

    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);

    const albumArtScale = useRef(new Animated.Value(1)).current;
    const albumArtRotate = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const lyricsOpacity = useRef(new Animated.Value(0)).current;
    const lyricsTranslateY = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Rotation animation for album art when playing
    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.timing(albumArtRotate, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            albumArtRotate.stopAnimation();
        }
    }, [isPlaying]);

    // Pulse animation for play button
    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isPlaying]);

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { 
            toValue: 1, 
            duration: 500, 
            useNativeDriver: true,
        }).start();
    }, [currentSong?.id]);

    useEffect(() => {
        Animated.spring(albumArtScale, {
            toValue: isPlaying ? 1.02 : 0.95,
            useNativeDriver: true,
            damping: 12,
            stiffness: 100,
        }).start();
    }, [isPlaying]);

    const toggleLyrics = () => {
        const next = !showLyrics;
        setShowLyrics(next);
        
        if (next) {
            Animated.parallel([
                Animated.timing(lyricsOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(lyricsTranslateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 100,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(lyricsOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(lyricsTranslateY, {
                    toValue: 50,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    if (!currentSong) return null;

    const imageUrl = getImageUrl(currentSong.image, '500x500') ?? getImageUrl(currentSong.image, '150x150');
    const artistName = getArtistNames(currentSong);
    const fav = isFavorite(currentSong.id);
    const downloaded = isDownloaded(currentSong.id);
    const currentPos = isSeeking ? seekValue : position;

    const seekRelative = (secs: number) => {
        const newPos = Math.max(0, Math.min(duration, currentPos + secs));
        seekTo(newPos);
    };

    const handleDownload = async () => {
        if (downloaded) {
            Alert.alert('Already Downloaded', 'This song is already in your downloads.');
            return;
        }
        if (downloading) return;
        
        setDownloading(true);
        const urls = currentSong.downloadUrl;
        const audioUrl = urls?.find((u) => u.quality === '96kbps')?.link
            || urls?.find((u) => u.quality === '96kbps')?.url
            || urls?.[urls.length - 1]?.link
            || urls?.[urls.length - 1]?.url;
        
        if (!audioUrl) { 
            setDownloading(false); 
            Alert.alert('Download Failed', 'No download URL available for this song.');
            return; 
        }
        
        try {
            const fileUri = `${FileSystem.documentDirectory ?? ''}${currentSong.id}.mp4`;
            const res = await FileSystem.downloadAsync(audioUrl, fileUri);
            addDownload({ 
                id: currentSong.id, 
                name: currentSong.name, 
                artist: artistName, 
                localUri: res.uri, 
                imageUrl: imageUrl, 
                duration: currentSong.duration 
            });
            Alert.alert('Download Complete', `${currentSong.name} has been downloaded.`);
        } catch (error) {
            Alert.alert('Download Failed', 'Unable to download this song. Please try again.');
        }
        setDownloading(false);
    };

    const spin = albumArtRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            
            {imageUrl && (
                <>
                    <Animated.Image 
                        source={{ uri: imageUrl }} 
                        style={[styles.bgImage, { opacity: isDark ? 0.25 : 0.15 }]} 
                        blurRadius={50} 
                    />
                    <LinearGradient
                        colors={
                            isDark 
                                ? ['rgba(0,0,0,0.4)', colors.background + 'DD', colors.background] 
                                : ['rgba(245,166,35,0.08)', colors.background + 'EE', colors.background]
                        }
                        style={StyleSheet.absoluteFill}
                    />
                </>
            )}

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
                <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={[styles.iconBtn, { backgroundColor: colors.surface + '40' }]} 
                        activeOpacity={0.8}
                    >
                        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                            <Path 
                                d="M19 12H5M5 12l7-7M5 12l7 7" 
                                stroke={colors.text} 
                                strokeWidth={2.2} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </Svg>
                    </TouchableOpacity>
                    
                    <View style={{ alignItems: 'center', flex: 1 }}>
                        <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>NOW PLAYING</Text>
                        <Text style={[styles.headerAlbum, { color: colors.text }]} numberOfLines={1}>
                            {currentSong.album?.name ?? 'Unknown Album'}
                        </Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.iconBtn, { backgroundColor: colors.surface + '40' }]} 
                        activeOpacity={0.8}
                    >
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Circle cx={12} cy={5} r={1.8} fill={colors.text} />
                            <Circle cx={12} cy={12} r={1.8} fill={colors.text} />
                            <Circle cx={12} cy={19} r={1.8} fill={colors.text} />
                        </Svg>
                    </TouchableOpacity>
                </View>
                
                <Animated.View 
                    style={[
                        styles.albumContainer, 
                        { 
                            transform: [
                                { scale: albumArtScale },
                                { rotate: isPlaying ? spin : '0deg' }
                            ], 
                            opacity: fadeAnim 
                        }
                    ]}
                >
                    <View style={styles.albumArtWrapper}>
                        <Image source={{ uri: imageUrl ?? undefined }} style={styles.albumArt} />
                        <View style={styles.vinylOverlay}>
                            <View style={styles.vinylCenter} />
                        </View>
                        {isLoading && (
                            <View style={styles.loadingOverlay}>
                                <Animated.View style={[styles.loadingDot, { backgroundColor: Colors.primary }]} />
                            </View>
                        )}
                    </View>
                </Animated.View>
                
                <View style={styles.metaRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={2}>
                            {currentSong.name}
                        </Text>
                        <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                            {artistName}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => fav ? removeFavorite(currentSong.id) : addFavorite(currentSong)}
                        style={[styles.heartBtn, { backgroundColor: fav ? Colors.primary + '20' : colors.surface + '40' }]}
                        activeOpacity={0.7}
                    >
                        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                            <Path
                                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                fill={fav ? Colors.primary : 'none'}
                                stroke={fav ? Colors.primary : colors.textSecondary}
                                strokeWidth={2}
                            />
                        </Svg>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.seekContainer}>
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        value={currentPos}
                        minimumTrackTintColor={Colors.primary}
                        maximumTrackTintColor={colors.border}
                        thumbTintColor={Colors.primary}
                        onSlidingStart={() => { setIsSeeking(true); setSeekValue(position); }}
                        onValueChange={(v: number) => setSeekValue(v)}
                        onSlidingComplete={(v: number) => { setIsSeeking(false); seekTo(v); }}
                    />
                    <View style={styles.timeRow}>
                        <Text style={[styles.timeText, { color: Colors.primary }]}>
                            {formatDuration(Math.floor(currentPos))}
                        </Text>
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                            {formatDuration(Math.floor(duration))}
                        </Text>
                    </View>
                </View>
                
                <View style={styles.controls}>
                    <TouchableOpacity 
                        onPress={prev} 
                        style={[styles.navBtn, { backgroundColor: colors.surface + '40' }]} 
                        activeOpacity={0.7}
                    >
                        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                            <Path d="M19 20L9 12l10-8v16z" fill={colors.text} />
                            <Rect x={5} y={4} width={2} height={16} rx={1} fill={colors.text} />
                        </Svg>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => seekRelative(-10)} 
                        style={[styles.seekBtn, { backgroundColor: colors.surface + '40' }]} 
                        activeOpacity={0.7}
                    >
                        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                            <Path 
                                d="M2.5 12C2.5 6.75 6.75 2.5 12 2.5a9.5 9.5 0 017.19 3.31" 
                                stroke={colors.text} 
                                strokeWidth={2} 
                                strokeLinecap="round" 
                            />
                            <Path 
                                d="M16 3l3.5 2.5L16 8" 
                                stroke={colors.text} 
                                strokeWidth={2} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </Svg>
                        <Text style={[styles.seekLabel, { color: colors.text }]}>10</Text>
                    </TouchableOpacity>

                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <TouchableOpacity 
                            onPress={playPause} 
                            style={[styles.playBtn, { backgroundColor: Colors.primary }]} 
                            activeOpacity={0.85}
                        >
                            {isPlaying ? (
                                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                                    <Rect x={6} y={4} width={4} height={16} rx={2} fill="#FFF" />
                                    <Rect x={14} y={4} width={4} height={16} rx={2} fill="#FFF" />
                                </Svg>
                            ) : (
                                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                                    <Path d="M6 4l14 8-14 8V4z" fill="#FFF" />
                                </Svg>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    <TouchableOpacity 
                        onPress={() => seekRelative(10)} 
                        style={[styles.seekBtn, { backgroundColor: colors.surface + '40' }]} 
                        activeOpacity={0.7}
                    >
                        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                            <Path 
                                d="M21.5 12C21.5 6.75 17.25 2.5 12 2.5a9.5 9.5 0 00-7.19 3.31" 
                                stroke={colors.text} 
                                strokeWidth={2} 
                                strokeLinecap="round" 
                            />
                            <Path 
                                d="M8 3L4.5 5.5 8 8" 
                                stroke={colors.text} 
                                strokeWidth={2} 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        </Svg>
                        <Text style={[styles.seekLabel, { color: colors.text }]}>10</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={next} 
                        style={[styles.navBtn, { backgroundColor: colors.surface + '40' }]} 
                        activeOpacity={0.7}
                    >
                        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                            <Path d="M5 4l10 8-10 8V4z" fill={colors.text} />
                            <Rect x={17} y={4} width={2} height={16} rx={1} fill={colors.text} />
                        </Svg>
                    </TouchableOpacity>
                </View>
                
                <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
                    <TouchableOpacity 
                        onPress={toggleShuffle} 
                        style={styles.actionBtn} 
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.actionIconWrapper, 
                            { backgroundColor: shuffle ? Colors.primary + '20' : 'transparent' }
                        ]}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path 
                                    d="M16 3h5v5M4 20l16-16M16 20h5v-5M4 4l16 16" 
                                    stroke={shuffle ? Colors.primary : colors.textSecondary} 
                                    strokeWidth={2} 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                            </Svg>
                        </View>
                        <Text style={[styles.actionLabel, { color: shuffle ? Colors.primary : colors.textSecondary }]}>
                            Shuffle
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={cycleRepeat} 
                        style={styles.actionBtn} 
                        activeOpacity={0.7}
                    >
                        <View style={[
                            styles.actionIconWrapper, 
                            { backgroundColor: repeatMode !== 'off' ? Colors.primary + '20' : 'transparent' }
                        ]}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path 
                                    d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" 
                                    stroke={repeatMode !== 'off' ? Colors.primary : colors.textSecondary} 
                                    strokeWidth={2} 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                {repeatMode === 'one' && <Circle cx={12} cy={12} r={2.5} fill={Colors.primary} />}
                            </Svg>
                        </View>
                        <Text style={[styles.actionLabel, { color: repeatMode !== 'off' ? Colors.primary : colors.textSecondary }]}>
                            {repeatMode === 'one' ? 'Repeat 1' : 'Repeat'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleDownload} 
                        style={styles.actionBtn} 
                        activeOpacity={0.7}
                        disabled={downloading}
                    >
                        <View style={[
                            styles.actionIconWrapper, 
                            { backgroundColor: downloaded ? Colors.primary + '20' : 'transparent' }
                        ]}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path 
                                    d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" 
                                    stroke={downloaded ? Colors.primary : colors.textSecondary} 
                                    strokeWidth={2} 
                                    strokeLinecap="round" 
                                />
                                <Polyline 
                                    points="7 10 12 15 17 10" 
                                    stroke={downloaded ? Colors.primary : colors.textSecondary} 
                                    strokeWidth={2} 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                <Path 
                                    d="M12 15V3" 
                                    stroke={downloaded ? Colors.primary : colors.textSecondary} 
                                    strokeWidth={2} 
                                    strokeLinecap="round" 
                                />
                            </Svg>
                        </View>
                        <Text style={[styles.actionLabel, { color: downloaded ? Colors.primary : colors.textSecondary }]}>
                            {downloading ? 'Downloading' : downloaded ? 'Downloaded' : 'Download'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => navigation.navigate('Queue')} 
                        style={styles.actionBtn} 
                        activeOpacity={0.7}
                    >
                        <View style={styles.actionIconWrapper}>
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                                <Path 
                                    d="M9 18V5l12-2v13" 
                                    stroke={colors.textSecondary} 
                                    strokeWidth={2} 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                />
                                <Circle cx={6} cy={18} r={3} stroke={colors.textSecondary} strokeWidth={2} />
                                <Circle cx={18} cy={16} r={3} stroke={colors.textSecondary} strokeWidth={2} />
                            </Svg>
                        </View>
                        <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Queue</Text>
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    onPress={toggleLyrics}
                    style={[
                        styles.lyricsToggle,
                        { 
                            backgroundColor: showLyrics ? Colors.primary : colors.surface,
                            borderColor: showLyrics ? Colors.primary : colors.border 
                        }
                    ]}
                    activeOpacity={0.8}
                >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path
                            d={showLyrics ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"}
                            stroke={showLyrics ? '#FFF' : colors.text}
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <Text style={[styles.lyricsToggleText, { color: showLyrics ? '#FFF' : colors.text }]}>
                        {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                    </Text>
                </TouchableOpacity>
                
                {showLyrics && (
                    <Animated.View 
                        style={[
                            styles.lyricsSection,
                            { 
                                backgroundColor: colors.surface,
                                borderColor: colors.border,
                                opacity: lyricsOpacity,
                                transform: [{ translateY: lyricsTranslateY }]
                            }
                        ]}
                    >
                        <View style={[styles.lyricsSectionHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.lyricsSectionTitle, { color: colors.text }]}>Lyrics</Text>
                        </View>
                        <ScrollView 
                            style={styles.lyricsScrollView}
                            showsVerticalScrollIndicator={false} 
                            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
                        >
                            {LYRICS_PLACEHOLDER.map((line, idx) => (
                                <Text
                                    key={idx}
                                    style={[
                                        styles.lyricsLine,
                                        { 
                                            color: idx % 3 === 0 ? Colors.primary : colors.text,
                                            opacity: idx === 0 ? 1 : 0.85,
                                        },
                                    ]}
                                >
                                    {line}
                                </Text>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgImage: { 
        ...StyleSheet.absoluteFillObject, 
        width: '100%', 
        height: '100%',
    },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 28,
        paddingHorizontal: 20,
    },
    headerLabel: { 
        fontSize: 10, 
        fontWeight: '700', 
        letterSpacing: 1.5, 
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    headerAlbum: { 
        fontSize: 14, 
        fontWeight: '700', 
        maxWidth: 200, 
        textAlign: 'center' 
    },
    iconBtn: { 
        padding: 10, 
        borderRadius: 12,
    },
    albumContainer: {
        width: width - 80,
        height: width - 80,
        borderRadius: 200,
        overflow: 'hidden',
        alignSelf: 'center',
        elevation: 20,
        shadowColor: Colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 10 },
        marginBottom: 32,
    },
    albumArtWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    albumArt: { 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#1a1a1a',
    },
    vinylOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    vinylCenter: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    loadingOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(0,0,0,0.4)' 
    },
    loadingDot: { width: 18, height: 18, borderRadius: 9 },
    metaRow: { 
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    songTitle: { 
        fontSize: 26, 
        fontWeight: '800', 
        letterSpacing: 0.2,
        lineHeight: 32,
        marginBottom: 6,
    },
    songArtist: { 
        fontSize: 16, 
        fontWeight: '500',
    },
    heartBtn: { 
        marginLeft: 16, 
        padding: 10,
        borderRadius: 12,
    },
    seekContainer: { 
        marginTop: 8,
        paddingHorizontal: 24,
    },
    timeRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: -6,
        paddingHorizontal: 4,
    },
    timeText: { 
        fontSize: 13, 
        fontWeight: '600' 
    },
    controls: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-evenly', 
        marginTop: 24,
        paddingHorizontal: 16,
    },
    navBtn: { 
        padding: 12,
        borderRadius: 12,
    },
    seekBtn: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 12, 
        position: 'relative',
        borderRadius: 12,
    },
    seekLabel: { 
        fontSize: 10, 
        fontWeight: '800', 
        position: 'absolute', 
        bottom: 10 
    },
    playBtn: { 
        width: 76, 
        height: 76, 
        borderRadius: 38, 
        alignItems: 'center', 
        justifyContent: 'center', 
        elevation: 12, 
        shadowColor: Colors.primary, 
        shadowOpacity: 0.6, 
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
    },
    bottomActions: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        marginTop: 32,
        paddingHorizontal: 16,
        alignItems: 'center' 
    },
    actionBtn: { 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 6,
    },
    actionIconWrapper: {
        padding: 10,
        borderRadius: 12,
    },
    actionLabel: {
        fontSize: 11,
        fontWeight: '600',
    },
    lyricsToggle: {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
        gap: 8, 
        paddingVertical: 14,
        marginHorizontal: 24,
        marginTop: 20,
        marginBottom: 16,
        borderRadius: 14,
        borderWidth: 2,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    lyricsToggleText: { 
        fontSize: 15, 
        fontWeight: '700' 
    },
    lyricsSection: {
        marginHorizontal: 24,
        marginTop: 16,
        marginBottom: 20,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        maxHeight: 400,
    },
    lyricsSectionHeader: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
    },
    lyricsSectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
    },
    lyricsScrollView: {
        maxHeight: 320,
    },
    lyricsLine: { 
        fontSize: 17, 
        lineHeight: 36, 
        fontWeight: '600',
        marginBottom: 4,
    },
});

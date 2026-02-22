import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../services/api';
import { Audio, AVPlaybackStatus } from 'expo-av';

export type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
    currentSong: Song | null;
    queue: Song[];
    currentIndex: number;
    isPlaying: boolean;
    isLoading: boolean;
    position: number;
    duration: number;
    shuffle: boolean;
    repeatMode: RepeatMode;
    sound: Audio.Sound | null;
    setCurrentSong: (song: Song) => void;
    setQueue: (songs: Song[], startIndex?: number) => void;
    addToQueue: (song: Song) => void;
    removeFromQueue: (index: number) => void;
    reorderQueue: (from: number, to: number) => void;
    playPause: () => void;
    next: () => void;
    prev: () => void;
    seekTo: (position: number) => void;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    updatePosition: (pos: number, dur: number) => void;
    stopPlayer: () => void;
    loadAndPlay: (song: Song) => void;
}

let soundRef: Audio.Sound | null = null;

const persistQueue = async (queue: Song[]) => {
    await AsyncStorage.setItem('player_queue', JSON.stringify(queue));
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentSong: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    isLoading: false,
    position: 0,
    duration: 0,
    shuffle: false,
    repeatMode: 'off',
    sound: null,

    setCurrentSong: (song) => {
        set({ currentSong: song });
        get().loadAndPlay(song);
    },

    setQueue: (songs, startIndex = 0) => {
        set({ queue: songs, currentIndex: startIndex });
        persistQueue(songs);
        if (songs.length > 0) {
            get().loadAndPlay(songs[startIndex]);
        }
    },

    addToQueue: (song) => {
        const queue = [...get().queue, song];
        set({ queue });
        persistQueue(queue);
    },

    removeFromQueue: (index) => {
        const queue = get().queue.filter((_, i) => i !== index);
        const currentIndex = get().currentIndex;
        set({
            queue,
            currentIndex: index < currentIndex ? currentIndex - 1 : currentIndex,
        });
        persistQueue(queue);
    },

    reorderQueue: (from, to) => {
        const queue = [...get().queue];
        const item = queue.splice(from, 1)[0];
        queue.splice(to, 0, item);
        set({ queue });
        persistQueue(queue);
    },

    loadAndPlay: async (song: Song) => {
        set({ isLoading: true, currentSong: song });

        try {
            if (soundRef) {
                await soundRef.stopAsync();
                await soundRef.unloadAsync();
                soundRef = null;
            }

            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: false,
            });

            const urls = song.downloadUrl;
            const audioUrl =
                urls?.find((u) => u.quality === '96kbps')?.link ||
                urls?.find((u) => u.quality === '96kbps')?.url ||
                urls?.[urls.length - 1]?.link ||
                urls?.[urls.length - 1]?.url;

            if (!audioUrl) {
                set({ isLoading: false });
                return;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true },
                (status: AVPlaybackStatus) => {
                    if (status.isLoaded) {
                        set({
                            position: status.positionMillis / 1000,
                            duration: (status.durationMillis ?? 0) / 1000,
                            isPlaying: status.isPlaying,
                        });
                        if (status.didJustFinish) {
                            const { repeatMode } = get();
                            if (repeatMode === 'one') {
                                sound.replayAsync();
                            } else {
                                get().next();
                            }
                        }
                    }
                }
            );

            soundRef = sound;
            set({ sound, isPlaying: true, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    playPause: async () => {
        if (!soundRef) return;
        const { isPlaying } = get();
        if (isPlaying) {
            await soundRef.pauseAsync();
        } else {
            await soundRef.playAsync();
        }
        set({ isPlaying: !isPlaying });
    },

    next: () => {
        const { queue, currentIndex, shuffle, repeatMode } = get();
        if (queue.length === 0) return;
        let nextIndex: number;
        if (shuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else if (currentIndex < queue.length - 1) {
            nextIndex = currentIndex + 1;
        } else if (repeatMode === 'all') {
            nextIndex = 0;
        } else {
            return;
        }
        set({ currentIndex: nextIndex });
        get().loadAndPlay(queue[nextIndex]);
    },

    prev: () => {
        const { queue, currentIndex, position } = get();
        if (queue.length === 0) return;
        if (position > 3) {
            soundRef?.setPositionAsync(0);
            set({ position: 0 });
            return;
        }
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        set({ currentIndex: prevIndex });
        get().loadAndPlay(queue[prevIndex]);
    },

    seekTo: async (position: number) => {
        if (!soundRef) return;
        await soundRef.setPositionAsync(position * 1000);
        set({ position });
    },

    toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),

    cycleRepeat: () =>
        set((s) => ({
            repeatMode: s.repeatMode === 'off' ? 'all' : s.repeatMode === 'all' ? 'one' : 'off',
        })),

    updatePosition: (pos, dur) => set({ position: pos, duration: dur }),

    stopPlayer: async () => {
        if (soundRef) {
            await soundRef.stopAsync();
            await soundRef.unloadAsync();
            soundRef = null;
        }
        set({ isPlaying: false, currentSong: null, position: 0, duration: 0 });
    },
}));

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DownloadedSong {
    id: string;
    name: string;
    artist: string;
    localUri: string;
    imageUrl: string | null;
    duration: number | string;
}

interface DownloadsState {
    downloads: DownloadedSong[];
    addDownload: (song: DownloadedSong) => void;
    removeDownload: (id: string) => void;
    isDownloaded: (id: string) => boolean;
    loadDownloads: () => void;
}

const KEY = 'mume_downloads';

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
    downloads: [],

    loadDownloads: async () => {
        const data = await AsyncStorage.getItem(KEY);
        if (data) set({ downloads: JSON.parse(data) });
    },

    addDownload: async (song) => {
        const updated = [song, ...get().downloads.filter((d) => d.id !== song.id)];
        set({ downloads: updated });
        await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    },

    removeDownload: async (id) => {
        const updated = get().downloads.filter((d) => d.id !== id);
        set({ downloads: updated });
        await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    },

    isDownloaded: (id) => get().downloads.some((d) => d.id === id),
}));

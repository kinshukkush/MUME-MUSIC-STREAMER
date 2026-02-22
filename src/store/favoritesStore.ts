import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../services/api';

interface FavoritesState {
    favorites: Song[];
    addFavorite: (song: Song) => void;
    removeFavorite: (id: string) => void;
    isFavorite: (id: string) => boolean;
    loadFavorites: () => void;
}

const STORAGE_KEY = 'mume_favorites';

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: [],

    loadFavorites: async () => {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (data) set({ favorites: JSON.parse(data) });
    },

    addFavorite: async (song) => {
        const updated = [song, ...get().favorites.filter((f) => f.id !== song.id)];
        set({ favorites: updated });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    removeFavorite: async (id) => {
        const updated = get().favorites.filter((f) => f.id !== id);
        set({ favorites: updated });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },

    isFavorite: (id) => get().favorites.some((f) => f.id === id),
}));

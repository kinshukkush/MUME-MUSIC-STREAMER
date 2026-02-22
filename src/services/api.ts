import axios from 'axios';

const BASE_URL = 'https://saavn.sumit.co';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
});

export interface Song {
    id: string;
    name: string;
    duration: number | string;
    language: string;
    year?: string;
    album?: { id: string; name: string; url?: string };
    artists?: {
        primary?: Array<{ id: string; name: string; image?: any[] }>;
        featured?: Array<{ id: string; name: string }>;
        all?: Array<{ id: string; name: string }>;
    };
    primaryArtists?: string;
    image?: Array<{ quality: string; link?: string; url?: string }>;
    downloadUrl?: Array<{ quality: string; link?: string; url?: string }>;
    playCount?: string;
    hasLyrics?: string;
    explicitContent?: number;
    url?: string;
}

export interface Artist {
    id: string;
    name: string;
    image?: Array<{ quality: string; link?: string; url?: string }>;
    followerCount?: string;
    bio?: string;
}

export interface Album {
    id: string;
    name: string;
    year?: string;
    songCount?: string;
    artists?: any;
    image?: Array<{ quality: string; link?: string; url?: string }>;
    songs?: Song[];
}

export const getImageUrl = (images?: Array<{ quality: string; link?: string; url?: string }>, preferred = '500x500') => {
    if (!images || images.length === 0) return null;
    const found = images.find((img) => img.quality === preferred);
    const fallback = images[images.length - 1];
    return (found?.link || found?.url || fallback?.link || fallback?.url) ?? null;
};

export const getAudioUrl = (urls?: Array<{ quality: string; link?: string; url?: string }>, quality = '96kbps') => {
    if (!urls || urls.length === 0) return null;
    const found = urls.find((u) => u.quality === quality);
    const fallback = urls[urls.length - 1];
    return (found?.link || found?.url || fallback?.link || fallback?.url) ?? null;
};

export const getArtistNames = (song: Song): string => {
    if (song.primaryArtists) return song.primaryArtists;
    const primary = song.artists?.primary;
    if (primary && primary.length > 0) return primary.map((a) => a.name).join(', ');
    return 'Unknown Artist';
};

export const formatDuration = (seconds: number | string): string => {
    const secs = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const searchSongs = async (query: string, page = 1, limit = 20) => {
    const res = await api.get('/api/search/songs', { params: { query, page, limit } });
    return res.data;
};

export const searchArtists = async (query: string, page = 1, limit = 20) => {
    const res = await api.get('/api/search/artists', { params: { query, page, limit } });
    return res.data;
};

export const searchAlbums = async (query: string, page = 1, limit = 20) => {
    const res = await api.get('/api/search/albums', { params: { query, page, limit } });
    return res.data;
};

export const searchPlaylists = async (query: string, page = 1, limit = 20) => {
    const res = await api.get('/api/search/playlists', { params: { query, page, limit } });
    return res.data;
};

export const getSong = async (id: string): Promise<Song | null> => {
    const res = await api.get(`/api/songs/${id}`);
    const data = res.data?.data;
    return Array.isArray(data) ? data[0] : data;
};

export const getSongSuggestions = async (id: string, limit = 10) => {
    const res = await api.get(`/api/songs/${id}/suggestions`, { params: { limit } });
    return res.data?.data ?? [];
};

export const getArtist = async (id: string) => {
    const res = await api.get(`/api/artists/${id}`);
    return res.data?.data ?? null;
};

export const getArtistSongs = async (id: string, page = 1, sortBy = 'popularity', sortOrder = 'desc') => {
    const res = await api.get(`/api/artists/${id}/songs`, { params: { page, sortBy, sortOrder } });
    return res.data?.data ?? null;
};

export const getHomeData = async () => {
    const [arijitRes, weekndRes] = await Promise.allSettled([
        api.get('/api/search/songs', { params: { query: 'arijit singh', page: 1, limit: 15 } }),
        api.get('/api/search/songs', { params: { query: 'the weeknd', page: 1, limit: 15 } }),
    ]);
    return {
        trending: arijitRes.status === 'fulfilled' ? arijitRes.value.data?.data?.results ?? [] : [],
        mostPlayed: weekndRes.status === 'fulfilled' ? weekndRes.value.data?.data?.results ?? [] : [],
    };
};

export const getTrendingArtists = async () => {
    const res = await api.get('/api/search/artists', { params: { query: 'bollywood', page: 1, limit: 8 } });
    return res.data?.data?.results ?? [];
};

export default api;

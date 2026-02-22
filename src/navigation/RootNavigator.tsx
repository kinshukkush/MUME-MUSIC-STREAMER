import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import BottomTabNavigator from './BottomTabNavigator';
import PlayerScreen from '../screens/PlayerScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import QueueScreen from '../screens/QueueScreen';
import { Song } from '../services/api';

export type RootStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Main: undefined;
    Player: undefined;
    ArtistDetail: { artistId: string; artistName: string };
    AlbumDetail: {
        albumName: string;
        albumArtist: string;
        songs: Song[];
        coverUrl: string | null;
    };
    PlaylistDetail: { playlistId: string; playlistName: string };
    Search: undefined;
    Queue: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Main" component={BottomTabNavigator} />
                <Stack.Screen
                    name="Player"
                    component={PlayerScreen}
                    options={{
                        cardStyleInterpolator: ({ current, layouts }) => ({
                            cardStyle: {
                                transform: [{ translateY: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.height, 0] }) }],
                            },
                        })
                    }}
                />
                <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
                <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
                <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Queue" component={QueueScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

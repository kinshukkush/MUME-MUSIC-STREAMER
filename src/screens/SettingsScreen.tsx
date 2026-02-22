import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar, Switch, ScrollView, Alert, Image, Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const QUALITY_OPTIONS = ['48kbps', '96kbps', '160kbps', '320kbps'];

export default function SettingsScreen() {
    const { colors, isDark, mode, setMode } = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [quality, setQuality] = useState('96kbps');

    const themeOptions: Array<{ label: string; value: 'light' | 'dark' | 'system'; icon: React.ReactNode }> = [
        {
            label: 'Light', value: 'light',
            icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={12} r={4} stroke={mode === 'light' ? Colors.primary : colors.textSecondary} strokeWidth={2} /><Path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke={mode === 'light' ? Colors.primary : colors.textSecondary} strokeWidth={2} strokeLinecap="round" /></Svg>
        },
        {
            label: 'Dark', value: 'dark',
            icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={mode === 'dark' ? Colors.primary : colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill={mode === 'dark' ? Colors.primary + '30' : 'none'} /></Svg>
        },
        {
            label: 'System', value: 'system',
            icon: <Svg width={18} height={18} viewBox="0 0 24 24" fill="none"><Rect x={2} y={3} width={20} height={14} rx={2} stroke={mode === 'system' ? Colors.primary : colors.textSecondary} strokeWidth={2} /><Path d="M8 21h8M12 17v4" stroke={mode === 'system' ? Colors.primary : colors.textSecondary} strokeWidth={2} strokeLinecap="round" /></Svg>
        },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Reset All Data',
            'This will clear all your favorites, downloads, playlists, and settings. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear all AsyncStorage data
                            await AsyncStorage.multiRemove([
                                'mume_favorites',
                                'mume_downloads',
                                'player_queue',
                                'onboarding_done'
                            ]);
                            // Reset navigation to Onboarding screen
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: 'Onboarding' }],
                                })
                            );
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset data. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const openLink = async (url: string, name: string) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', `Cannot open ${name}`);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to open ${name}`);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            <View style={{ paddingTop: insets.top + 8 }} />

            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
            </View>

            <SectionLabel label="Appearance" colors={colors} />

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Theme Mode</Text>
                <View style={styles.themeRow}>
                    {themeOptions.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => setMode(opt.value)}
                            style={[styles.themeBtn, {
                                backgroundColor: mode === opt.value ? (Colors.primary + '18') : colors.background,
                                borderColor: mode === opt.value ? Colors.primary : colors.border,
                            }]}
                            activeOpacity={0.8}>
                            {opt.icon}
                            <Text style={[styles.themeBtnLabel, { color: mode === opt.value ? Colors.primary : colors.textSecondary }]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <SectionLabel label="Audio Quality" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Download & Streaming Quality</Text>
                <View style={styles.qualityGrid}>
                    {QUALITY_OPTIONS.map((q) => (
                        <TouchableOpacity
                            key={q}
                            onPress={() => setQuality(q)}
                            style={[styles.qualityBtn, {
                                backgroundColor: quality === q ? Colors.primary : colors.background,
                                borderColor: quality === q ? Colors.primary : colors.border,
                            }]}
                            activeOpacity={0.85}>
                            <Text style={[styles.qualityText, { color: quality === q ? '#FFF' : colors.text }]}>{q}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <SectionLabel label="About" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.aboutRow}>
                    <Image source={require('../../assets/splash-icon.png')} style={styles.aboutLogo} />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.aboutAppName, { color: colors.text }]}>Mume</Text>
                        <Text style={[styles.aboutVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
                    </View>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <InfoRow label="Developer" value="Kinshuk Saxena" colors={colors} />
                <InfoRow label="Email" value="kinshuksaxena3@gmail.com" colors={colors} />
                <InfoRow label="Phone" value="+91 9057538521" colors={colors} />
            </View>
            
            <SectionLabel label="Connect" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity 
                    style={styles.socialRow} 
                    activeOpacity={0.7}
                    onPress={() => openLink('https://github.com/kinshukkush', 'GitHub')}
                >
                    <View style={styles.socialLeft}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" stroke={colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                        <Text style={[styles.socialText, { color: colors.text }]}>GitHub</Text>
                    </View>
                    <Text style={[styles.socialValue, { color: colors.textSecondary }]}>@kinshukkush</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.socialRow} 
                    activeOpacity={0.7}
                    onPress={() => openLink('https://www.linkedin.com/in/kinshuk-saxena-/', 'LinkedIn')}
                >
                    <View style={styles.socialLeft}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" fill={colors.text} />
                            <Circle cx={4} cy={4} r={2} fill={colors.text} />
                        </Svg>
                        <Text style={[styles.socialText, { color: colors.text }]}>LinkedIn</Text>
                    </View>
                    <Text style={[styles.socialValue, { color: colors.textSecondary }]} numberOfLines={1}>kinshuk-saxena-</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.socialRow} 
                    activeOpacity={0.7}
                    onPress={() => openLink('https://portfolio-frontend-mu-snowy.vercel.app/', 'Portfolio')}
                >
                    <View style={styles.socialLeft}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Circle cx={12} cy={12} r={10} stroke={colors.text} strokeWidth={2} />
                            <Path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={colors.text} strokeWidth={2} />
                            <Path d="M2 12h20" stroke={colors.text} strokeWidth={2} />
                        </Svg>
                        <Text style={[styles.socialText, { color: colors.text }]}>Portfolio</Text>
                    </View>
                    <Text style={[styles.socialValue, { color: colors.textSecondary }]} numberOfLines={1}>View Website</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.socialRow} 
                    activeOpacity={0.7}
                    onPress={() => openLink('https://www.instagram.com/kinshuk._.saxena/', 'Instagram')}
                >
                    <View style={styles.socialLeft}>
                        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Rect x={2} y={2} width={20} height={20} rx={5} ry={5} stroke={colors.text} strokeWidth={2} />
                            <Path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" stroke={colors.text} strokeWidth={2} />
                            <Circle cx={17.5} cy={6.5} r={1.5} fill={colors.text} />
                        </Svg>
                        <Text style={[styles.socialText, { color: colors.text }]}>Instagram</Text>
                    </View>
                    <Text style={[styles.socialValue, { color: colors.textSecondary }]} numberOfLines={1}>@kinshuk._.saxena</Text>
                </TouchableOpacity>
            </View>

            <SectionLabel label="Danger Zone" colors={colors} />
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity 
                    style={[styles.logoutBtn, { backgroundColor: '#EF4444' }]} 
                    onPress={handleLogout}
                    activeOpacity={0.85}
                >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#FFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                    <Text style={styles.logoutText}>Reset All Data</Text>
                </TouchableOpacity>
                <Text style={[styles.dangerNote, { color: colors.textSecondary }]}>
                    This will clear all favorites, downloads, and reset the app to its initial state
                </Text>
            </View>
        </ScrollView>
    );
}

function SectionLabel({ label, colors }: { label: string; colors: any }) {
    return <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{label}</Text>;
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: any }) {
    return (
        <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
    title: { fontSize: 24, fontWeight: '800' },
    sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
    card: { marginHorizontal: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
    cardLabel: { fontSize: 13, marginBottom: 12 },
    themeRow: { flexDirection: 'row', gap: 10 },
    themeBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, gap: 6 },
    themeBtnLabel: { fontSize: 12, fontWeight: '600' },
    qualityGrid: { flexDirection: 'row', gap: 10 },
    qualityBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    qualityText: { fontSize: 13, fontWeight: '600' },
    aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
    aboutLogo: { width: 48, height: 48, borderRadius: 12 },
    aboutAppName: { fontSize: 18, fontWeight: '800' },
    aboutVersion: { fontSize: 12, marginTop: 2 },
    divider: { height: 1, marginBottom: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    infoLabel: { fontSize: 13 },
    infoValue: { fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    socialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    socialLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    socialText: { fontSize: 14, fontWeight: '600' },
    socialValue: { fontSize: 13 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    logoutText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    dangerNote: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

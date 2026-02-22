import React, { useRef, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, Dimensions, StatusBar, Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { RootStackParamList } from '../navigation/RootNavigator';
import { Colors } from '../theme/colors';

type Nav = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        image: require('../../assets/onboarding1.png'),
        title: 'Discover Your Sound',
        subtitle: 'Millions of songs at your fingertips. Find what moves you.',
    },
    {
        id: '2',
        image: require('../../assets/onboarding2.png'),
        title: 'We provide a better audio experience than others',
        subtitle: 'Crystal-clear quality, wherever you go.',
    },
    {
        id: '3',
        image: require('../../assets/onboarding3.png'),
        title: 'Your music, your way',
        subtitle: 'Build queues, save favourites, and listen offline.',
    },
];

export default function OnboardingScreen() {
    const navigation = useNavigation<Nav>();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatRef = useRef<FlatList>(null);
    const scrollX = useRef(new Animated.Value(0)).current;

    const finish = async () => {
        await AsyncStorage.setItem('onboarding_done', 'true');
        navigation.replace('Main');
    };

    const next = () => {
        if (activeIndex < slides.length - 1) {
            const newIndex = activeIndex + 1;
            flatRef.current?.scrollToIndex({ index: newIndex, animated: true });
            setActiveIndex(newIndex);
        } else {
            finish();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <Animated.FlatList
                ref={flatRef}
                data={slides}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                onMomentumScrollEnd={(e) => {
                    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                }}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <View style={styles.imageContainer}>
                            <Image source={item.image} style={styles.heroImage} resizeMode="cover" />
                        </View>
                        <View style={styles.bottomCard}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.subtitle}>{item.subtitle}</Text>
                            <View style={styles.dotsRow}>
                                {slides.map((_, i) => (
                                    <View key={i} style={[styles.dotIndicator, { backgroundColor: i === activeIndex ? Colors.primary : '#D1D5DB', width: i === activeIndex ? 22 : 8 }]} />
                                ))}
                            </View>
                            <TouchableOpacity style={styles.btn} onPress={next} activeOpacity={0.85}>
                                <Text style={styles.btnText}>{activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    slide: { width, flex: 1 },
    imageContainer: {
        height: height * .68,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    heroImage: {
        width: width,
        height: '100%',
    },
    bottomCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 30,
        paddingTop: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        marginTop: -20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1A1A2E',
        textAlign: 'center',
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 24,
        alignItems: 'center',
    },
    dotIndicator: {
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    btn: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 50,
        borderRadius: 50,
        marginTop: 28,
        width: '100%',
        alignItems: 'center',
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Dimensions, TouchableOpacity,
    Animated, ImageBackground
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { usePlan } from '../context/PlanContext';

const { width, height } = Dimensions.get('window');

const FEATURES = [
    { icon: 'analytics-outline', label: '4-Phase AI Plan', sub: '100 structured days' },
    { icon: 'fitness-outline', label: 'Role-Specific Drills', sub: 'Batsman / Bowler / AR' },
    { icon: 'flame-outline', label: 'Streak Tracking', sub: 'Never miss a day' },
    { icon: 'bar-chart-outline', label: 'Progress Charts', sub: 'See your growth' },
];

export default function LandingScreen() {
    const router = useRouter();
    const { trainingPlan, isLoading } = usePlan();

    const ballAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        // Floating ball animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(ballAnim, { toValue: -18, duration: 1800, useNativeDriver: true }),
                Animated.timing(ballAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
            ])
        ).start();

        // Fade in content
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, delay: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 300, useNativeDriver: true }),
        ]).start();
    }, []);

    // If plan already exists, go to dashboard
    useEffect(() => {
        if (!isLoading && trainingPlan) {
            router.replace('/(tabs)/dashboard');
        }
    }, [isLoading, trainingPlan]);

    return (
        <LinearGradient colors={['#050810', '#0A0E1A', '#0D1829']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                {/* Decorative glow circles */}
                <View style={[styles.glow, { top: -60, right: -60, backgroundColor: '#00C85140' }]} />
                <View style={[styles.glow, { bottom: 100, left: -80, backgroundColor: '#3B82F640', width: 220, height: 220 }]} />

                {/* Cricket ball hero */}
                <Animated.View style={[styles.heroSection, { transform: [{ translateY: ballAnim }] }]}>
                    <View style={styles.ballOuter}>
                        <View style={styles.ballInner}>
                            <Text style={styles.ballEmoji}>🏏</Text>
                        </View>
                    </View>
                    <View style={styles.glowRing} />
                </Animated.View>

                {/* Title */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <Text style={styles.brandTag}>AI-POWERED CRICKET TRAINING</Text>
                    <Text style={styles.title}>CricAI</Text>
                    <Text style={styles.subtitle}>
                        Your personal coaching system.{'\n'}100 days. Structured. Smart.
                    </Text>
                </Animated.View>

                {/* Feature pills */}
                <Animated.View style={[styles.featuresGrid, { opacity: fadeAnim }]}>
                    {FEATURES.map((f, i) => (
                        <View key={i} style={styles.featurePill}>
                            <Ionicons name={f.icon} size={20} color={COLORS.green} />
                            <View style={{ marginLeft: 8 }}>
                                <Text style={styles.featureLabel}>{f.label}</Text>
                                <Text style={styles.featureSub}>{f.sub}</Text>
                            </View>
                        </View>
                    ))}
                </Animated.View>

                {/* CTA */}
                <Animated.View style={{ opacity: fadeAnim, width: '100%', paddingHorizontal: 24 }}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={() => router.push('/onboard')}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#00C851', '#00A041']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Start Your 100-Day Journey</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                    <Text style={styles.disclaimer}>
                        Powered by Google Gemini AI · Free to use
                    </Text>
                </Animated.View>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
    glow: {
        position: 'absolute', width: 250, height: 250,
        borderRadius: 125, opacity: 0.5,
    },
    heroSection: { alignItems: 'center', marginTop: 20 },
    ballOuter: {
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: '#00C85115',
        borderWidth: 1.5, borderColor: '#00C85140',
        alignItems: 'center', justifyContent: 'center',
    },
    ballInner: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: '#00C85125',
        borderWidth: 1.5, borderColor: '#00C85160',
        alignItems: 'center', justifyContent: 'center',
    },
    ballEmoji: { fontSize: 54 },
    glowRing: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
        borderWidth: 1, borderColor: '#00C85130',
    },
    brandTag: {
        fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: 3,
        color: COLORS.green, textAlign: 'center', marginTop: 24,
    },
    title: {
        fontFamily: 'Outfit_900Black', fontSize: 64, color: COLORS.textPrimary,
        textAlign: 'center', lineHeight: 68, letterSpacing: -1,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular', fontSize: 16, color: COLORS.textSecondary,
        textAlign: 'center', lineHeight: 24, marginTop: 8,
    },
    featuresGrid: {
        width: '100%', paddingHorizontal: 24,
        flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
    },
    featurePill: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
        width: (width - 68) / 2,
    },
    featureLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: COLORS.textPrimary },
    featureSub: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
    ctaButton: { borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#00C851', shadowOpacity: 0.4, shadowRadius: 12 },
    ctaGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    ctaText: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: '#fff' },
    disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 12 },
});

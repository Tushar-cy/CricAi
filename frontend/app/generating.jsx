import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, Animated, Dimensions, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { usePlan } from '../context/PlanContext';
import { ENDPOINTS } from '../constants/api';

const { width } = Dimensions.get('window');

const STEPS_TEXT = [
    '🧠 Analyzing your cricket profile...',
    '📋 Designing 4-phase structure...',
    '🏏 Creating role-specific drills...',
    '💪 Calibrating fitness tasks...',
    '🎯 Setting measurable goals...',
    '✨ Finalizing your 100-day plan...',
];

export default function GeneratingScreen() {
    const router = useRouter();
    const { userProfile, saveTrainingPlan } = usePlan();

    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState(null);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const stepFade = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Pulsing ball
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            ])
        ).start();

        // Rotating ring
        Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
        ).start();

        // Step cycling
        const stepInterval = setInterval(() => {
            Animated.timing(stepFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
                setCurrentStep(prev => (prev + 1) % STEPS_TEXT.length);
                Animated.timing(stepFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            });
        }, 2200);

        // Fetch plan
        generatePlan();

        return () => clearInterval(stepInterval);
    }, []);

    const generatePlan = async () => {
        try {
            Animated.timing(progressAnim, { toValue: 0.3, duration: 2000, useNativeDriver: false }).start();

            const response = await fetch(ENDPOINTS.generatePlan, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userProfile),
            });

            Animated.timing(progressAnim, { toValue: 0.8, duration: 1000, useNativeDriver: false }).start();

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Server error');
            }

            const result = await response.json();
            Animated.timing(progressAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();

            await saveTrainingPlan(result.data);

            setTimeout(() => router.replace('/(tabs)/dashboard'), 800);
        } catch (err) {
            setError(err.message);
        }
    };

    const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    if (error) {
        return (
            <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
                <SafeAreaView style={styles.safe}>
                    <Text style={styles.errorEmoji}>⚠️</Text>
                    <Text style={styles.errorTitle}>Generation Failed</Text>
                    <Text style={styles.errorMsg}>{error}</Text>
                    <Text style={styles.errorHint}>
                        Make sure:{'\n'}
                        • Backend is running (`node server.js`){'\n'}
                        • OpenAI API key is set in `.env`{'\n'}
                        • Phone & PC on same WiFi{'\n'}
                        • IP in `constants/api.js` is correct
                    </Text>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#050810', '#0A0E1A', '#0D1829']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                <Text style={styles.titleTop}>AI is Working Magic</Text>
                <Text style={styles.subTop}>Building your personalized 100-day plan</Text>

                {/* Animated orb */}
                <View style={styles.orbContainer}>
                    <Animated.View style={[styles.outerRing, { transform: [{ rotate: spin }] }]} />
                    <Animated.View style={[styles.innerRing, { transform: [{ rotate: spin }, { scaleX: -1 }] }]} />
                    <Animated.View style={[styles.ball, { transform: [{ scale: pulseAnim }] }]}>
                        <LinearGradient colors={['#00C851', '#00A041']} style={styles.ballGrad}>
                            <Text style={styles.ballEmoji}>🏏</Text>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Current step text */}
                <Animated.Text style={[styles.stepText, { opacity: stepFade }]}>
                    {STEPS_TEXT[currentStep]}
                </Animated.Text>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>

                <Text style={styles.hintText}>
                    OpenAI is crafting {userProfile?.role}-specific drills for you...
                </Text>

                {/* Phase preview */}
                <View style={styles.phasesList}>
                    {['Phase 1: Fundamentals', 'Phase 2: Skill Dev', 'Phase 3: Competition', 'Phase 4: Optimization'].map((p, i) => (
                        <View key={i} style={styles.phaseRow}>
                            <View style={[styles.phaseDot, { backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B', '#00C851'][i] }]} />
                            <Text style={styles.phaseText}>{p}</Text>
                        </View>
                    ))}
                </View>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    titleTop: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 6 },
    subTop: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 40 },
    orbContainer: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    outerRing: {
        position: 'absolute', width: 180, height: 180, borderRadius: 90,
        borderWidth: 2, borderColor: COLORS.green, borderStyle: 'dashed', opacity: 0.5,
    },
    innerRing: {
        position: 'absolute', width: 140, height: 140, borderRadius: 70,
        borderWidth: 1.5, borderColor: '#3B82F6', borderStyle: 'dashed', opacity: 0.4,
    },
    ball: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden' },
    ballGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    ballEmoji: { fontSize: 44 },
    stepText: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 24, minHeight: 22 },
    progressTrack: { width: '100%', height: 6, backgroundColor: '#1A2235', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
    progressFill: { height: 6, backgroundColor: COLORS.green, borderRadius: 3 },
    hintText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 32 },
    phasesList: { gap: 10, alignSelf: 'stretch' },
    phaseRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A223580', borderRadius: 10, padding: 12, gap: 12 },
    phaseDot: { width: 10, height: 10, borderRadius: 5 },
    phaseText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.textSecondary },
    errorEmoji: { fontSize: 50, textAlign: 'center', marginBottom: 12 },
    errorTitle: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: '#EF4444', textAlign: 'center', marginBottom: 10 },
    errorMsg: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
    errorHint: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textMuted, backgroundColor: '#1A2235', borderRadius: 12, padding: 16, lineHeight: 22 },
});

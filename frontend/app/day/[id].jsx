import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, Alert, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, PHASES } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';

const { width } = Dimensions.get('window');

const PHASE_BANNERS = {
    1: { colors: ['#1E3A5F', '#0A1E3C'], icon: '🏗️', tagline: 'Building the Foundation' },
    2: { colors: ['#2D1B69', '#1A0E4A'], icon: '⚡', tagline: 'Sharpening Your Weapons' },
    3: { colors: ['#5C1A1A', '#3D1010'], icon: '🎯', tagline: 'Match-Day Pressure' },
    4: { colors: ['#4A3000', '#2E1E00'], icon: '🏆', tagline: 'Peak Performance Mode' },
};

const MUSCLE_GROUPS = {
    1: [{ emoji: '🦵', label: 'Legs' }, { emoji: '💪', label: 'Core' }, { emoji: '🤲', label: 'Arms' }],
    2: [{ emoji: '💪', label: 'Shoulders' }, { emoji: '🤲', label: 'Wrists' }, { emoji: '🦵', label: 'Core' }, { emoji: '🦵', label: 'Legs' }],
    3: [{ emoji: '💪', label: 'Full Body' }, { emoji: '🧠', label: 'Mental' }],
    4: [{ emoji: '💪', label: 'Full Body' }, { emoji: '🧠', label: 'Mental' }, { emoji: '⚡', label: 'Power' }],
};

const CALORIE_MAP = { Low: 150, Medium: 350, High: 500, Maximum: 700 };

export default function DayDetailScreen() {
    const { id } = useLocalSearchParams();
    const router  = useRouter();
    const { trainingPlan, progress, markDayComplete, currentDay } = usePlan();
    const dayNumber = parseInt(id);

    const scaleAnim    = useRef(new Animated.Value(0.8)).current;
    const fadeAnim     = useRef(new Animated.Value(0)).current;
    const intensityAnim = useRef(new Animated.Value(0)).current;

    const [completing, setCompleting]   = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [timerPaused, setTimerPaused] = useState(false);
    const [timeLeft, setTimeLeft]       = useState(null);
    const [timerFinished, setTimerFinished] = useState(false);
    const timerRef = useRef(null);

    const planArray = trainingPlan?.plan ?? [];
    const day       = planArray.find(d => d.dayNumber === dayNumber);
    const isDone    = progress[dayNumber]?.completed;
    const isLocked  = dayNumber > currentDay;

    const phaseInfo   = day ? PHASES.find(p => p.phase === day.phase) || PHASES[0] : PHASES[0];
    const phaseBanner = day ? PHASE_BANNERS[day.phase] || PHASE_BANNERS[1] : PHASE_BANNERS[1];
    const muscles     = day ? MUSCLE_GROUPS[day.phase] || MUSCLE_GROUPS[1] : [];
    const calories    = day ? CALORIE_MAP[day.intensity] || 350 : 350;

    const intensityMap = { Low: 0.2, Medium: 0.5, High: 0.8, Maximum: 1.0 };
    const intensityVal = day ? intensityMap[day.intensity] || 0.5 : 0.5;

    const INTENSITY_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#00C851', Maximum: '#FF3B30' };
    const intensityColor = day ? (INTENSITY_COLOR[day.intensity] || COLORS.green) : COLORS.green;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 70 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();

        Animated.timing(intensityAnim, {
            toValue: intensityVal, duration: 1000, delay: 400, useNativeDriver: false,
        }).start();
    }, []);

    useEffect(() => {
        if (timerActive && !timerPaused && timeLeft > 0) {
            timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        } else if (timerActive && !timerPaused && timeLeft === 0) {
            setTimerActive(false);
            setTimerFinished(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('🎉 Session Complete!', 'Great work! You can now mark this day as complete.');
        }
        return () => clearTimeout(timerRef.current);
    }, [timerActive, timerPaused, timeLeft]);

    const startTimer = () => {
        setTimeLeft(60 * 60); // Strict 60 min
        setTimerActive(true);
        setTimerPaused(false);
        setTimerFinished(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const togglePause = () => {
        setTimerPaused(!timerPaused);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const stopTimer = () => { 
        Alert.alert(
            "Abandon Session?",
            "If you stop now, your progress for this 60-minute session will be lost.",
            [
                { text: "Keep Going", style: "cancel" },
                { text: "Abandon", style: "destructive", onPress: () => {
                    setTimerActive(false); 
                    setTimerPaused(false);
                    clearTimeout(timerRef.current); 
                }}
            ]
        );
    };

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        if (h > 0) return `${h}:${m}:${s}`;
        return `${m}:${s}`;
    };

    const handleComplete = async () => {
        if (isDone || isLocked) return;
        setCompleting(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await markDayComplete(dayNumber);
        setCompleting(false);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    if (!day) {
        return (
            <View style={{ flex: 1, backgroundColor: '#050810', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: COLORS.textPrimary }}>Day not found</Text>
            </View>
        );
    }

    const intensityWidth = intensityAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

    return (
        <LinearGradient colors={['#0A120D', '#050A07']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                {/* Stadium Floodlight Glows */}
                <View style={[styles.glow, { top: -80, right: -80, backgroundColor: '#ffffff15' }]} />
                <View style={[styles.glow, { top: '30%', left: -100, backgroundColor: '#C2A57815', width: 260, height: 260 }]} />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#C2A578" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Match Day {dayNumber}</Text>
                    <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '25' }]}>
                        <Text style={[styles.intensityText, { color: intensityColor }]}>{day.intensity}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* Phase Banner */}
                    <LinearGradient colors={phaseBanner.colors} style={styles.phaseBanner}>
                        <Text style={styles.phaseBannerIcon}>{phaseBanner.icon}</Text>
                        <Text style={styles.phaseBannerPhase}>PHASE {day.phase}</Text>
                        <Text style={styles.phaseBannerLabel}>{day.phaseLabel}</Text>
                        <Text style={styles.phaseBannerTagline}>{phaseBanner.tagline}</Text>
                    </LinearGradient>

                    {/* Intensity Meter */}
                    <View style={styles.intensityCard}>
                        <View style={styles.intensityRow}>
                            <Text style={styles.intensityCardTitle}>Intensity Level</Text>
                            <View style={styles.intensityMeta}>
                                <Text style={[styles.intensityLabel, { color: intensityColor }]}>{day.intensity}</Text>
                                <Text style={styles.calorieText}>~{calories} kcal</Text>
                            </View>
                        </View>
                        <View style={styles.intensityTrack}>
                            <Animated.View style={[styles.intensityFill, { width: intensityWidth, backgroundColor: intensityColor }]} />
                        </View>
                        <View style={styles.intensityScale}>
                            {['Low', 'Medium', 'High', 'Maximum'].map((l, i) => (
                                <Text key={l} style={[styles.intensityScaleLabel, day.intensity === l && { color: intensityColor, fontFamily: 'Inter_600SemiBold' }]}>{l}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Session Timer */}
                    {!isDone && !isLocked && (
                        <View style={styles.timerCard}>
                            {timerActive ? (
                                <>
                                    <Text style={[styles.timerDisplay, timerPaused && { color: '#F59E0B' }]}>{formatTime(timeLeft)}</Text>
                                    <Text style={styles.timerLabel}>{timerPaused ? 'Session Paused (Break)' : 'Match Intensity: In Progress'}</Text>
                                    <View style={styles.timerControls}>
                                        <TouchableOpacity style={[styles.timerControlBtn, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B40' }]} onPress={togglePause}>
                                            <Ionicons name={timerPaused ? "play" : "pause"} size={18} color="#F59E0B" />
                                            <Text style={[styles.timerControlText, { color: '#F59E0B' }]}>{timerPaused ? 'Resume' : 'Take Break'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.timerControlBtn, { backgroundColor: '#EF444420', borderColor: '#EF444440' }]} onPress={stopTimer}>
                                            <Ionicons name="stop" size={18} color="#EF4444" />
                                            <Text style={[styles.timerControlText, { color: '#EF4444' }]}>Abandon</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : !timerFinished && (
                                <TouchableOpacity style={styles.timerStartBtn} onPress={startTimer} activeOpacity={0.85}>
                                    <LinearGradient colors={['#0F3818', '#0A2510']} style={styles.timerStartGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <Ionicons name="play-circle-outline" size={24} color="#C2A578" />
                                        <Text style={styles.timerStartText}>Start Strict 60-Min Session</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Skill Task */}
                    <Animated.View style={[styles.taskCard, { opacity: fadeAnim }]}>
                        <View style={styles.taskCardHeader}>
                            <View style={[styles.taskIconBg, { backgroundColor: '#00C85120' }]}>
                                <Ionicons name="baseball-outline" size={22} color={COLORS.green} />
                            </View>
                            <Text style={styles.taskCardTitle}>Skill Training</Text>
                        </View>
                        <Text style={styles.taskCardContent}>{day.skillTask}</Text>
                    </Animated.View>

                    {/* Fitness Task */}
                    <Animated.View style={[styles.taskCard, { opacity: fadeAnim }]}>
                        <View style={styles.taskCardHeader}>
                            <View style={[styles.taskIconBg, { backgroundColor: '#3B82F620' }]}>
                                <Ionicons name="fitness-outline" size={22} color="#3B82F6" />
                            </View>
                            <Text style={styles.taskCardTitle}>Fitness Drill</Text>
                        </View>
                        <Text style={styles.taskCardContent}>{day.fitnessTask}</Text>
                    </Animated.View>

                    {/* Muscle Groups */}
                    <View style={styles.muscleCard}>
                        <Text style={styles.muscleTitle}>Muscles Targeted</Text>
                        <View style={styles.muscleRow}>
                            {muscles.map((m, i) => (
                                <View key={i} style={[styles.musclePill, { backgroundColor: phaseInfo.color + '20', borderColor: phaseInfo.color + '40' }]}>
                                    <Text style={styles.muscleEmoji}>{m.emoji}</Text>
                                    <Text style={[styles.muscleLabel, { color: phaseInfo.color }]}>{m.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Goal */}
                    <Animated.View style={[styles.goalCard, { opacity: fadeAnim }]}>
                        <View style={styles.taskCardHeader}>
                            <View style={[styles.taskIconBg, { backgroundColor: '#F59E0B20' }]}>
                                <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
                            </View>
                            <Text style={styles.taskCardTitle}>Today's Goal</Text>
                        </View>
                        <Text style={styles.goalText}>{day.goal}</Text>
                    </Animated.View>

                    {/* Meta */}
                    <Animated.View style={[styles.metaRow, { opacity: fadeAnim }]}>
                        <View style={styles.metaChip}>
                            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>{day.durationMinutes} minutes</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>Match {dayNumber}</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Ionicons name="flame-outline" size={16} color="#F59E0B" />
                            <Text style={styles.metaText}>{calories} kcal</Text>
                        </View>
                    </Animated.View>

                    {/* Tips */}
                    {day.tip && (
                        <Animated.View style={[styles.tipCard, { opacity: fadeAnim }]}>
                            <Text style={styles.tipHeader}>💡 Coach's Tip</Text>
                            <Text style={styles.tipText}>{day.tip}</Text>
                        </Animated.View>
                    )}
                    {day.dietTip && (
                        <Animated.View style={[styles.tipCard, { opacity: fadeAnim, backgroundColor: '#00C85120', borderColor: '#00C85140' }]}>
                            <Text style={[styles.tipHeader, { color: '#00C851' }]}>🥗 Nutrition</Text>
                            <Text style={styles.tipText}>{day.dietTip}</Text>
                        </Animated.View>
                    )}
                    {day.mentalEdge && (
                        <Animated.View style={[styles.tipCard, { opacity: fadeAnim, backgroundColor: '#3B82F620', borderColor: '#3B82F640' }]}>
                            <Text style={[styles.tipHeader, { color: '#3B82F6' }]}>🧠 Mental Edge</Text>
                            <Text style={styles.tipText}>{day.mentalEdge}</Text>
                        </Animated.View>
                    )}

                    {/* Complete button */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 8 }}>
                        {isLocked ? (
                            <View style={styles.lockedBtn}>
                                <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
                                <Text style={styles.lockedText}>Complete previous matches first</Text>
                            </View>
                        ) : isDone ? (
                            <View style={styles.doneBtn}>
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                                <Text style={styles.doneText}>Match Completed! 🔥</Text>
                            </View>
                        ) : !timerFinished ? (
                            <View style={styles.lockedBtn}>
                                <Ionicons name="time-outline" size={20} color={COLORS.textMuted} />
                                <Text style={styles.lockedText}>Complete 60-min session to unlock</Text>
                            </View>
                        ) : (
                            <TouchableOpacity onPress={handleComplete} disabled={completing} activeOpacity={0.85} style={styles.completeBtn}>
                                <LinearGradient colors={['#C2A578', '#A68A5E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.completeBtnGrad}>
                                    <Ionicons name="checkmark-circle-outline" size={22} color="#050A07" />
                                    <Text style={[styles.completeBtnText, { color: '#050A07' }]}>{completing ? 'Saving...' : 'Mark Day Complete'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    glow: {
        position: 'absolute', width: 280, height: 280,
        borderRadius: 140, opacity: 0.6,
    },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0F1A12', borderWidth: 1, borderColor: '#152A1C', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: '#C2A578', flex: 1 },
    intensityBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    intensityText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    scroll: { padding: 20, paddingBottom: 40 },

    // Phase Banner
    phaseBanner: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#C2A57830' },
    phaseBannerIcon: { fontSize: 52, marginBottom: 8 },
    phaseBannerPhase: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#C2A57890', letterSpacing: 2 },
    phaseBannerLabel: { fontFamily: 'Outfit_900Black', fontSize: 22, color: '#fff', marginTop: 4 },
    phaseBannerTagline: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#ffffff90', marginTop: 4 },

    // Intensity
    intensityCard: { backgroundColor: '#0F1A12', borderWidth: 1, borderColor: '#152A1C', borderRadius: 16, padding: 16, marginBottom: 14 },
    intensityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    intensityCardTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: COLORS.textPrimary },
    intensityMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    intensityLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
    calorieText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textMuted },
    intensityTrack: { height: 8, backgroundColor: '#050A07', borderRadius: 4, overflow: 'hidden', marginBottom: 8, borderWidth: 1, borderColor: '#152A1C' },
    intensityFill: { height: 8, borderRadius: 4 },
    intensityScale: { flexDirection: 'row', justifyContent: 'space-between' },
    intensityScaleLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.textMuted },

    // Timer
    timerCard: { backgroundColor: '#050A07', borderWidth: 1, borderColor: '#C2A57840', borderRadius: 16, padding: 16, marginBottom: 14, alignItems: 'center' },
    timerDisplay: { fontFamily: 'Outfit_900Black', fontSize: 56, color: '#C2A578', letterSpacing: -2, fontVariant: ['tabular-nums'] },
    timerLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
    timerControls: { flexDirection: 'row', gap: 12, marginTop: 16 },
    timerControlBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
    timerControlText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    timerStartBtn: { width: '100%', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#C2A57850' },
    timerStartGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    timerStartText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#C2A578' },

    // Tasks
    taskCard: { backgroundColor: '#0F1A12', borderWidth: 1, borderColor: '#152A1C', borderRadius: 18, padding: 18, marginBottom: 14 },
    taskCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    taskIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    taskCardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary },
    taskCardContent: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
    goalCard: { backgroundColor: '#C2A57812', borderWidth: 1, borderColor: '#C2A57840', borderRadius: 18, padding: 18, marginBottom: 14 },
    goalText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },

    // Muscles
    muscleCard: { backgroundColor: '#050A07', borderWidth: 1, borderColor: '#152A1C', borderRadius: 16, padding: 16, marginBottom: 14 },
    muscleTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: COLORS.textPrimary, marginBottom: 10 },
    muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    musclePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
    muscleEmoji: { fontSize: 14 },
    muscleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },

    // Meta
    metaRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    metaChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0F1A12', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 11, borderWidth: 1, borderColor: '#152A1C' },
    metaText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.textSecondary },

    // Tips
    tipCard: { backgroundColor: '#0F1A12', borderWidth: 1, borderColor: '#152A1C', borderRadius: 18, padding: 18, marginBottom: 14 },
    tipHeader: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#C2A578', marginBottom: 8 },
    tipText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },

    // CTA
    completeBtn: { borderRadius: 16, overflow: 'hidden', elevation: 8, shadowColor: '#C2A578', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    completeBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    completeBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
    doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#00C85115', borderWidth: 1, borderColor: '#00C85150', borderRadius: 16, paddingVertical: 18 },
    doneText: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: COLORS.green },
    lockedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0F1A12', borderWidth: 1, borderColor: '#152A1C', borderRadius: 16, paddingVertical: 18 },
    lockedText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.textMuted },
});

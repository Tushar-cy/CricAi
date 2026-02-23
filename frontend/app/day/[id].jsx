import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, PHASES } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';

export default function DayDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { trainingPlan, progress, markDayComplete, currentDay } = usePlan();
    const dayNumber = parseInt(id);

    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [completing, setCompleting] = useState(false);

    const day = trainingPlan?.plan?.find(d => d.dayNumber === dayNumber);
    const isDone = progress[dayNumber]?.completed;
    const isLocked = dayNumber > currentDay;

    const phaseInfo = day ? PHASES.find(p => p.phase === day.phase) : PHASES[0];

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 70 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleComplete = async () => {
        if (isDone || isLocked) return;
        setCompleting(true);

        // Haptic burst
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        await markDayComplete(dayNumber);

        setCompleting(false);

        // Bounce the button
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
    };

    if (!day) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: COLORS.textPrimary }}>Day not found</Text>
            </View>
        );
    }

    const INTENSITY_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#00C851' };
    const intensityColor = INTENSITY_COLOR[day.intensity] || COLORS.green;

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Day {dayNumber}</Text>
                    <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '25' }]}>
                        <Text style={[styles.intensityText, { color: intensityColor }]}>{day.intensity}</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* Phase badge */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                        <View style={[styles.phaseBadge, { backgroundColor: phaseInfo.color + '20', borderColor: phaseInfo.color + '50' }]}>
                            <Text style={styles.phaseBadgeEmoji}>{phaseInfo.icon}</Text>
                            <Text style={[styles.phaseBadgeText, { color: phaseInfo.color }]}>
                                Phase {day.phase} · {day.phaseLabel}
                            </Text>
                        </View>
                    </Animated.View>

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

                    {/* Duration */}
                    <Animated.View style={[styles.metaRow, { opacity: fadeAnim }]}>
                        <View style={styles.metaChip}>
                            <Ionicons name="time-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>{day.durationMinutes} minutes total</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Ionicons name="calendar-outline" size={16} color={COLORS.textMuted} />
                            <Text style={styles.metaText}>{day.dayOfWeek || 'Day ' + dayNumber}</Text>
                        </View>
                    </Animated.View>

                    {/* Coach Tip */}
                    {day.tip && (
                        <Animated.View style={[styles.tipCard, { opacity: fadeAnim }]}>
                            <Text style={styles.tipHeader}>💡 Coach's Tip</Text>
                            <Text style={styles.tipText}>{day.tip}</Text>
                        </Animated.View>
                    )}

                    {/* Diet Tip */}
                    {day.dietTip && (
                        <Animated.View style={[styles.tipCard, { opacity: fadeAnim, backgroundColor: '#00C85120', borderColor: '#00C85140' }]}>
                            <Text style={[styles.tipHeader, { color: '#00C851' }]}>🥗 Nutrition Advice</Text>
                            <Text style={styles.tipText}>{day.dietTip}</Text>
                        </Animated.View>
                    )}

                    {/* Mental Edge */}
                    {day.mentalEdge && (
                        <Animated.View style={[styles.tipCard, { opacity: fadeAnim, backgroundColor: '#3B82F620', borderColor: '#3B82F640' }]}>
                            <Text style={[styles.tipHeader, { color: '#3B82F6' }]}>🧠 Mental Edge</Text>
                            <Text style={styles.tipText}>{day.mentalEdge}</Text>
                        </Animated.View>
                    )}

                    {/* Mark Complete Button */}
                    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 8 }}>
                        {isLocked ? (
                            <View style={styles.lockedBtn}>
                                <Ionicons name="lock-closed" size={20} color={COLORS.textMuted} />
                                <Text style={styles.lockedText}>Complete previous days first</Text>
                            </View>
                        ) : isDone ? (
                            <View style={styles.doneBtn}>
                                <Ionicons name="checkmark-circle" size={24} color={COLORS.green} />
                                <Text style={styles.doneText}>Completed! 🔥</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleComplete}
                                disabled={completing}
                                activeOpacity={0.85}
                                style={styles.completeBtn}
                            >
                                <LinearGradient
                                    colors={['#00C851', '#00A041']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.completeBtnGrad}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
                                    <Text style={styles.completeBtnText}>
                                        {completing ? 'Marking complete...' : 'Mark Day Complete'}
                                    </Text>
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
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1A2235', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: COLORS.textPrimary, flex: 1 },
    intensityBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    intensityText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    scroll: { padding: 20, paddingBottom: 40 },
    phaseBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 16 },
    phaseBadgeEmoji: { fontSize: 18 },
    phaseBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
    taskCard: { backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050', borderRadius: 18, padding: 18, marginBottom: 14 },
    taskCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    taskIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    taskCardTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary },
    taskCardContent: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
    goalCard: { backgroundColor: '#F59E0B12', borderWidth: 1.5, borderColor: '#F59E0B40', borderRadius: 18, padding: 18, marginBottom: 14 },
    goalText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary, lineHeight: 24 },
    metaRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
    metaChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1A2235', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#243050' },
    metaText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textSecondary },
    tipCard: { backgroundColor: '#8B5CF620', borderWidth: 1.5, borderColor: '#8B5CF640', borderRadius: 18, padding: 18, marginBottom: 20 },
    tipHeader: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#A78BFA', marginBottom: 8 },
    tipText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
    completeBtn: { borderRadius: 16, overflow: 'hidden' },
    completeBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    completeBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
    doneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#00C85115', borderWidth: 1.5, borderColor: '#00C85150', borderRadius: 16, paddingVertical: 18 },
    doneText: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: COLORS.green },
    lockedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050', borderRadius: 16, paddingVertical: 18 },
    lockedText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.textMuted },
});

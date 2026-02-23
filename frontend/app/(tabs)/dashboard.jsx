import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, PHASES } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const router = useRouter();
    const {
        userProfile, trainingPlan, progress, streak,
        completedDays, completionPercent, currentDay, todayTask, currentPhase
    } = usePlan();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
    }, []);

    if (!trainingPlan) return null;

    const phaseInfo = PHASES.find(p => p.phase === currentPhase) || PHASES[0];
    const phaseProgress = trainingPlan.plan.filter(d => d.phase === currentPhase && progress[d.dayNumber]?.completed).length;
    const phaseTotalDays = trainingPlan.plan.filter(d => d.phase === currentPhase).length;

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* Header */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.header}>
                            <View>
                                <Text style={styles.greeting}>Welcome back,</Text>
                                <Text style={styles.playerName}>{userProfile?.name} 🏏</Text>
                            </View>
                            <View style={styles.streakBadge}>
                                <Text style={styles.streakFire}>🔥</Text>
                                <Text style={styles.streakNum}>{streak}</Text>
                                <Text style={styles.streakLabel}>day streak</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Overall progress bar */}
                    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
                        <View style={styles.cardRow}>
                            <Text style={styles.cardTitle}>Overall Progress</Text>
                            <Text style={styles.cardValue}>{completionPercent}%</Text>
                        </View>
                        <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
                        </View>
                        <View style={styles.cardRow}>
                            <Text style={styles.subText}>{completedDays} of 100 days complete</Text>
                            <Text style={styles.subText}>Day {Math.min(currentDay, 100)}</Text>
                        </View>
                    </Animated.View>

                    {/* Current Phase card */}
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <LinearGradient
                            colors={[phaseInfo.color + '30', phaseInfo.color + '10']}
                            style={[styles.phaseCard, { borderColor: phaseInfo.color + '50' }]}
                        >
                            <View style={styles.phaseHeader}>
                                <Text style={styles.phaseEmoji}>{phaseInfo.icon}</Text>
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.phaseTag}>CURRENT PHASE {phaseInfo.phase}</Text>
                                    <Text style={styles.phaseTitle}>{phaseInfo.label}</Text>
                                </View>
                                <View style={[styles.phaseDaysChip, { backgroundColor: phaseInfo.color + '25' }]}>
                                    <Text style={[styles.phaseDaysText, { color: phaseInfo.color }]}>Days {phaseInfo.days}</Text>
                                </View>
                            </View>
                            <View style={styles.progressTrack}>
                                <View style={[styles.progressFill, {
                                    width: `${Math.round((phaseProgress / phaseTotalDays) * 100)}%`,
                                    backgroundColor: phaseInfo.color
                                }]} />
                            </View>
                            <Text style={styles.subText}>{phaseProgress}/{phaseTotalDays} days completed in this phase</Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Stats row */}
                    <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
                        <StatCard icon="flame-outline" value={streak} label="Streak" color="#F59E0B" />
                        <StatCard icon="checkmark-circle-outline" value={completedDays} label="Done" color="#00C851" />
                        <StatCard icon="time-outline" value={100 - completedDays} label="Left" color="#3B82F6" />
                    </Animated.View>

                    {/* Today's task */}
                    {todayTask && currentDay <= 100 && (
                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Text style={styles.sectionTitle}>Today's Training — Day {currentDay}</Text>
                            <TouchableOpacity
                                style={styles.todayCard}
                                onPress={() => router.push(`/day/${currentDay}`)}
                                activeOpacity={0.84}
                            >
                                <View style={styles.todayHeader}>
                                    <Text style={styles.todayDay}>Day {todayTask.dayNumber}</Text>
                                    <View style={[styles.intensityBadge, {
                                        backgroundColor: todayTask.intensity === 'High' ? '#EF444430' : todayTask.intensity === 'Medium' ? '#F59E0B30' : '#00C85130'
                                    }]}>
                                        <Text style={[styles.intensityText, {
                                            color: todayTask.intensity === 'High' ? '#EF4444' : todayTask.intensity === 'Medium' ? '#F59E0B' : '#00C851'
                                        }]}>{todayTask.intensity}</Text>
                                    </View>
                                </View>
                                <View style={styles.taskRow}>
                                    <View style={styles.taskIcon}><Ionicons name="baseball-outline" size={18} color={COLORS.green} /></View>
                                    <Text style={styles.taskText} numberOfLines={2}>{todayTask.skillTask}</Text>
                                </View>
                                <View style={styles.taskRow}>
                                    <View style={styles.taskIcon}><Ionicons name="fitness-outline" size={18} color="#3B82F6" /></View>
                                    <Text style={styles.taskText} numberOfLines={2}>{todayTask.fitnessTask}</Text>
                                </View>
                                <View style={styles.todayFooter}>
                                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                                    <Text style={styles.durationText}>{todayTask.durationMinutes} min</Text>
                                    <View style={{ flex: 1 }} />
                                    <Text style={styles.tapText}>Tap to start →</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {currentDay > 100 && (
                        <View style={styles.completedBanner}>
                            <Text style={styles.completedEmoji}>🏆</Text>
                            <Text style={styles.completedText}>You completed the 100-day program!</Text>
                        </View>
                    )}

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

function StatCard({ icon, value, label, color }) {
    return (
        <View style={styles.statCard}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    scroll: { padding: 20, paddingBottom: 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary },
    playerName: { fontFamily: 'Outfit_700Bold', fontSize: 26, color: COLORS.textPrimary },
    streakBadge: {
        backgroundColor: '#F59E0B20', borderWidth: 1, borderColor: '#F59E0B40',
        borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center',
    },
    streakFire: { fontSize: 20 },
    streakNum: { fontFamily: 'Outfit_900Black', fontSize: 22, color: '#F59E0B' },
    streakLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.textSecondary },
    card: {
        backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050',
        borderRadius: 18, padding: 18, marginBottom: 16,
    },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
    cardValue: { fontFamily: 'Outfit_700Bold', fontSize: 22, color: COLORS.green },
    progressTrack: { height: 6, backgroundColor: '#243050', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
    progressFill: { height: 6, backgroundColor: COLORS.green, borderRadius: 3 },
    subText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textSecondary },
    phaseCard: {
        borderWidth: 1.5, borderRadius: 18, padding: 18, marginBottom: 16,
    },
    phaseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    phaseEmoji: { fontSize: 32 },
    phaseTag: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5 },
    phaseTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: COLORS.textPrimary, marginTop: 2 },
    phaseDaysChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    phaseDaysText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: {
        flex: 1, backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050',
        borderRadius: 16, padding: 16, alignItems: 'center', gap: 4,
    },
    statValue: { fontFamily: 'Outfit_900Black', fontSize: 28 },
    statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.textSecondary },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: COLORS.textPrimary, marginBottom: 12 },
    todayCard: {
        backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#00C85140',
        borderRadius: 18, padding: 18,
    },
    todayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    todayDay: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary },
    intensityBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    intensityText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    taskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    taskIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#0A0E1A', alignItems: 'center', justifyContent: 'center',
    },
    taskText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
    todayFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#243050' },
    durationText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.textMuted },
    tapText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: COLORS.green },
    completedBanner: {
        backgroundColor: '#00C85115', borderWidth: 1.5, borderColor: '#00C85150',
        borderRadius: 18, padding: 24, alignItems: 'center',
    },
    completedEmoji: { fontSize: 48, marginBottom: 8 },
    completedText: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: COLORS.green, textAlign: 'center' },
});

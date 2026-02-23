import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, PHASES } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
    const { completedDays, streak, completionPercent, getWeeklyProgress, progress, trainingPlan, userProfile } = usePlan();

    const weeklyData = getWeeklyProgress();
    const activeWeeks = weeklyData.filter(w => w.completed > 0).slice(-8);

    const chartData = {
        labels: activeWeeks.map(w => `W${w.week}`),
        datasets: [{ data: activeWeeks.map(w => w.completed), strokeWidth: 2 }],
    };

    // Performance score (0-100)
    const performanceScore = Math.min(100, Math.round(
        completionPercent * 0.7 + (streak / 100) * 30
    ));

    // Phase breakdown
    const phaseStats = PHASES.map(p => {
        const phaseDays = trainingPlan?.plan?.filter(d => d.phase === p.phase) || [];
        const done = phaseDays.filter(d => progress[d.dayNumber]?.completed).length;
        return { ...p, done, total: phaseDays.length };
    });

    const BADGES = [
        { icon: '🏏', label: 'First Day', earned: completedDays >= 1 },
        { icon: '🔥', label: '7-Day Streak', earned: streak >= 7 },
        { icon: '⚡', label: 'Phase 1 Done', earned: phaseStats[0]?.done >= 20 },
        { icon: '🌟', label: '50 Days', earned: completedDays >= 50 },
        { icon: '🏆', label: 'Champion', earned: completedDays >= 100 },
        { icon: '💪', label: '30-Day Streak', earned: streak >= 30 },
    ];

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    <Text style={styles.title}>Your Progress</Text>
                    <Text style={styles.sub}>Track your cricket transformation</Text>

                    {/* Performance score */}
                    <View style={styles.scoreCard}>
                        <View style={styles.scoreCircle}>
                            <LinearGradient colors={['#00C851', '#00A041']} style={styles.scoreGrad}>
                                <Text style={styles.scoreNum}>{performanceScore}</Text>
                                <Text style={styles.scoreLabel}>SCORE</Text>
                            </LinearGradient>
                        </View>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.scoreTitle}>Performance Score</Text>
                            <Text style={styles.scoreSub}>Based on consistency & completion</Text>
                            <View style={styles.scoreBar}>
                                <View style={[styles.scoreBarFill, { width: `${performanceScore}%` }]} />
                            </View>
                        </View>
                    </View>

                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <MiniStat value={completedDays} label="Days Done" icon="checkmark-circle-outline" color={COLORS.green} />
                        <MiniStat value={streak} label="Day Streak" icon="flame-outline" color="#F59E0B" />
                        <MiniStat value={`${completionPercent}%`} label="Complete" icon="pie-chart-outline" color="#8B5CF6" />
                    </View>

                    {/* Weekly chart */}
                    {activeWeeks.length >= 2 && (
                        <View style={styles.chartCard}>
                            <Text style={styles.sectionTitle}>Weekly Completion</Text>
                            <LineChart
                                data={chartData}
                                width={width - 56}
                                height={160}
                                chartConfig={{
                                    backgroundColor: '#1A2235',
                                    backgroundGradientFrom: '#1A2235',
                                    backgroundGradientTo: '#1A2235',
                                    color: (opacity = 1) => `rgba(0, 200, 81, ${opacity})`,
                                    labelColor: () => COLORS.textMuted,
                                    style: { borderRadius: 12 },
                                    propsForDots: { r: '5', strokeWidth: '2', stroke: '#00C851' },
                                }}
                                bezier
                                style={{ borderRadius: 12, marginTop: 8 }}
                                withVerticalLines={false}
                                withHorizontalLines={true}
                                fromZero
                            />
                        </View>
                    )}
                    {activeWeeks.length < 2 && (
                        <View style={styles.emptyChart}>
                            <Ionicons name="bar-chart-outline" size={36} color={COLORS.textMuted} />
                            <Text style={styles.emptyChartText}>Complete more days to see your chart</Text>
                        </View>
                    )}

                    {/* Phase breakdown */}
                    <Text style={styles.sectionTitle}>Phase Breakdown</Text>
                    {phaseStats.map(p => (
                        <View key={p.phase} style={styles.phaseRow}>
                            <Text style={styles.phaseEmoji}>{p.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <View style={styles.phaseRowHead}>
                                    <Text style={styles.phaseRowLabel}>Phase {p.phase}: {p.label}</Text>
                                    <Text style={[styles.phaseRowCount, { color: p.color }]}>{p.done}/{p.total}</Text>
                                </View>
                                <View style={styles.phaseMiniTrack}>
                                    <View style={[styles.phaseMiniBar, {
                                        width: `${p.total > 0 ? (p.done / p.total) * 100 : 0}%`,
                                        backgroundColor: p.color
                                    }]} />
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Badges */}
                    <Text style={styles.sectionTitle}>Badges</Text>
                    <View style={styles.badgesGrid}>
                        {BADGES.map((b, i) => (
                            <View key={i} style={[styles.badgeCard, !b.earned && styles.badgeCardLocked]}>
                                <Text style={[styles.badgeIcon, !b.earned && { opacity: 0.25 }]}>{b.icon}</Text>
                                <Text style={[styles.badgeLabel, !b.earned && { color: COLORS.textMuted }]}>{b.label}</Text>
                                {b.earned && <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />}
                            </View>
                        ))}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

function MiniStat({ value, label, icon, color }) {
    return (
        <View style={styles.miniStat}>
            <Ionicons name={icon} size={20} color={color} />
            <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
            <Text style={styles.miniStatLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    scroll: { padding: 20, paddingBottom: 32 },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: COLORS.textPrimary },
    sub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, marginBottom: 20 },
    scoreCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050', borderRadius: 20, padding: 20, marginBottom: 16 },
    scoreCircle: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden' },
    scoreGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    scoreNum: { fontFamily: 'Outfit_900Black', fontSize: 26, color: '#fff' },
    scoreLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#fff', opacity: 0.8, letterSpacing: 1.5 },
    scoreTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary },
    scoreSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textSecondary, marginTop: 2, marginBottom: 10 },
    scoreBar: { height: 6, backgroundColor: '#243050', borderRadius: 3, overflow: 'hidden' },
    scoreBarFill: { height: 6, backgroundColor: COLORS.green, borderRadius: 3 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
    miniStat: { flex: 1, backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
    miniStatValue: { fontFamily: 'Outfit_900Black', fontSize: 22 },
    miniStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.textSecondary },
    chartCard: { backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050', borderRadius: 20, padding: 18, marginBottom: 20 },
    emptyChart: { backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050', borderRadius: 20, padding: 32, alignItems: 'center', gap: 10, marginBottom: 20 },
    emptyChartText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textMuted, textAlign: 'center' },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: COLORS.textPrimary, marginBottom: 12 },
    phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050', borderRadius: 14, padding: 14, marginBottom: 10 },
    phaseEmoji: { fontSize: 22 },
    phaseRowHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    phaseRowLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textPrimary },
    phaseRowCount: { fontFamily: 'Outfit_700Bold', fontSize: 13 },
    phaseMiniTrack: { height: 4, backgroundColor: '#243050', borderRadius: 2, overflow: 'hidden' },
    phaseMiniBar: { height: 4, borderRadius: 2 },
    badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    badgeCard: { width: (width - 60) / 3, backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#00C85140', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
    badgeCardLocked: { borderColor: '#243050' },
    badgeIcon: { fontSize: 28 },
    badgeLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: COLORS.textPrimary, textAlign: 'center' },
});

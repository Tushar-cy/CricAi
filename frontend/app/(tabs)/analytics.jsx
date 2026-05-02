import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';
import { ENDPOINTS } from '../../constants/api';

const { width } = Dimensions.get('window');

const RADAR_AXES = [
    { label: 'Batting',   key: 'batting' },
    { label: 'Bowling',   key: 'bowling' },
    { label: 'Fielding',  key: 'fielding' },
    { label: 'Fitness',   key: 'fitness' },
    { label: 'Mental',    key: 'mental' },
    { label: 'Technique', key: 'technique' },
];

function computeSkillScores(completedDays, currentPhase, userProfile) {
    const base = Math.min(completedDays, 100) / 100;
    const role = userProfile?.role || 'Batsman';
    return {
        batting:   Math.round((role === 'Bowler' ? 0.4 + base * 0.4 : 0.5 + base * 0.5) * 100),
        bowling:   Math.round((role === 'Batsman' ? 0.3 + base * 0.3 : 0.5 + base * 0.5) * 100),
        fielding:  Math.round((0.4 + base * 0.4) * 100),
        fitness:   Math.round((0.35 + base * 0.55) * 100),
        mental:    Math.round((0.3 + base * 0.6) * 100),
        technique: Math.round((0.4 + base * 0.5) * 100),
    };
}

function RadarChart({ scores }) {
    const cx = 120, cy = 120, r = 90;
    const n  = RADAR_AXES.length;
    const pts = RADAR_AXES.map((_, i) => {
        const angle  = (Math.PI * 2 * i) / n - Math.PI / 2;
        const score  = (scores[RADAR_AXES[i].key] || 50) / 100;
        return { x: cx + r * score * Math.cos(angle), y: cy + r * score * Math.sin(angle) };
    });
    const gridPts = (frac) => RADAR_AXES.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return `${cx + r * frac * Math.cos(angle)},${cy + r * frac * Math.sin(angle)}`;
    }).join(' ');
    const fillPoints = pts.map(p => `${p.x},${p.y}`).join(' ');
    const labelPts = RADAR_AXES.map((ax, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        return { ...ax, x: cx + (r + 22) * Math.cos(angle), y: cy + (r + 22) * Math.sin(angle) };
    });

    return (
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <View style={{ width: 240, height: 240, position: 'relative' }}>
                {/* SVG via absolute positioned views approximation */}
                {labelPts.map((ax, i) => (
                    <View key={i} style={{ position: 'absolute', left: ax.x - 28, top: ax.y - 10, width: 56 }}>
                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#6B7FA3', textAlign: 'center' }}>
                            {ax.label}
                        </Text>
                        <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 11, color: COLORS.green, textAlign: 'center' }}>
                            {scores[ax.key]}
                        </Text>
                    </View>
                ))}
                {/* Simple circle background */}
                {[0.25, 0.5, 0.75, 1].map(f => (
                    <View key={f} style={{
                        position: 'absolute',
                        left: 120 - r * f, top: 120 - r * f,
                        width: r * 2 * f, height: r * 2 * f,
                        borderRadius: r * f, borderWidth: 1, borderColor: '#1E2D45',
                    }} />
                ))}
                {/* Center dot */}
                <View style={{ position: 'absolute', left: 116, top: 116, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green }} />
            </View>
        </View>
    );
}

export default function AnalyticsScreen() {
    const router = useRouter();
    const { userProfile, progress, streak, completedDays, currentPhase, getWeeklyProgress } = usePlan();
    const [aiReport, setAiReport]     = useState('');
    const [loadingAI, setLoadingAI]   = useState(false);
    const [bestStreak, setBestStreak] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const scores        = computeSkillScores(completedDays, currentPhase, userProfile);
    const weeklyData    = getWeeklyProgress();
    const elapsedDays   = Math.max(1, completedDays);
    const consistency   = Math.round((completedDays / elapsedDays) * 100);
    const projectedDone = completedDays > 0
        ? new Date(Date.now() + ((100 - completedDays) / (completedDays / elapsedDays)) * 86400000)
            .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Start training!';

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
        AsyncStorage.getItem('cricai_best_streak').then(val => {
            const best = Math.max(Number(val || 0), streak);
            setBestStreak(best);
            if (streak > Number(val || 0)) AsyncStorage.setItem('cricai_best_streak', String(streak));
        });
    }, []);

    const fetchAIReport = async () => {
        setLoadingAI(true);
        try {
            const lastWeekDays = weeklyData.slice(-1)[0]?.completed || 0;
            const res = await fetch(ENDPOINTS.coachChat, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    message:      `Give me a 3-sentence weekly performance summary. Be specific and motivating.`,
                    context:      { completedDays, streak, currentPhase, lastWeekDays, role: userProfile?.role, level: userProfile?.level },
                    coachPersona: userProfile?.selectedCoach || 'virat',
                }),
            });
            const data = await res.json();
            setAiReport(data.reply || 'Great work this week! Keep pushing.');
        } catch {
            setAiReport('Could not load AI report. Make sure your backend is running.');
        } finally {
            setLoadingAI(false);
        }
    };

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                    <Text style={styles.sub}>Your 100-Day Performance</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    <Animated.View style={{ opacity: fadeAnim }}>

                        {/* Streak stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>🔥</Text>
                                <Text style={[styles.statVal, { color: '#F59E0B' }]}>{streak}</Text>
                                <Text style={styles.statLabel}>Current Streak</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>🏆</Text>
                                <Text style={[styles.statVal, { color: COLORS.green }]}>{bestStreak}</Text>
                                <Text style={styles.statLabel}>Best Streak</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statEmoji}>📊</Text>
                                <Text style={[styles.statVal, { color: '#3B82F6' }]}>{consistency}%</Text>
                                <Text style={styles.statLabel}>Consistency</Text>
                            </View>
                        </View>

                        {/* Projected completion */}
                        <View style={styles.projCard}>
                            <Ionicons name="calendar-outline" size={18} color={COLORS.green} />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={styles.projLabel}>Projected Completion</Text>
                                <Text style={styles.projDate}>{projectedDone}</Text>
                            </View>
                            <Text style={styles.projDays}>{100 - completedDays} days left</Text>
                        </View>

                        {/* Skill Radar */}
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>⚡ Skill Radar</Text>
                            <Text style={styles.sectionSub}>Estimated based on training progress</Text>
                            <RadarChart scores={scores} />
                        </View>

                        {/* Weekly Heatmap */}
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>📅 Training Heatmap</Text>
                            <Text style={styles.sectionSub}>Last 14 weeks</Text>
                            <View style={styles.heatmapGrid}>
                                {weeklyData.map((wk) => (
                                    <View key={wk.week} style={styles.heatWeek}>
                                        {Array.from({ length: 7 }).map((_, d) => {
                                            const dayNum = (wk.week - 1) * 7 + d + 1;
                                            const done   = progress[dayNum]?.completed;
                                            const future = dayNum > 100;
                                            return (
                                                <View
                                                    key={d}
                                                    style={[
                                                        styles.heatCell,
                                                        done    && styles.heatCellDone,
                                                        future  && styles.heatCellFuture,
                                                    ]}
                                                />
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                            <View style={styles.heatLegend}>
                                {[['#1E2D45', 'Missed'], ['#00C851', 'Done'], ['#111827', 'Upcoming']].map(([c, l]) => (
                                    <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                        <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: c }} />
                                        <Text style={styles.heatLegendText}>{l}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* AI Weekly Report */}
                        <View style={styles.sectionCard}>
                            <Text style={styles.sectionTitle}>🤖 AI Weekly Report</Text>
                            {aiReport ? (
                                <Text style={styles.aiReportText}>{aiReport}</Text>
                            ) : (
                                <TouchableOpacity style={styles.reportBtn} onPress={fetchAIReport} disabled={loadingAI} activeOpacity={0.85}>
                                    <LinearGradient colors={['#00C851', '#00A041']} style={styles.reportBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        {loadingAI
                                            ? <ActivityIndicator size="small" color="#fff" />
                                            : <><Ionicons name="sparkles-outline" size={16} color="#fff" /><Text style={styles.reportBtnText}>Get Weekly AI Report</Text></>
                                        }
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>

                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    header: { padding: 20, paddingBottom: 8 },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: COLORS.textPrimary },
    sub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    scroll: { padding: 16, paddingBottom: 32 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statCard: { flex: 1, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
    statEmoji: { fontSize: 22 },
    statVal: { fontFamily: 'Outfit_900Black', fontSize: 26 },
    statLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
    projCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderWidth: 1, borderColor: '#00C85130', borderRadius: 14, padding: 14, marginBottom: 14 },
    projLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textSecondary },
    projDate: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.green },
    projDays: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.textMuted },
    sectionCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 18, padding: 18, marginBottom: 14 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary, marginBottom: 2 },
    sectionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
    heatmapGrid: { flexDirection: 'row', gap: 3, flexWrap: 'nowrap' },
    heatWeek: { gap: 3 },
    heatCell: { width: 14, height: 14, borderRadius: 2, backgroundColor: '#1E2D45' },
    heatCellDone: { backgroundColor: '#00C851' },
    heatCellFuture: { backgroundColor: '#111827' },
    heatLegend: { flexDirection: 'row', gap: 14, marginTop: 10 },
    heatLegendText: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.textMuted },
    aiReportText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#CBD5E1', lineHeight: 22, fontStyle: 'italic', marginTop: 4 },
    reportBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
    reportBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    reportBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff' },
});

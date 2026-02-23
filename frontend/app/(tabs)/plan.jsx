import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Animated, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, PHASES } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';

export default function PlanScreen() {
    const router = useRouter();
    const { trainingPlan, progress, currentDay } = usePlan();
    const [expandedPhase, setExpandedPhase] = useState(null);

    if (!trainingPlan) return null;

    const plan = trainingPlan.plan || [];

    const togglePhase = (phase) => {
        setExpandedPhase(expandedPhase === phase ? null : phase);
    };

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <Text style={styles.title}>Training Plan</Text>
                    <Text style={styles.sub}>100-Day AI-Generated Schedule</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                    {PHASES.map((phaseInfo) => {
                        const phaseDays = plan.filter(d => d.phase === phaseInfo.phase);
                        const doneCount = phaseDays.filter(d => progress[d.dayNumber]?.completed).length;
                        const isExpanded = expandedPhase === phaseInfo.phase;

                        return (
                            <View key={phaseInfo.phase} style={styles.phaseBlock}>
                                {/* Phase header - accordion toggle */}
                                <TouchableOpacity
                                    onPress={() => togglePhase(phaseInfo.phase)}
                                    activeOpacity={0.84}
                                >
                                    <LinearGradient
                                        colors={[phaseInfo.color + '30', phaseInfo.color + '10']}
                                        style={[styles.phaseHeader, { borderColor: phaseInfo.color + '50' }]}
                                    >
                                        <Text style={styles.phaseEmoji}>{phaseInfo.icon}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.phaseNum}>PHASE {phaseInfo.phase}</Text>
                                            <Text style={styles.phaseLabel}>{phaseInfo.label}</Text>
                                            <Text style={[styles.phaseDays, { color: phaseInfo.color }]}>Days {phaseInfo.days}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', gap: 6 }}>
                                            <Text style={[styles.phaseCount, { color: phaseInfo.color }]}>{doneCount}/{phaseDays.length}</Text>
                                            <Ionicons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={18}
                                                color={COLORS.textMuted}
                                            />
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Expandable day list */}
                                {isExpanded && (
                                    <View style={styles.daysList}>
                                        {phaseDays.map((day) => {
                                            const done = progress[day.dayNumber]?.completed;
                                            const isToday = day.dayNumber === currentDay;
                                            return (
                                                <TouchableOpacity
                                                    key={day.dayNumber}
                                                    style={[
                                                        styles.dayRow,
                                                        done && styles.dayRowDone,
                                                        isToday && styles.dayRowToday,
                                                    ]}
                                                    onPress={() => router.push(`/day/${day.dayNumber}`)}
                                                    activeOpacity={0.8}
                                                >
                                                    {/* Day number bubble */}
                                                    <View style={[
                                                        styles.dayNumBubble,
                                                        done && { backgroundColor: COLORS.green },
                                                        isToday && { backgroundColor: phaseInfo.color },
                                                    ]}>
                                                        {done
                                                            ? <Ionicons name="checkmark" size={14} color="#fff" />
                                                            : <Text style={styles.dayNum}>{day.dayNumber}</Text>
                                                        }
                                                    </View>

                                                    <View style={{ flex: 1 }}>
                                                        <View style={styles.dayRowHead}>
                                                            {isToday && (
                                                                <View style={styles.todayPill}>
                                                                    <Text style={styles.todayPillText}>TODAY</Text>
                                                                </View>
                                                            )}
                                                            {day.isRestDay && (
                                                                <View style={styles.restPill}>
                                                                    <Text style={styles.restPillText}>REST</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <Text style={styles.daySkill} numberOfLines={1}>{day.skillTask}</Text>
                                                        <Text style={styles.dayFitness} numberOfLines={1}>{day.fitnessTask}</Text>
                                                    </View>

                                                    <View style={styles.dayMeta}>
                                                        <Text style={styles.dayDuration}>{day.durationMinutes}m</Text>
                                                        <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    header: { padding: 20, paddingBottom: 12 },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: COLORS.textPrimary },
    sub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
    scroll: { paddingHorizontal: 16, paddingBottom: 32 },
    phaseBlock: { marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
    phaseHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 1.5, borderRadius: 16, gap: 14 },
    phaseEmoji: { fontSize: 30 },
    phaseNum: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: COLORS.textMuted, letterSpacing: 1.5 },
    phaseLabel: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary, marginTop: 2 },
    phaseDays: { fontFamily: 'Inter_500Medium', fontSize: 12, marginTop: 2 },
    phaseCount: { fontFamily: 'Outfit_700Bold', fontSize: 16 },
    daysList: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 16, marginTop: 4, overflow: 'hidden' },
    dayRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: '#1E2D45', gap: 12,
    },
    dayRowDone: { opacity: 0.6 },
    dayRowToday: { backgroundColor: '#00C85108' },
    dayNumBubble: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: '#1A2235', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#243050',
    },
    dayNum: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: COLORS.textSecondary },
    dayRowHead: { flexDirection: 'row', gap: 6, marginBottom: 3 },
    todayPill: { backgroundColor: '#00C85125', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
    todayPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: COLORS.green, letterSpacing: 1 },
    restPill: { backgroundColor: '#3B82F620', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
    restPillText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, color: '#3B82F6', letterSpacing: 1 },
    daySkill: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textPrimary },
    dayFitness: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.textSecondary, marginTop: 1 },
    dayMeta: { alignItems: 'flex-end', gap: 2 },
    dayDuration: { fontFamily: 'Inter_400Regular', fontSize: 11, color: COLORS.textMuted },
});

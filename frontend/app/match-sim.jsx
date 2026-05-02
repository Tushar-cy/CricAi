import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
    Animated, ScrollView, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import { usePlan } from '../context/PlanContext';
import { ENDPOINTS } from '../constants/api';

const { width } = Dimensions.get('window');

const SCENARIO_PHASES = [
    { id: 'chase', label: 'Chase Specialist', emoji: '🏃' },
    { id: 'spin',  label: 'Spin Attack',       emoji: '🌀' },
    { id: 'pace',  label: 'Pace Battle',        emoji: '⚡' },
];

export default function MatchSimScreen() {
    const router = useRouter();
    const { userProfile, completedDays } = usePlan();

    const [phase, setPhase]             = useState('idle'); // idle | loading | scenario | result | done
    const [scenario, setScenario]       = useState(null);
    const [selected, setSelected]       = useState(null);
    const [result, setResult]           = useState(null);
    const [score, setScore]             = useState(0);
    const [round, setRound]             = useState(0);
    const MAX_ROUNDS = 5;

    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const fadeAnim  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 60 }),
        ]).start();
    }, [phase]);

    const fetchScenario = async () => {
        setPhase('loading');
        scaleAnim.setValue(0.9);
        fadeAnim.setValue(0);
        setSelected(null);
        setResult(null);
        try {
            const res = await fetch(ENDPOINTS.matchScenario, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ profile: { role: userProfile?.role, level: userProfile?.level } }),
            });
            const data = await res.json();
            setScenario(data);
            setPhase('scenario');
        } catch {
            setScenario({
                scenario: 'Your team needs 15 off the last over. You are on 43*, facing a seam bowler. The field is up. Go.',
                options: [
                    'Play safe, rotate strike and trust your partner',
                    'Attack from ball 1 — go for boundaries every ball',
                    'Mix it — 2s and 3s with one boundary attempt',
                ],
                correctIndex: 2,
                explanation: 'Smart rotation with selective aggression is optimal in this scenario — keeps wickets intact.',
            });
            setPhase('scenario');
        }
    };

    const handleAnswer = async (idx) => {
        setSelected(idx);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const correct = idx === scenario.correctIndex;
        if (correct) {
            setScore(s => s + 1);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setResult({
            correct,
            feedback: correct
                ? `✅ Perfect call! ${scenario.explanation}`
                : `❌ Good try — but: ${scenario.explanation}`,
        });
        setPhase('result');
    };

    const nextRound = () => {
        const newRound = round + 1;
        setRound(newRound);
        if (newRound >= MAX_ROUNDS) {
            setPhase('done');
        } else {
            fetchScenario();
        }
    };

    const restart = () => {
        setScore(0); setRound(0); setScenario(null); setResult(null); setSelected(null);
        setPhase('idle');
    };

    return (
        <LinearGradient colors={['#050810', '#0A0E1A', '#0D1829']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Match Simulator</Text>
                    {round > 0 && (
                        <View style={styles.scoreBadge}>
                            <Text style={styles.scoreText}>{score}/{round}</Text>
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

                        {/* IDLE */}
                        {phase === 'idle' && (
                            <View style={styles.idleCard}>
                                <Text style={styles.idleEmoji}>🏟️</Text>
                                <Text style={styles.idleTitle}>Prove It Mode</Text>
                                <Text style={styles.idleSub}>
                                    5 AI-generated match scenarios. Make the right call. Test your cricket IQ.
                                </Text>
                                <View style={styles.roundInfo}>
                                    <Text style={styles.roundInfoText}>5 Rounds · AI Evaluated · Instant Feedback</Text>
                                </View>
                                <TouchableOpacity style={styles.startBtn} onPress={fetchScenario} activeOpacity={0.85}>
                                    <LinearGradient colors={['#00C851', '#00A041']} style={styles.startBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                        <Ionicons name="play" size={18} color="#fff" />
                                        <Text style={styles.startBtnText}>Start Match Sim</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* LOADING */}
                        {phase === 'loading' && (
                            <View style={styles.loadingCard}>
                                <ActivityIndicator size="large" color={COLORS.green} />
                                <Text style={styles.loadingText}>Generating match scenario...</Text>
                            </View>
                        )}

                        {/* SCENARIO */}
                        {(phase === 'scenario' || phase === 'result') && scenario && (
                            <>
                                {/* Round indicator */}
                                <View style={styles.roundRow}>
                                    {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
                                        <View key={i} style={[styles.roundDot, i < round && styles.roundDotDone, i === round && styles.roundDotActive]} />
                                    ))}
                                    <Text style={styles.roundLabel}>Round {round + 1} of {MAX_ROUNDS}</Text>
                                </View>

                                {/* Scenario card */}
                                <LinearGradient colors={['#1A2235', '#111827']} style={styles.scenarioCard}>
                                    <Text style={styles.scenarioLabel}>🏏 MATCH SITUATION</Text>
                                    <Text style={styles.scenarioText}>{scenario.scenario}</Text>
                                </LinearGradient>

                                {/* Options */}
                                <Text style={styles.optionsLabel}>What do you do?</Text>
                                {scenario.options?.map((opt, i) => {
                                    const isSelected = selected === i;
                                    const isCorrect  = i === scenario.correctIndex;
                                    const showResult = phase === 'result';
                                    let borderCol = '#1E2D45', bgCol = '#111827';
                                    if (showResult && isCorrect)  { borderCol = '#00C851'; bgCol = '#00C85115'; }
                                    if (showResult && isSelected && !isCorrect) { borderCol = '#EF4444'; bgCol = '#EF444415'; }
                                    return (
                                        <TouchableOpacity
                                            key={i}
                                            style={[styles.optionBtn, { borderColor: borderCol, backgroundColor: bgCol }]}
                                            onPress={() => phase === 'scenario' && handleAnswer(i)}
                                            disabled={phase === 'result'}
                                            activeOpacity={0.85}
                                        >
                                            <View style={[styles.optionNum, { backgroundColor: borderCol + '30' }]}>
                                                <Text style={[styles.optionNumText, { color: borderCol }]}>{String.fromCharCode(65 + i)}</Text>
                                            </View>
                                            <Text style={[styles.optionText, showResult && isCorrect && { color: '#00C851' }]}>{opt}</Text>
                                            {showResult && isCorrect && <Ionicons name="checkmark-circle" size={20} color="#00C851" />}
                                            {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color="#EF4444" />}
                                        </TouchableOpacity>
                                    );
                                })}

                                {/* Result feedback */}
                                {phase === 'result' && result && (
                                    <>
                                        <View style={[styles.feedbackCard, { borderColor: result.correct ? '#00C85140' : '#EF444440', backgroundColor: result.correct ? '#00C85110' : '#EF444410' }]}>
                                            <Text style={[styles.feedbackText, { color: result.correct ? '#00C851' : '#EF4444' }]}>{result.feedback}</Text>
                                        </View>
                                        <TouchableOpacity style={styles.nextBtn} onPress={nextRound} activeOpacity={0.85}>
                                            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.nextBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                                <Text style={styles.nextBtnText}>{round + 1 >= MAX_ROUNDS ? 'See Final Score' : 'Next Scenario →'}</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}

                        {/* DONE */}
                        {phase === 'done' && (
                            <View style={styles.doneCard}>
                                <Text style={styles.doneEmoji}>{score >= 4 ? '🏆' : score >= 2 ? '🏏' : '📚'}</Text>
                                <Text style={styles.doneTitle}>Match Sim Complete!</Text>
                                <Text style={styles.doneScore}>{score} / {MAX_ROUNDS}</Text>
                                <Text style={styles.doneSub}>
                                    {score === MAX_ROUNDS ? "Perfect score! You think like a pro." :
                                     score >= 3 ? "Solid cricket IQ. Keep studying scenarios." :
                                     "Room to grow — review the explanations!"}
                                </Text>
                                <TouchableOpacity style={styles.startBtn} onPress={restart} activeOpacity={0.85}>
                                    <LinearGradient colors={['#00C851', '#00A041']} style={styles.startBtnGrad}>
                                        <Ionicons name="refresh" size={18} color="#fff" />
                                        <Text style={styles.startBtnText}>Play Again</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.backToDash} onPress={() => router.back()}>
                                    <Text style={styles.backToDashText}>← Back to Dashboard</Text>
                                </TouchableOpacity>
                            </View>
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
    scoreBadge: { backgroundColor: '#00C85120', borderWidth: 1, borderColor: '#00C85140', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    scoreText: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: COLORS.green },
    scroll: { padding: 20, paddingBottom: 40 },

    idleCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 24, padding: 28, alignItems: 'center' },
    idleEmoji: { fontSize: 64, marginBottom: 16 },
    idleTitle: { fontFamily: 'Outfit_900Black', fontSize: 28, color: '#fff', textAlign: 'center' },
    idleSub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#6B7FA3', textAlign: 'center', lineHeight: 22, marginTop: 8, marginBottom: 16 },
    roundInfo: { backgroundColor: '#1A2235', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, marginBottom: 20 },
    roundInfoText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: COLORS.textMuted },

    loadingCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 16 },
    loadingText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textMuted },

    roundRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    roundDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1E2D45' },
    roundDotDone: { backgroundColor: COLORS.green },
    roundDotActive: { backgroundColor: '#3B82F6', width: 20, borderRadius: 4 },
    roundLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: COLORS.textMuted, marginLeft: 4 },

    scenarioCard: { borderRadius: 18, padding: 20, marginBottom: 16 },
    scenarioLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#4A5568', letterSpacing: 1.5, marginBottom: 10 },
    scenarioText: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: '#fff', lineHeight: 26 },

    optionsLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: COLORS.textSecondary, marginBottom: 10 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 16, padding: 14, marginBottom: 10 },
    optionNum: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    optionNumText: { fontFamily: 'Outfit_700Bold', fontSize: 14 },
    optionText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

    feedbackCard: { borderWidth: 1.5, borderRadius: 16, padding: 16, marginTop: 4, marginBottom: 14 },
    feedbackText: { fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 21 },

    startBtn: { width: '100%', borderRadius: 16, overflow: 'hidden', marginTop: 4 },
    startBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
    startBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },

    nextBtn: { borderRadius: 14, overflow: 'hidden' },
    nextBtnGrad: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    nextBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },

    doneCard: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 24, padding: 28, alignItems: 'center' },
    doneEmoji: { fontSize: 64, marginBottom: 12 },
    doneTitle: { fontFamily: 'Outfit_900Black', fontSize: 24, color: '#fff' },
    doneScore: { fontFamily: 'Outfit_900Black', fontSize: 52, color: COLORS.green, marginVertical: 8 },
    doneSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#6B7FA3', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
    backToDash: { marginTop: 12 },
    backToDashText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textMuted },
});

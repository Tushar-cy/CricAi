import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Animated, Dimensions, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ROLES, LEVELS, FITNESS_LEVELS } from '../constants/theme';
import { usePlan } from '../context/PlanContext';

const { width } = Dimensions.get('window');
const STEPS = 5;

export default function OnboardScreen() {
    const router = useRouter();
    const { saveUserProfile } = usePlan();
    const [step, setStep] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;

    const [form, setForm] = useState({
        name: '',
        age: '',
        role: '',
        level: '',
        availability: 5,
        fitness: '',
    });

    const animateProgress = (toStep) => {
        Animated.timing(progressAnim, {
            toValue: (toStep + 1) / STEPS,
            duration: 350,
            useNativeDriver: false,
        }).start();
    };

    const goNext = () => {
        if (step < STEPS - 1) {
            animateProgress(step + 1);
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const goBack = () => {
        if (step > 0) {
            animateProgress(step - 1);
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const canProceed = () => {
        if (step === 0) return form.name.trim().length > 0;
        if (step === 1) return form.age && parseInt(form.age) > 5 && parseInt(form.age) < 60;
        if (step === 2) return form.role !== '';
        if (step === 3) return form.level !== '';
        if (step === 4) return form.fitness !== '';
        return true;
    };

    const handleSubmit = async () => {
        const profile = {
            name: form.name.trim(),
            age: parseInt(form.age),
            role: form.role,
            level: form.level,
            availability: form.availability,
            fitness: form.fitness,
        };
        await saveUserProfile(profile);
        router.replace('/generating');
    };

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Setup Your Profile</Text>
                    <Text style={styles.stepCount}>{step + 1}/{STEPS}</Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                        {step === 0 && <StepName form={form} setForm={setForm} />}
                        {step === 1 && <StepAge form={form} setForm={setForm} />}
                        {step === 2 && <StepRole form={form} setForm={setForm} />}
                        {step === 3 && <StepLevel form={form} setForm={setForm} />}
                        {step === 4 && <StepFitness form={form} setForm={setForm} />}

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Next button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
                        onPress={goNext}
                        disabled={!canProceed()}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={canProceed() ? ['#00C851', '#00A041'] : ['#243050', '#1A2235']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.nextGradient}
                        >
                            <Text style={styles.nextText}>
                                {step === STEPS - 1 ? '🚀 Generate My Plan' : 'Continue'}
                            </Text>
                            {step < STEPS - 1 && <Ionicons name="arrow-forward" size={18} color="#fff" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

/* ─── Step Components ─── */

function StepName({ form, setForm }) {
    return (
        <View style={styles.step}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>What's your name?</Text>
            <Text style={styles.stepSub}>Let's personalize your training plan</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                value={form.name}
                onChangeText={v => setForm({ ...form, name: v })}
                autoFocus
            />
        </View>
    );
}

function StepAge({ form, setForm }) {
    return (
        <View style={styles.step}>
            <Text style={styles.stepEmoji}>🎂</Text>
            <Text style={styles.stepTitle}>How old are you?</Text>
            <Text style={styles.stepSub}>Your age helps calibrate intensity</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your age (e.g. 19)"
                placeholderTextColor={COLORS.textMuted}
                value={form.age}
                onChangeText={v => setForm({ ...form, age: v.replace(/[^0-9]/g, '') })}
                keyboardType="numeric"
                autoFocus
            />
        </View>
    );
}

function StepRole({ form, setForm }) {
    const ROLE_INFO = {
        'Batsman': { emoji: '🏏', desc: 'Focus on batting technique & run scoring' },
        'Bowler': { emoji: '⚡', desc: 'Focus on pace, spin & wicket-taking skills' },
        'All-Rounder': { emoji: '🌟', desc: 'Balanced batting and bowling training' },
        'Wicketkeeper': { emoji: '🧤', desc: 'Keeping skills + smart batting' },
    };
    return (
        <View style={styles.step}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.stepTitle}>What's your role?</Text>
            <Text style={styles.stepSub}>Select your primary cricket position</Text>
            <View style={styles.optionGrid}>
                {ROLES.map(r => (
                    <TouchableOpacity
                        key={r}
                        style={[styles.optionCard, form.role === r && styles.optionCardActive]}
                        onPress={() => setForm({ ...form, role: r })}
                    >
                        <Text style={styles.optionEmoji}>{ROLE_INFO[r]?.emoji}</Text>
                        <Text style={[styles.optionLabel, form.role === r && styles.optionLabelActive]}>{r}</Text>
                        <Text style={styles.optionDesc}>{ROLE_INFO[r]?.desc}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

function StepLevel({ form, setForm }) {
    const LEVEL_INFO = {
        'Beginner': { emoji: '🌱', desc: 'Just started, learning basics' },
        'Intermediate': { emoji: '🔥', desc: 'Club level, some experience' },
        'Advanced': { emoji: '🏆', desc: 'Competitive, district-level+' },
    };
    return (
        <View style={styles.step}>
            <Text style={styles.stepEmoji}>📊</Text>
            <Text style={styles.stepTitle}>Experience level?</Text>
            <Text style={styles.stepSub}>Be honest — AI calibrates by this</Text>
            <View style={{ gap: 12, marginTop: 16 }}>
                {LEVELS.map(l => (
                    <TouchableOpacity
                        key={l}
                        style={[styles.levelCard, form.level === l && styles.levelCardActive]}
                        onPress={() => setForm({ ...form, level: l })}
                    >
                        <Text style={styles.levelEmoji}>{LEVEL_INFO[l]?.emoji}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.levelLabel, form.level === l && { color: COLORS.green }]}>{l}</Text>
                            <Text style={styles.levelDesc}>{LEVEL_INFO[l]?.desc}</Text>
                        </View>
                        {form.level === l && <Ionicons name="checkmark-circle" size={22} color={COLORS.green} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

function StepFitness({ form, setForm }) {
    const COLOR_MAP = { 'Below Average': '#EF4444', 'Average': '#F59E0B', 'Above Average': '#3B82F6', 'Athlete': '#00C851' };
    return (
        <View style={styles.step}>
            <Text style={styles.stepEmoji}>💪</Text>
            <Text style={styles.stepTitle}>Fitness level?</Text>
            <Text style={styles.stepSub}>Honest answer = better plan</Text>
            <View style={{ gap: 12, marginTop: 16 }}>
                {FITNESS_LEVELS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.levelCard, form.fitness === f && { borderColor: COLOR_MAP[f], backgroundColor: COLOR_MAP[f] + '15' }]}
                        onPress={() => setForm({ ...form, fitness: f })}
                    >
                        <View style={[styles.fitnessBar, { backgroundColor: COLOR_MAP[f] }]} />
                        <Text style={[styles.levelLabel, { marginLeft: 12 }, form.fitness === f && { color: COLOR_MAP[f] }]}>{f}</Text>
                        {form.fitness === f && <Ionicons name="checkmark-circle" size={22} color={COLOR_MAP[f]} />}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, justifyContent: 'space-between' },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#1A2235', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 16, color: COLORS.textPrimary },
    stepCount: { fontFamily: 'Inter_500Medium', fontSize: 13, color: COLORS.textSecondary },
    progressTrack: { height: 4, backgroundColor: '#1A2235', marginHorizontal: 20 },
    progressFill: { height: 4, backgroundColor: COLORS.green, borderRadius: 2 },
    content: { flexGrow: 1, padding: 24 },
    step: { flex: 1 },
    stepEmoji: { fontSize: 44, marginBottom: 12 },
    stepTitle: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: COLORS.textPrimary, marginBottom: 6 },
    stepSub: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
    input: {
        backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050',
        borderRadius: 14, padding: 18, fontFamily: 'Inter_400Regular',
        fontSize: 16, color: COLORS.textPrimary,
    },
    optionGrid: { gap: 12 },
    optionCard: {
        backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050',
        borderRadius: 16, padding: 16,
    },
    optionCardActive: { borderColor: COLORS.green, backgroundColor: '#00C85110' },
    optionEmoji: { fontSize: 28, marginBottom: 6 },
    optionLabel: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary, marginBottom: 2 },
    optionLabelActive: { color: COLORS.green },
    optionDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textSecondary },
    levelCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050',
        borderRadius: 16, padding: 18,
    },
    levelCardActive: { borderColor: COLORS.green, backgroundColor: '#00C85110' },
    levelEmoji: { fontSize: 26, marginRight: 14 },
    levelLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: COLORS.textPrimary, marginBottom: 2 },
    levelDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textSecondary },
    fitnessBar: { width: 6, height: 36, borderRadius: 3 },
    footer: { padding: 20, paddingBottom: 28 },
    nextBtn: { borderRadius: 16, overflow: 'hidden' },
    nextGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
    nextText: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
    nextBtnDisabled: {},
});

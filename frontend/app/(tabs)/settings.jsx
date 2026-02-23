import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, PHASES } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { userProfile, trainingPlan, completedDays, streak, resetAll } = usePlan();
    const [resetting, setResetting] = useState(false);

    const handleReset = () => {
        Alert.alert(
            'Reset Everything?',
            'This will delete your training plan, all progress, and your profile. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        setResetting(true);
                        await resetAll();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const handleRegenerate = () => {
        Alert.alert(
            'Regenerate Plan?',
            'This will generate a new 100-day plan and reset all progress.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Regenerate',
                    onPress: async () => {
                        await resetAll();
                        router.replace('/onboard');
                    },
                },
            ]
        );
    };

    const ROLE_EMOJIS = { Batsman: '🏏', Bowler: '⚡', 'All-Rounder': '🌟', Wicketkeeper: '🧤' };

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    <Text style={styles.title}>Profile</Text>

                    {/* Profile card */}
                    <LinearGradient colors={['#00C85130', '#1A2235']} style={styles.profileCard}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarEmoji}>{ROLE_EMOJIS[userProfile?.role] || '🏏'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.profileName}>{userProfile?.name}</Text>
                            <Text style={styles.profileRole}>{userProfile?.role} · {userProfile?.level}</Text>
                            <Text style={styles.profileAge}>Age {userProfile?.age} · {userProfile?.fitness} Fitness</Text>
                        </View>
                    </LinearGradient>

                    {/* Quick stats */}
                    <View style={styles.statsRow}>
                        <QuickStat value={completedDays} label="Days Done" color={COLORS.green} />
                        <QuickStat value={streak} label="Streak 🔥" color="#F59E0B" />
                        <QuickStat value={`${userProfile?.availability}d/wk`} label="Schedule" color="#3B82F6" />
                    </View>

                    {/* Plan info */}
                    {trainingPlan && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Your Plan</Text>
                            <View style={styles.infoCard}>
                                <InfoRow icon="person-outline" label="Generated for" value={trainingPlan.playerSummary?.name} />
                                <InfoRow icon="baseball-outline" label="Role" value={trainingPlan.playerSummary?.role} />
                                <InfoRow icon="podium-outline" label="Level" value={trainingPlan.playerSummary?.level} />
                                <InfoRow icon="fitness-outline" label="Fitness" value={trainingPlan.playerSummary?.fitness} />
                                <InfoRow icon="calendar-outline" label="Availability" value={`${trainingPlan.playerSummary?.availability} days/week`} />
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Actions</Text>

                        <TouchableOpacity style={styles.actionBtn} onPress={handleRegenerate} activeOpacity={0.84}>
                            <View style={[styles.actionIcon, { backgroundColor: '#3B82F620' }]}>
                                <Ionicons name="refresh-outline" size={20} color="#3B82F6" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.actionLabel}>Regenerate Plan</Text>
                                <Text style={styles.actionSub}>Start fresh with new AI plan</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.actionBtn, { borderColor: '#EF444440' }]} onPress={handleReset} activeOpacity={0.84}>
                            <View style={[styles.actionIcon, { backgroundColor: '#EF444420' }]}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Reset Everything</Text>
                                <Text style={styles.actionSub}>Delete all data and start over</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>

                    {/* About */}
                    <View style={styles.aboutCard}>
                        <Text style={styles.aboutTitle}>CricAI</Text>
                        <Text style={styles.aboutSub}>v1.0.0 · Powered by Google Gemini AI</Text>
                        <Text style={styles.aboutDesc}>
                            Your AI-powered cricket coaching system. 100 structured days of personalized training, built for grassroots players who want to level up.
                        </Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

function QuickStat({ value, label, color }) {
    return (
        <View style={styles.quickStat}>
            <Text style={[styles.quickValue, { color }]}>{value}</Text>
            <Text style={styles.quickLabel}>{label}</Text>
        </View>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={16} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    scroll: { padding: 20, paddingBottom: 40 },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 28, color: COLORS.textPrimary, marginBottom: 16 },
    profileCard: { flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1.5, borderColor: '#00C85140', borderRadius: 20, padding: 20, marginBottom: 16 },
    avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00C85120', borderWidth: 1.5, borderColor: '#00C85150', alignItems: 'center', justifyContent: 'center' },
    avatarEmoji: { fontSize: 28 },
    profileName: { fontFamily: 'Outfit_700Bold', fontSize: 20, color: COLORS.textPrimary },
    profileRole: { fontFamily: 'Inter_500Medium', fontSize: 14, color: COLORS.green, marginTop: 2 },
    profileAge: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    quickStat: { flex: 1, backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050', borderRadius: 14, padding: 14, alignItems: 'center', gap: 3 },
    quickValue: { fontFamily: 'Outfit_900Black', fontSize: 20 },
    quickLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: COLORS.textSecondary },
    section: { marginBottom: 20 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: COLORS.textPrimary, marginBottom: 10 },
    infoCard: { backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050', borderRadius: 18, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#243050' },
    infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: COLORS.textSecondary, flex: 1 },
    infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: COLORS.textPrimary },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1A2235', borderWidth: 1.5, borderColor: '#243050', borderRadius: 16, padding: 16, marginBottom: 12 },
    actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: COLORS.textPrimary },
    actionSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
    aboutCard: { backgroundColor: '#1A2235', borderWidth: 1, borderColor: '#243050', borderRadius: 18, padding: 20, alignItems: 'center', gap: 5 },
    aboutTitle: { fontFamily: 'Outfit_900Black', fontSize: 22, color: COLORS.green },
    aboutSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: COLORS.textMuted },
    aboutDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 6 },
});

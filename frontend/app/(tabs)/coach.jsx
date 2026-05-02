import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform, Animated,
    ActivityIndicator, Dimensions, Modal, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/theme';
import { usePlan } from '../../context/PlanContext';
import { ENDPOINTS } from '../../constants/api';

const { width } = Dimensions.get('window');

// ── Coach roster ──────────────────────────────────────────────────────────────
const COACHES = [
    {
        key: 'virat', name: 'Coach Virat', tag: 'Intense & Technical',
        gradient: ['#FF6B35', '#FF3B30'], emoji: '🔥', gender: 'male',
        bio: 'Desi intensity. Zero mercy. All results.',
        intro: "Yaar, tu yahaan aa gaya — that means you're serious. 🔥 I'm Coach Virat. I'll push you hard, fix your technique, and make you mentally unbreakable. Ask me anything — technique, drills, or match strategy. Let's get to work, bhai!",
    },
    {
        key: 'rashid', name: 'Coach Rashid', tag: 'Witty & Fun',
        gradient: ['#FFD700', '#FF9500'], emoji: '⚡', gender: 'male',
        bio: 'Spin wizard energy. Cricket puns included.',
        intro: "Hello hello! Rashid here — ready to SPIN your game into a masterpiece! ⚡ I promise at least one cricket pun per answer, 100% actionable advice, and zero boring drills. What's your googly of a question today?",
    },
    {
        key: 'priya', name: 'Coach Ellyse Perry', tag: 'Sharp & Precise',
        gradient: ['#AF52DE', '#5856D6'], emoji: '💜', gender: 'female',
        bio: 'Elegant. Data-driven. Ruthlessly effective.',
        intro: "Right. Let's skip the pleasantries — I'm Coach Ellyse Perry, and the data says you can be significantly better. 💜 I don't sugarcoat, I fix weaknesses with surgical precision. Tell me what's broken in your game and we'll actually fix it.",
    },
    {
        key: 'deandra', name: 'Coach Lauren', tag: 'Bold & Hyped',
        gradient: ['#00C851', '#34C759'], emoji: '🌴', gender: 'female',
        bio: 'Big energy only. West Indies power vibes.',
        intro: "AYYYY welcome to the big leagues! 🌴 I'm Coach Lauren and we doing this with BIG energy only! You're about to feel like an international superstar after every session. So tell me — what part of your game we upgrading TODAY?!",
    },
];

const COACH_MAP = Object.fromEntries(COACHES.map(c => [c.key, c]));

const QUICK_QUESTIONS = [
    'How do I improve my cover drive?',
    'Best drills for a fast bowler?',
    'How to improve my footwork against spin?',
    'Tips for batting under pressure?',
    'How to bowl a perfect yorker?',
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function CoachScreen() {
    const { userProfile, currentDay, currentPhase, trainingPlan, saveSelectedCoach } = usePlan();

    const [selectedCoach, setSelectedCoach] = useState(null);
    const [showSelection, setShowSelection]  = useState(false);
    const [messages, setMessages]            = useState([]);
    const [input, setInput]                  = useState('');
    const [isTyping, setIsTyping]            = useState(false);

    const listRef = useRef(null);
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    // Load saved coach on mount
    useEffect(() => {
        (async () => {
            const saved = await AsyncStorage.getItem('cricai_coach')
                || userProfile?.selectedCoach
                || 'virat';
            const coach = COACH_MAP[saved] || COACHES[0];
            setSelectedCoach(coach);
            setMessages([{ id: 'intro', role: 'ai', text: coach.intro, timestamp: new Date() }]);
        })();
    }, []);

    // Typing dot animation
    useEffect(() => {
        if (!isTyping) return;
        const anim = (dot, delay) =>
            Animated.loop(Animated.sequence([
                Animated.timing(dot, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
                Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
            ]));
        const a1 = anim(dot1, 0); const a2 = anim(dot2, 150); const a3 = anim(dot3, 300);
        a1.start(); a2.start(); a3.start();
        return () => { a1.stop(); a2.stop(); a3.stop(); };
    }, [isTyping]);

    const handleSelectCoach = async (coach) => {
        setSelectedCoach(coach);
        setShowSelection(false);
        setMessages([{ id: 'intro', role: 'ai', text: coach.intro, timestamp: new Date() }]);
        await AsyncStorage.setItem('cricai_coach', coach.key);
        await saveSelectedCoach(coach.key);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const buildContext = () => ({
        role:       userProfile?.role,
        level:      userProfile?.level,
        dayNumber:  currentDay,
        phase:      currentPhase,
        phaseLabel: trainingPlan?.plan?.find(d => d.dayNumber === currentDay)?.phaseLabel,
    });

    const sendMessage = async (text) => {
        const msg = (text || input).trim();
        if (!msg || !selectedCoach) return;
        setInput('');
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        const userMsg = { id: Date.now().toString(), role: 'user', text: msg, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const res = await fetch(ENDPOINTS.coachChat, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ message: msg, context: buildContext(), coachPersona: selectedCoach.key }),
                signal:  controller.signal,
            });
            clearTimeout(timeout);
            const data = await res.json();
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(), role: 'ai',
                text: data.reply || 'Sorry, something went wrong.',
                coach: data.coach, timestamp: new Date(),
            }]);
        } catch (err) {
            clearTimeout(timeout);
            const isTimeout = err.name === 'AbortError';
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(), role: 'ai',
                text: isTimeout
                    ? '⏱ Request timed out. Is the backend running?'
                    : '⚠️ Cannot reach the server. Check your IP in constants/api.js.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsTyping(false);
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        const coachGrad = selectedCoach?.gradient || ['#00C851', '#00A041'];
        return (
            <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
                {!isUser && (
                    <LinearGradient colors={coachGrad} style={styles.aiAvatar}>
                        <Text style={styles.aiAvatarEmoji}>{selectedCoach?.emoji || '🏏'}</Text>
                    </LinearGradient>
                )}
                <View style={[
                    styles.bubble,
                    isUser ? styles.bubbleUser : styles.bubbleAI,
                    !isUser && { borderColor: coachGrad[0] + '40' },
                ]}>
                    <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    if (!selectedCoach) {
        return (
            <View style={{ flex: 1, backgroundColor: '#050810', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#00C851" />
            </View>
        );
    }

    return (
        <LinearGradient colors={['#050810', '#0A0E1A']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient colors={selectedCoach.gradient} style={styles.headerAvatar}>
                        <Text style={{ fontSize: 18 }}>{selectedCoach.emoji}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.headerTitle}>{selectedCoach.name}</Text>
                        <Text style={styles.headerSub}>{selectedCoach.tag}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.changeBtn}
                        onPress={() => setShowSelection(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="swap-horizontal" size={14} color={COLORS.green} />
                        <Text style={styles.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={m => m.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
                    ListFooterComponent={isTyping ? (
                        <View style={styles.msgRow}>
                            <LinearGradient colors={selectedCoach.gradient} style={styles.aiAvatar}>
                                <Text style={{ fontSize: 18 }}>{selectedCoach.emoji}</Text>
                            </LinearGradient>
                            <View style={styles.typingBubble}>
                                {[dot1, dot2, dot3].map((d, i) => (
                                    <Animated.View key={i} style={[styles.typingDot, { opacity: d }]} />
                                ))}
                            </View>
                        </View>
                    ) : null}
                />

                {/* Quick questions — only on first message */}
                {messages.length <= 1 && (
                    <View style={styles.quickWrap}>
                        <FlatList
                            horizontal
                            data={QUICK_QUESTIONS}
                            keyExtractor={(_, i) => i.toString()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.quickChip} onPress={() => sendMessage(item)} activeOpacity={0.8}>
                                    <Text style={styles.quickChipText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* Input bar */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
                    <View style={styles.inputBar}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask your coach anything..."
                            placeholderTextColor="#4A5568"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            maxLength={500}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage()}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
                            onPress={() => sendMessage()}
                            disabled={!input.trim() || isTyping}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={input.trim() && !isTyping ? selectedCoach.gradient : ['#1A2235', '#1A2235']}
                                style={styles.sendBtnGrad}
                            >
                                {isTyping
                                    ? <ActivityIndicator size="small" color="#4A5568" />
                                    : <Ionicons name="send" size={18} color={input.trim() ? '#fff' : '#4A5568'} />
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>

                {/* Coach Selection Modal */}
                <Modal visible={showSelection} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalSheet}>
                            <Text style={styles.modalTitle}>Choose Your Coach</Text>
                            <Text style={styles.modalSub}>Each coach has a unique personality & style</Text>
                            <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
                                <View style={styles.coachGrid}>
                                    {COACHES.map(coach => (
                                        <TouchableOpacity
                                            key={coach.key}
                                            style={[styles.coachCard, selectedCoach?.key === coach.key && styles.coachCardActive]}
                                            onPress={() => handleSelectCoach(coach)}
                                            activeOpacity={0.85}
                                        >
                                            <LinearGradient colors={coach.gradient} style={styles.coachCardGrad}>
                                                <Text style={styles.coachCardEmoji}>{coach.emoji}</Text>
                                                {selectedCoach?.key === coach.key && (
                                                    <View style={styles.selectedCheck}>
                                                        <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                                    </View>
                                                )}
                                            </LinearGradient>
                                            <Text style={styles.coachCardName}>{coach.name}</Text>
                                            <Text style={styles.coachCardTag}>{coach.tag}</Text>
                                            <Text style={styles.coachCardBio}>{coach.bio}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSelection(false)}>
                                <Text style={styles.closeBtnText}>Keep {selectedCoach?.name}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E2D45' },
    headerAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#fff' },
    headerSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#4A5568', marginTop: 1 },
    changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#00C85115', borderWidth: 1, borderColor: '#00C85130', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
    changeBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: COLORS.green },

    // Messages
    messageList: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
    msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    msgRowUser: { flexDirection: 'row-reverse' },
    aiAvatar: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    aiAvatarEmoji: { fontSize: 17 },
    bubble: { maxWidth: width * 0.72, borderRadius: 18, padding: 13 },
    bubbleAI: { backgroundColor: '#111827', borderWidth: 1, borderBottomLeftRadius: 4 },
    bubbleUser: { backgroundColor: '#00C851', borderBottomRightRadius: 4 },
    bubbleText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#CBD5E1', lineHeight: 21 },
    bubbleTextUser: { color: '#fff' },

    // Typing
    typingBubble: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 14 },
    typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4A5568' },

    // Quick questions
    quickWrap: { paddingVertical: 10 },
    quickChip: { backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    quickChipText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8899BB' },

    // Input
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1E2D45' },
    input: { flex: 1, minHeight: 44, maxHeight: 110, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E2D45', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#CBD5E1' },
    sendBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    sendBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { opacity: 0.5 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: '#0D1526', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '88%' },
    modalTitle: { fontFamily: 'Outfit_900Black', fontSize: 24, color: '#fff', textAlign: 'center' },
    modalSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#4A5568', textAlign: 'center', marginTop: 4 },
    coachGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 },
    coachCard: { width: (width - 60) / 2, backgroundColor: '#111827', borderWidth: 1.5, borderColor: '#1E2D45', borderRadius: 20, overflow: 'hidden' },
    coachCardActive: { borderColor: '#00C851' },
    coachCardGrad: { height: 100, alignItems: 'center', justifyContent: 'center' },
    coachCardEmoji: { fontSize: 44 },
    selectedCheck: { position: 'absolute', top: 8, right: 8 },
    coachCardName: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: '#fff', marginTop: 12, paddingHorizontal: 12 },
    coachCardTag: { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: '#4A5568', letterSpacing: 0.5, paddingHorizontal: 12, marginTop: 2 },
    coachCardBio: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#6B7FA3', paddingHorizontal: 12, paddingVertical: 10, lineHeight: 17 },
    closeBtn: { backgroundColor: '#00C851', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    closeBtnText: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
});

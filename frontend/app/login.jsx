import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, Alert, ActivityIndicator, Dimensions,
    TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const ballAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // If already authenticated, navigate away
    useEffect(() => {
        if (session) {
            router.replace('/');
        }
    }, [session]);

    useEffect(() => {
        // Floating ball
        Animated.loop(
            Animated.sequence([
                Animated.timing(ballAnim, { toValue: -16, duration: 2000, useNativeDriver: true }),
                Animated.timing(ballAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();

        // Pulse ring
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.12, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();

        // Fade in content
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 700, delay: 200, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }

        try {
            setLoading(true);
            
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                Alert.alert('Success!', 'Account created. You can now sign in.');
                setIsSignUp(false); // Switch to sign in mode
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // onAuthStateChange handles navigation
            }
        } catch (err) {
            Alert.alert('Authentication Failed', err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={['#050810', '#0A0E1A', '#0D1829']} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                {/* Background glow orbs */}
                <View style={[styles.glow, { top: -80, right: -80, backgroundColor: '#00C85130' }]} />
                <View style={[styles.glow, { bottom: 120, left: -100, backgroundColor: '#3B82F625', width: 260, height: 260 }]} />
                <View style={[styles.glow, { top: '40%', right: -60, backgroundColor: '#A855F720', width: 200, height: 200 }]} />

                {/* Hero area */}
                <Animated.View style={[styles.heroSection, { transform: [{ translateY: ballAnim }] }]}>
                    <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                    <View style={styles.ballOuter}>
                        <View style={styles.ballInner}>
                            <Text style={styles.ballEmoji}>🏏</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Text content */}
                <Animated.View style={[styles.textBlock, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.welcomeTag}>WELCOME TO</Text>
                    <Text style={styles.title}>CricAI</Text>
                    <Text style={styles.subtitle}>
                        Your AI-powered 100-day cricket{'\n'}training system. Sign in to begin.
                    </Text>
                </Animated.View>

                {/* Feature highlights */}
                <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
                    {[
                        { icon: 'shield-checkmark-outline', label: 'Secure & private' },
                        { icon: 'flash-outline', label: 'Instant access' },
                    ].map((f, i) => (
                        <View key={i} style={styles.featureItem}>
                            <Ionicons name={f.icon} size={15} color={COLORS.green} />
                            <Text style={styles.featureText}>{f.label}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Auth Form */}
                <Animated.View style={[styles.authForm, { opacity: fadeAnim }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#6B7FA3"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        editable={!loading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#6B7FA3"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        editable={!loading}
                    />
                    
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.btnDisabled]}
                        onPress={handleAuth}
                        disabled={loading}
                        activeOpacity={0.88}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#050810" />
                        ) : (
                            <Text style={styles.primaryBtnText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.switchModeBtn}
                        onPress={() => setIsSignUp(!isSignUp)}
                        disabled={loading}
                    >
                        <Text style={styles.switchModeText}>
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>

            </SafeAreaView>
        </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 32 },

    // Glow orbs
    glow: {
        position: 'absolute', width: 280, height: 280,
        borderRadius: 140, opacity: 0.6,
    },

    // Hero
    heroSection: { alignItems: 'center', marginTop: 20 },
    pulseRing: {
        position: 'absolute',
        width: 170, height: 170, borderRadius: 85,
        borderWidth: 1, borderColor: '#00C85128',
    },
    ballOuter: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: '#00C85112',
        borderWidth: 1.5, borderColor: '#00C85135',
        alignItems: 'center', justifyContent: 'center',
    },
    ballInner: {
        width: 108, height: 108, borderRadius: 54,
        backgroundColor: '#00C85120',
        borderWidth: 1.5, borderColor: '#00C85155',
        alignItems: 'center', justifyContent: 'center',
    },
    ballEmoji: { fontSize: 56 },

    // Text
    textBlock: { alignItems: 'center', paddingHorizontal: 24 },
    welcomeTag: {
        fontFamily: 'Inter_600SemiBold', fontSize: 11,
        letterSpacing: 4, color: COLORS.green, marginBottom: 8,
    },
    title: {
        fontFamily: 'Outfit_900Black', fontSize: 68,
        color: '#FFFFFF', letterSpacing: -2, lineHeight: 72,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular', fontSize: 16,
        color: '#8899BB', textAlign: 'center', lineHeight: 26, marginTop: 10,
    },

    // Features
    features: {
        flexDirection: 'row', gap: 18,
        paddingHorizontal: 24,
    },
    featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    featureText: {
        fontFamily: 'Inter_500Medium', fontSize: 12, color: '#6B7FA3',
    },

    // Auth Form
    authForm: { width: '100%', paddingHorizontal: 24, gap: 14, marginTop: 10 },
    input: {
        width: '100%',
        backgroundColor: '#1E2D45',
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 16,
        color: '#FFFFFF',
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2A3F5C'
    },
    primaryBtn: {
        width: '100%',
        backgroundColor: '#00C851',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 6,
        elevation: 8,
        shadowColor: '#00C851', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    },
    btnDisabled: { opacity: 0.7 },
    primaryBtnText: {
        fontFamily: 'Outfit_700Bold', fontSize: 16, color: '#050810',
    },
    switchModeBtn: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    switchModeText: {
        fontFamily: 'Inter_500Medium', fontSize: 14, color: '#00C851',
    },
});

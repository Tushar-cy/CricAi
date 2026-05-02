import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

/**
 * EmptyState — shown when a screen has no data to display.
 *
 * Props:
 *   title:       string  — main heading
 *   subtitle:    string  — supporting description
 *   emoji:       string  — large decorative emoji (default: 🏏)
 *   actionLabel: string  — button label (optional)
 *   onAction:    fn      — button press handler (optional)
 */
export default function EmptyState({ title, subtitle, emoji = '🏏', actionLabel, onAction }) {
    return (
        <View style={styles.container}>
            <LinearGradient colors={['#00C85115', '#00C85105']} style={styles.emojiCircle}>
                <Text style={styles.emoji}>{emoji}</Text>
            </LinearGradient>

            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

            {actionLabel && onAction && (
                <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.85}>
                    <LinearGradient
                        colors={['#00C851', '#00A041']}
                        style={styles.btnGrad}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                        <Ionicons name="add-circle-outline" size={18} color="#fff" />
                        <Text style={styles.btnText}>{actionLabel}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 32, paddingVertical: 40,
    },
    emojiCircle: {
        width: 120, height: 120, borderRadius: 60,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, borderWidth: 1, borderColor: '#00C85130',
    },
    emoji:    { fontSize: 56 },
    title:    { fontFamily: 'Outfit_700Bold', fontSize: 24, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 10 },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
    btn:      { marginTop: 28, borderRadius: 16, overflow: 'hidden', width: '100%' },
    btnGrad:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
    btnText:  { fontFamily: 'Outfit_700Bold', fontSize: 15, color: '#fff' },
});

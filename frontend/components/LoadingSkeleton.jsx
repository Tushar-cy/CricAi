import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

function PulseBox({ style }) {
    const anim = useRef(new Animated.Value(0.4)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 1,   duration: 800, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return <Animated.View style={[style, { opacity: anim }]} />;
}

export default function LoadingSkeleton() {
    return (
        <View style={styles.container}>
            {/* Header row */}
            <View style={styles.headerRow}>
                <View style={{ flex: 1, gap: 8 }}>
                    <PulseBox style={styles.lineShort} />
                    <PulseBox style={styles.lineLong} />
                </View>
                <PulseBox style={styles.circle} />
            </View>

            {/* Progress card */}
            <PulseBox style={styles.card} />

            {/* Stats row */}
            <View style={styles.statsRow}>
                <PulseBox style={[styles.card, styles.statCard]} />
                <PulseBox style={[styles.card, styles.statCard]} />
                <PulseBox style={[styles.card, styles.statCard]} />
            </View>

            {/* Big card */}
            <PulseBox style={[styles.card, { height: 140 }]} />

            {/* Today card */}
            <PulseBox style={[styles.card, { height: 100 }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 24 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    lineShort: { height: 14, width: 120, borderRadius: 7, backgroundColor: '#1A2235' },
    lineLong:  { height: 22, width: 200, borderRadius: 7, backgroundColor: '#1A2235' },
    circle:    { width: 60, height: 60, borderRadius: 30, backgroundColor: '#1A2235' },
    card:      { backgroundColor: '#111827', borderRadius: 18, height: 90, marginBottom: 14 },
    statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statCard:  { flex: 1, height: 80 },
});

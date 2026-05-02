import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

function TabIcon({ name, focused, label }) {
    return (
        <View style={styles.tabItem}>
            <Ionicons name={name} size={22} color={focused ? COLORS.green : COLORS.textMuted} />
            <Text numberOfLines={1} style={[styles.tabLabel, { color: focused ? COLORS.green : COLORS.textMuted }]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown:    false,
                tabBarStyle:    styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{ title: 'Home', tabBarIcon: ({ focused }) => (
                    <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />
                )}}
            />
            <Tabs.Screen
                name="plan"
                options={{ title: 'Plan', tabBarIcon: ({ focused }) => (
                    <TabIcon name={focused ? 'list' : 'list-outline'} focused={focused} label="Plan" />
                )}}
            />
            <Tabs.Screen
                name="coach"
                options={{ title: 'Coach', tabBarIcon: ({ focused }) => (
                    <View style={styles.tabItem}>
                        <View style={[styles.coachIconWrap, focused && styles.coachIconActive]}>
                            <Ionicons
                                name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'}
                                size={20}
                                color={focused ? '#fff' : COLORS.textMuted}
                            />
                        </View>
                        <Text numberOfLines={1} style={[styles.tabLabel, { color: focused ? COLORS.green : COLORS.textMuted }]}>
                            Coach
                        </Text>
                    </View>
                )}}
            />
            <Tabs.Screen
                name="analytics"
                options={{ title: 'Analytics', tabBarIcon: ({ focused }) => (
                    <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} label="Analytics" />
                )}}
            />
            <Tabs.Screen
                name="settings"
                options={{ title: 'Profile', tabBarIcon: ({ focused }) => (
                    <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Profile" />
                )}}
            />
            {/* Hide progress tab if it still exists */}
            <Tabs.Screen name="progress" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#0A0E1A',
        borderTopWidth: 1,
        borderTopColor: '#1E2D45',
        height: 64,
        paddingBottom: 8,
        paddingTop: 4,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2, minWidth: 65 },
    tabLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, textAlign: 'center' },
    coachIconWrap: {
        width: 34, height: 34, borderRadius: 17,
        alignItems: 'center', justifyContent: 'center',
    },
    coachIconActive: {
        backgroundColor: '#00C851',
        shadowColor: '#00C851', shadowOpacity: 0.6, shadowRadius: 8,
    },
});

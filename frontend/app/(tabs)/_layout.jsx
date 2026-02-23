import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../../constants/theme';

function TabIcon({ name, focused, label, color }) {
    return (
        <View style={styles.tabItem}>
            <Ionicons name={name} size={24} color={focused ? COLORS.green : COLORS.textMuted} />
            <Text style={[styles.tabLabel, { color: focused ? COLORS.green : COLORS.textMuted }]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} label="Home" />
                    ),
                }}
            />
            <Tabs.Screen
                name="plan"
                options={{
                    title: 'Plan',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? 'list' : 'list-outline'} focused={focused} label="Plan" />
                    ),
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} label="Progress" />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} label="Profile" />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#111827',
        borderTopWidth: 1,
        borderTopColor: '#1E2D45',
        height: 68,
        paddingBottom: 8,
        paddingTop: 4,
        elevation: 20,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 16,
    },
    tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2 },
    tabLabel: { fontFamily: 'Inter_500Medium', fontSize: 10 },
});

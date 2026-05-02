import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlanProvider } from '../context/PlanContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Inner component so it can access AuthContext
function RootLayoutNav() {
    const { session, isLoading } = useAuth();
    const router   = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;
        const inAuthGroup = segments[0] === 'login';
        if (!session && !inAuthGroup) {
            router.replace('/login');
        } else if (session && inAuthGroup) {
            router.replace('/');
        }
    }, [session, isLoading, segments]);

    // Show a blank loading screen until we know the auth state
    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#050810', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#00C851" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="index" />
            <Stack.Screen name="onboard" />
            <Stack.Screen name="generating" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)"    options={{ gestureEnabled: false }} />
            <Stack.Screen name="day/[id]"  options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="match-sim" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_900Black,
        Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
    });

    if (!fontsLoaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AuthProvider>
                    <PlanProvider>
                        <StatusBar style="light" />
                        <RootLayoutNav />
                    </PlanProvider>
                </AuthProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

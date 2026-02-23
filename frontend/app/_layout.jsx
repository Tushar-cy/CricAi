import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlanProvider } from '../context/PlanContext';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Outfit_400Regular,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_900Black,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
    });

    if (!fontsLoaded) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PlanProvider>
                    <StatusBar style="light" />
                    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="onboard" />
                        <Stack.Screen name="generating" options={{ gestureEnabled: false }} />
                        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
                        <Stack.Screen name="day/[id]" options={{ animation: 'slide_from_bottom' }} />
                    </Stack>
                </PlanProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

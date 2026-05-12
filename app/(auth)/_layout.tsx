import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Auth Layout - Routes shown before user is authenticated
 * No header, full screen experience
 */
export default function AuthLayout() {
    return (
        <>
            <Stack
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            >
                <Stack.Screen name="login" options={{ title: 'Login' }} />
            </Stack>
            <StatusBar style="auto" />
        </>
    );
}

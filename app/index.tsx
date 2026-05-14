import {
    Redirect
} from 'expo-router';

import {
    ActivityIndicator,
    View
} from 'react-native';

import {
    useAuth
} from '@/hooks/useAuth';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    useCivStore
} from '@/store/appStore';

export default function Index() {

    const {
        currentUser,
        loading: authLoading
    } = useAuth();

    const storeLoading =
        useCivStore(
            (state) => state.loading
        );
    const isDarkMode = useColorScheme() === 'dark';

    if (
        authLoading ||
        storeLoading
    ) {

        return (

            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isDarkMode ? '#0F172A' : '#FDF6E3',
                }}
            >

                <ActivityIndicator />

            </View>
        );
    }

    if (!currentUser) {

        return (
            <Redirect
                href="/(auth)/login"
            />
        );
    }

    return (
        <Redirect
            href="/(tabs)"
        />
    );
}
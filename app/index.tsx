import {
    Redirect
} from 'expo-router';


import {
    useAuth
} from '@/hooks/useAuth';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    useCivStore
} from '@/store';
import SplashScreen from './splash';

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
        return <SplashScreen />;
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
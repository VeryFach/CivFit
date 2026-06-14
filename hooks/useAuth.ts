import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';

import {
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';

import * as Application from 'expo-application';

import { auth } from '@/services/firebase';
import { useCivStore } from '@/store';
import { updateLastActive } from '@/services/firebase/activity';
import { initUserProfile } from '@/services/firebase/firestoreUtils';
import { router } from 'expo-router';

// ======================================================

const WEB_CLIENT_ID =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    'ISI_WEB_CLIENT_ID';

// ======================================================

function configureGoogleSignIn() {
    console.log('[AUTH] APP_ID:', Application.applicationId);
    console.log('[AUTH] WEB_CLIENT_ID:', WEB_CLIENT_ID);

    if (WEB_CLIENT_ID === 'ISI_WEB_CLIENT_ID') {
        throw new Error(
            'Google OAuth credentials not configured. Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
        );
    }

    GoogleSignin.configure({
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
        scopes: ['email', 'profile'],
    });

    console.log(
        '[AUTH] GoogleSignin configured:',
        WEB_CLIENT_ID.substring(0, 20) + '...'
    );
}

// ======================================================

export function useGoogleAuth() {
    const handleGoogleAuth = async () => {
        try {
            // Ensure Google Sign-In configured at runtime
            configureGoogleSignIn();

            // Check Play Services
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true,
            });

            console.log('[AUTH] Starting Google sign-in...');

            const result =
                await GoogleSignin.signIn();

            console.log(
                '[AUTH] Google sign-in result:',
                JSON.stringify(result, null, 2)
            );

            if (result.type === 'cancelled') {
                console.log('[AUTH] User cancelled');
                return null;
            }

            const { idToken } = result.data;

            if (!idToken) {
                throw new Error(
                    'Google Sign-In did not return idToken'
                );
            }

            console.log('[AUTH] idToken received');

            // Firebase credential
            const credential =
                GoogleAuthProvider.credential(idToken);

            const authResult =
                await signInWithCredential(
                    auth,
                    credential
                );

            console.log(
                '[AUTH] Firebase login success:',
                authResult.user.uid
            );

            const uid = authResult.user.uid;

            // Create/init profile
            const userProfile =
                await initUserProfile(uid);

            await updateLastActive(uid);

            // Navigation
            if (!userProfile?.onboardingCompleted) {
                console.log(
                    '[AUTH] Redirecting to onboarding'
                );

                router.replace('/onboarding');
                return authResult;
            }

            console.log(
                '[AUTH] Redirecting to tabs'
            );

            router.replace('/(tabs)');

            return authResult;

        } catch (error: any) {
            if (
                error?.code ===
                statusCodes.SIGN_IN_CANCELLED
            ) {
                console.log(
                    '[AUTH] User cancelled sign-in'
                );
                return null;
            }

            console.error(
                '[AUTH ERROR]',
                JSON.stringify(
                    {
                        code: error?.code,
                        message: error?.message,
                        stack: error?.stack,
                        nativeStackAndroid:
                            error?.nativeStackAndroid,
                        userInfo: error?.userInfo,
                    },
                    null,
                    2
                )
            );

            throw error;
        }
    };

    return {
        request: null,
        response: null,
        useGoogleAuth: handleGoogleAuth,
    };
}

// ======================================================

export function useAuth() {
    const currentUser =
        useCivStore(
            (state) => state.currentUser
        );

    const loading =
        useCivStore(
            (state) => state.loading
        );

    return {
        currentUser,
        loading,
    };
}
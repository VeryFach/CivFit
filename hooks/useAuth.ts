import * as WebBrowser from 'expo-web-browser';

import * as Google from 'expo-auth-session/providers/google';

import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import {
  auth,
} from '@/services/firebase';

import { useCivStore } from '@/store/appStore';


// ======================================================

WebBrowser.maybeCompleteAuthSession();


// ======================================================

const WEB_CLIENT_ID =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '1:137900274417:web:04088dbcb33e9e84e4ef50';

const ANDROID_CLIENT_ID =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
    '1:137900274417:android:f4c81ba4f95e5afce4ef50';

// ======================================================

if (WEB_CLIENT_ID === 'ISI_WEB_CLIENT_ID' || ANDROID_CLIENT_ID === 'ISI_ANDROID_CLIENT_ID') {
    console.warn(
        '[Auth] Google OAuth credentials not configured!\n' +
        'Please set environment variables:\n' +
        '  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID\n' +
        '  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'
    );
}

// ======================================================

export function useGoogleAuth() {

    const [
        request,
        response,
        promptAsync
    ] = Google.useAuthRequest({

        clientId:
            WEB_CLIENT_ID,

        androidClientId:
            ANDROID_CLIENT_ID,

        webClientId:
            WEB_CLIENT_ID,
    });


    const useGoogleAuth =
        async () => {

        try {

            const result =
                await promptAsync();

            if (
                result.type === 'success'
            ) {

                const { id_token } =
                    result.params;

                const credential =
                    GoogleAuthProvider
                        .credential(
                            id_token
                        );

                return await
                    signInWithCredential(
                        auth,
                        credential
                    );
            }

            return null;

        } catch (error) {

            console.warn(
                '[Google Auth Error]',
                error
            );

            return null;
        }
    };


    return {

        request,

        response,

        useGoogleAuth,
    };
}

// ======================================================

export function useAuth() {

    const currentUser = useCivStore((state) => state.currentUser);

    const loading = useCivStore((state) => state.loading);

    return {

        currentUser,

        loading,

    };
}
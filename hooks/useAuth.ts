import {
    GoogleSignin,
    statusCodes,
} from '@react-native-google-signin/google-signin';

import {
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';

import {
    auth,
} from '@/services/firebase';

import { useCivStore } from '@/store';

// import firebaseConfig from '@/firebase-applet-config.json';


// ======================================================

const WEB_CLIENT_ID =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    'ISI_WEB_CLIENT_ID';

    console.log(
    '[Google Web Client ID]',
    WEB_CLIENT_ID
);
// ======================================================

if (WEB_CLIENT_ID === 'ISI_WEB_CLIENT_ID') {
    console.warn(
        '[Auth] Google OAuth credentials not configured!\n' +
        'Please set environment variable:\n' +
        '  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'
    );
}

const webClientProjectNumber =
    WEB_CLIENT_ID
        .split('-')[0];

// if (
//     WEB_CLIENT_ID !== 'ISI_WEB_CLIENT_ID' &&
//     webClientProjectNumber !== firebaseConfig.messagingSenderId
// ) {
//     console.warn(
//         '[Auth] Google Web Client ID does not match Firebase project.\n' +
//         `Expected project number: ${firebaseConfig.messagingSenderId}\n` +
//         `Received project number: ${webClientProjectNumber}`
//     );
// }

GoogleSignin.configure({

    webClientId:
        WEB_CLIENT_ID,

    scopes: [
        'email',
        'profile',
    ],
});

// ======================================================

export function useGoogleAuth() {

    const useGoogleAuth =
        async () => {

        try {

            await GoogleSignin
                .hasPlayServices({
                    showPlayServicesUpdateDialog: true,
                });

            const result =
                await GoogleSignin
                    .signIn();

            if (result.type === 'cancelled') {
                return null;
            }

            const { idToken } =
                result.data;

            if (!idToken) {
                throw new Error(
                    'Google Sign-In did not return an idToken. Check EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.'
                );
            }

            const credential =
                GoogleAuthProvider
                    .credential(
                        idToken
                    );

            return await
                signInWithCredential(
                    auth,
                    credential
                );

        } catch (error: any) {

            if (
                error?.code === statusCodes.SIGN_IN_CANCELLED
            ) {
                return null;
            }

            console.warn(
                '[Google Auth Error]',
                error
            );

            return null;
        }
    };


    return {

        request: null,

        response: null,

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

/**
 * Firebase configuration
 */

import firebaseConfig from '@/firebase-applet-config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    getApp,
    getApps,
    initializeApp,
} from 'firebase/app';

import {
    Auth,
    browserLocalPersistence,
    getAuth,
    GoogleAuthProvider,
    initializeAuth,
    Persistence,
    setPersistence,
} from 'firebase/auth';

import {
    getFirestore,
} from 'firebase/firestore';

import {
    Platform,
} from 'react-native';

// ======================================================
// APP
// ======================================================

const app =
    getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApp();

// ======================================================
// AUTH
// ======================================================

const { getReactNativePersistence } =
    require('@firebase/auth') as {
        getReactNativePersistence: (
            storage: typeof AsyncStorage
        ) => Persistence;
    };

const isBrowser =
    typeof window !== 'undefined';

let auth: Auth;

if (Platform.OS === 'web' && isBrowser) {
    auth = getAuth(app);

    setPersistence(
        auth,
        browserLocalPersistence
    ).catch((error) => {
        console.warn(
            '[Firebase] Web auth persistence failed:',
            error
        );
    });

} else {
    try {
        auth = initializeAuth(
            app,
            {
                persistence:
                    getReactNativePersistence(
                        AsyncStorage
                    ),
            }
        );

        console.log(
            '[Firebase] React Native auth initialized'
        );

    } catch (error: any) {
        if (
            error?.code !==
            'auth/already-initialized'
        ) {
            console.warn(
                '[Firebase] Auth init failed:',
                error
            );
        }

        auth = getAuth(app);
    }
}

export { auth };

// ======================================================
// FIRESTORE (CUSTOM DATABASE)
// ======================================================

const dbId =
    (firebaseConfig as any).firestoreDatabaseId;

if (!dbId) {
    throw new Error(
        '[Firebase] firestoreDatabaseId is missing in firebase-applet-config.json'
    );
}

export const db =
    getFirestore(
        app,
        dbId
    );

console.log(
    `[Firebase] Using Firestore database: ${dbId}`
);

// ======================================================
// GOOGLE PROVIDER
// ======================================================

export const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account',
});
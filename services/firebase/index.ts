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

import { doc, getDoc, getFirestore } from 'firebase/firestore';

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
            '[Firebase] Auth persistence failed:',
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
    } catch (error: any) {
        if (error?.code !== 'auth/already-initialized') {
            console.warn(
                '[Firebase] React Native Auth persistence failed:',
                error
            );
        }

        auth = getAuth(app);
    }
}

export { auth };


// ======================================================
// FIRESTORE
// ======================================================

let firestoreInstance;

try {

    firestoreInstance =
        firebaseConfig.firestoreDatabaseId
            ? getFirestore(
                app,
                firebaseConfig.firestoreDatabaseId
            )
            : getFirestore(app);

} catch (error) {

    console.warn(
        '[Firebase] Firestore fallback:',
        error
    );

    firestoreInstance =
        getFirestore(app);
}

export const db =
    firestoreInstance;


// ======================================================
// GOOGLE PROVIDER
// ======================================================

export const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({

    prompt: 'select_account',
});


// ======================================================
// FIRESTORE TEST
// ======================================================

async function testConnection(
    retries = 3
) {

    try {

        const connectionRef =
            doc(
                db,
                'test',
                'connection'
            );

        const snapshot =
            await getDoc(
                connectionRef
            );

        if (snapshot.exists()) {

            console.log(
                '[Firebase] Connection test passed'
            );

        } else {

            console.warn(
                '[Firebase] test/connection document not found'
            );
        }

    } catch (error: any) {

        console.warn(
            '[Firebase] Connection failed:',
            error?.message || error
        );

        if (retries > 0) {

            setTimeout(() => {

                testConnection(
                    retries - 1
                );

            }, 2000);
        }
    }
}

setTimeout(() => {

    testConnection();

}, 2000);

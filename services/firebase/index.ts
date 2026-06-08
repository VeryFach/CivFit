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
// FIRESTORE - PERBAIKAN
// ======================================================

let firestoreInstance;

// Ambil dbId dari config (mungkin tidak ada)
const dbId = (firebaseConfig as any).firestoreDatabaseId;

// Hanya gunakan custom database jika ID valid dan bukan '(default)'
const useCustomDb = dbId && 
                    typeof dbId === 'string' && 
                    dbId.trim() !== '' && 
                    dbId !== '(default)';

if (useCustomDb) {
    try {
        console.log(`[Firebase] Using custom database: ${dbId}`);
        firestoreInstance = getFirestore(app, dbId);
    } catch (error) {
        console.warn('[Firebase] Custom database failed, using default:', error);
        firestoreInstance = getFirestore(app);
    }
} else {
    console.log('[Firebase] Using default Firestore database');
    firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;


// ======================================================
// GOOGLE PROVIDER
// ======================================================

export const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account',
});


// ======================================================
// FIRESTORE TEST (DINONAKTIFKAN)
// ======================================================
// Hapus atau komentar seluruh blok testConnection untuk menghindari spam error
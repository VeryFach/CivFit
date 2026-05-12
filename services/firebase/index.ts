/**
 * Firebase configuration and initialization
 * Handles auth state and Firestore connection
 */
import firebaseConfig from '@/firebase-applet-config.json';
import { initializeApp } from 'firebase/app';
import {
    browserLocalPersistence,
    getAuth,
    GoogleAuthProvider,
    setPersistence,
    signInWithPopup
} from 'firebase/auth';
import {
    doc,
    getDocFromServer,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Setup persistence for web/mobile
try {
    // For web platform
    setPersistence(auth, browserLocalPersistence).catch(() => {
        // Fallback if not supported
    });
} catch (error) {
    // Persistence setup failed - continue without it
}

// Initialize Firestore with persistent cache for mobile-first behavior
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
}, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// CRITICAL: Validate Connection to Firestore (delayed initialization)
async function testConnection() {
    try {
        const result = await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('[Firebase] Connection test passed');
        return true;
    } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("[Firebase] Client is offline - check your connection");
        } else {
            console.warn('[Firebase] Connection test failed:', error?.message);
        }
        return false;
    }
}

// Delay connection test to allow app to initialize
setTimeout(() => {
    testConnection().catch(() => {
        console.warn('[Firebase] Connection test skipped');
    });
}, 1000);

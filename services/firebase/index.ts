/**
 * Firebase configuration
 */

import firebaseConfig from '@/firebase-applet-config.json';

import {
    getApp,
    getApps,
    initializeApp,
} from 'firebase/app';

import {
    browserLocalPersistence,
    getAuth,
    getReactNativePersistence,
    GoogleAuthProvider,
    initializeAuth,
    setPersistence,
} from 'firebase/auth';

import {
    doc,
    getDoc,
    getFirestore,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';
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

const isBrowser =
    typeof window !== 'undefined';

let auth;

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
    // React Native with AsyncStorage persistence
    const persistence = getReactNativePersistence(AsyncStorage);
    auth = initializeAuth(app, {
        persistence,
    });
}

export { auth };


// ======================================================
// FIRESTORE
// ======================================================

let firestoreInstance;

try {

    firestoreInstance =

        Platform.OS === 'web' &&
        isBrowser

            ? initializeFirestore(
                  app,
                  {
                      databaseId:
                          firebaseConfig.firestoreDatabaseId,

                      localCache:
                          persistentLocalCache({

                              tabManager:
                                  persistentMultipleTabManager(),
                          }),
                  }
              )

            : initializeFirestore(
                  app,
                  {
                      databaseId:
                          firebaseConfig.firestoreDatabaseId,
                  }
              );

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
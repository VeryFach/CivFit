// Re-export Firebase services from submodule
export { handleFirestoreError, OperationType } from './firebase/firestoreUtils';
export { auth, db, googleProvider, signInWithGoogle } from './firebase/index';


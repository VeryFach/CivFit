// Re-export Firebase services from submodules
export { handleFirestoreError, OperationType } from './firebase/firestoreUtils';
export {
    auth,
    db,
    googleProvider,
    signInWithGoogle
} from './firebase/index';

    
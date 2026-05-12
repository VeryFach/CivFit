// Re-export Firebase services

export {

    handleFirestoreError,

    OperationType,

} from './firebase/firestoreUtils';


export {

    auth,

    db,

    googleProvider,

} from './firebase/index';
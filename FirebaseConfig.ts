import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - same as web version
const firebaseConfig = {
  apiKey: 'AIzaSyBpIu5kD0u5x9Zc9ETQPP94txg0s84f3qM',
  authDomain: 'gen-lang-client-0259116762.firebaseapp.com',
  projectId: 'gen-lang-client-0259116762',
  storageBucket: 'gen-lang-client-0259116762.firebasestorage.app',
  messagingSenderId: '137900274417',
  appId: '1:137900274417:web:edfd5648967d1985e4ef50',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with the same database ID as web
export const db = getFirestore(
  app,
  'ai-studio-31c6953d-abfc-4895-b893-d7d3cc27aff2'
);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Validate Connection
async function testConnection() {
  try {
    console.log('Firebase initialized successfully');
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

testConnection();
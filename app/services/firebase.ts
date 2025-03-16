import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { User } from '../models';

// Firebase configuration
// Note: In a real app, you would need to set up your own Firebase project
// and replace these values with your own Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    const userData: User = {
      id: user.uid,
      email: user.email || email,
      displayName: displayName,
      photoURL: user.photoURL || undefined,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };
    
    await setDoc(doc(db, 'users', user.uid), userData);
    
    return userData;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time
    const userRef = doc(db, 'users', user.uid);
    const userData = {
      lastLoginAt: Date.now(),
    };
    
    await updateDoc(userRef, userData);
    
    // Get full user data
    const userDoc = await getDoc(userRef);
    const fullUserData = userDoc.data() as User;
    
    return fullUserData;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || undefined,
    photoURL: user.photoURL || undefined,
    createdAt: 0, // Will be fetched from Firestore
    lastLoginAt: 0, // Will be fetched from Firestore
  };
};

// Firestore data functions for expenses and categories
// These will be implemented in separate service files

export { app, auth, db }; 
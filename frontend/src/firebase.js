// Firebase configuration for Live Net (existing project)
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDm8VXj0nezKEBTgb22IwBFym_pBju_vFk',
  authDomain: 'cards-8397e.firebaseapp.com',
  databaseURL: 'https://cards-8397e-default-rtdb.firebaseio.com',
  projectId: 'cards-8397e',
  storageBucket: 'cards-8397e.firebasestorage.app',
  messagingSenderId: '509372121697',
  appId: '1:509372121697:web:a93b9bd262c764f04c2020',
};

export const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);

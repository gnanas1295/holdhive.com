import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAM5UFPVq-R6sbJJo6Ae5g6ifEa06V1tA",
  authDomain: "storage-92f09.firebaseapp.com",
  projectId: "storage-92f09",
  storageBucket: "storage-92f09.firebasestorage.app",
  messagingSenderId: "1096892677823",
  appId: "1:1096892677823:web:25406b25d36e3a4237d00a",
  measurementId: "G-2VGELC2FSG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


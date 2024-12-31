import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: "AIzaSyCAM5UFPVq-R6sbJJo6Ae5g6ifEa06V1tA",
//   authDomain: "storage-92f09.firebaseapp.com",
//   projectId: "storage-92f09",
//   storageBucket: "storage-92f09.firebasestorage.app",
//   messagingSenderId: "1096892677823",
//   appId: "1:1096892677823:web:25406b25d36e3a4237d00a",
//   measurementId: "G-2VGELC2FSG"
// };

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


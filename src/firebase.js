import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAPx2t8RWY9au9pxIf_TogIMLNFp_OCWL8",
    authDomain: "todoproject-15eba.firebaseapp.com",
    projectId: "todoproject-15eba",
    storageBucket: "todoproject-15eba.firebasestorage.app",
    messagingSenderId: "865169833241",
    appId: "1:865169833241:web:6e329c541e70f2d0865988",
    measurementId: "G-6YK1HQXB79"
  };

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
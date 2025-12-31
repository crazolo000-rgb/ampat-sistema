import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDHmCdSek8WoN1nXpxJex8heiz6DIR6hkw',
  authDomain: 'ampat-sistema.firebaseapp.com',
  projectId: 'ampat-sistema',
  storageBucket: 'ampat-sistema.firebasestorage.app',
  messagingSenderId: '277487451936',
  appId: '1:277487451936:web:368ec4766b3bafa82ca145',
  measurementId: 'G-XSP88HERG9'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

import {create} from 'zustand';
import Toast from 'react-native-toast-message';
import {axiosInstance} from '../lib/axios';
import * as SecureStore from 'expo-secure-store';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import user from '../interfaces/user';
import { loginRequest } from '@/interfaces';

interface AuthState {
  userInstance: user | null;
  isLogingIn: boolean;
  isRegistering?: boolean;
  userNameTaken?: boolean;

  setUser: (user: user | null) => void;

  loginOnLoad: () => Promise<void>;
  loginAsync: (email: string, password: string) => Promise<void>;
  registerAsync: (request:loginRequest) => Promise<void>;
  logoutAsync: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    userInstance: null,
    isLogingIn: false,
    isRegistering: false,
    userNameTaken: false,
    setUser: (user: user | null) => set({ userInstance: user }),
    loginOnLoad: async () => {
        
        set({ isLogingIn: true });
        try {
            
            const uid = await SecureStore.getItemAsync('firebaseUID');            
            if(uid !==null){
            const res = await axiosInstance.get<user>(`/api/users/firebase/${uid}`);
            set({ userInstance: res.data });
            }
        set({ isLogingIn: false });
        } 
        catch (error:any) {
             
            if (error.response?.status === 404) {
        
            await SecureStore.deleteItemAsync('firebaseUID');
            set({ userInstance: null });
            }
    
            set({ isLogingIn: false });
        }

    },
    loginAsync: async (email: string, password: string) => {
        set({ isLogingIn: true });
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            
            const uid = firebaseUser.uid;
            
            await SecureStore.setItemAsync('firebaseUID', uid);
            
            const res = await axiosInstance.get<user>(`/api/users/firebase/${uid}`);
            set({ userInstance: res.data });
        
            set({ isLogingIn: false });
            
            Toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: `Welcome ${res.data.userName}!`,
            });
        } catch (error: any) {
            set({ isLogingIn: false });
            console.error("Login error:", error);
            
            let errorMessage = 'An error occurred during login. Please try again.';
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'User not found. Please check your email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email format.';
            }
            
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: errorMessage,
            });
        }
    },
    registerAsync: async (request : loginRequest) => {
        set({ isRegistering: true });
        try {
            const res = await axiosInstance.post<user>('/api/users/register', request);

            set({ isRegistering: false, userNameTaken: false });
            
            Toast.show({
                type: 'success',
                text1: 'Registration Successful',
                text2: 'Redirecting to login...',
            });
        }
        catch (error: any) {
            let errorMessage = 'An error occurred during registration. Please try again.';
             
            if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || 'Invalid registration data.';
            }
            else if (error.response?.status === 409) {
                set({ userNameTaken: true });
            }
            else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak.';
            }
            set({ isRegistering: false });
            console.error("Registration error:", error);
            
            Toast.show({
                type: 'error',
                text1: 'Registration Failed',
                text2: errorMessage,
            });
        }
    },
    logoutAsync: async () => {
        try{
            await SecureStore.deleteItemAsync('firebaseUID');
            set({ userInstance: null });
            await auth.signOut();
            Toast.show({
                type: 'success',
                text1: 'Logout Successful',
                text2: 'You have been logged out.',
                });
        }
        catch(error:any){
            Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: error.response?.data?.message || 'An error occurred during registration.',
                });
        }
    }
}));
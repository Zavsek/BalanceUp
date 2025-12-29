import { create } from "zustand";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../lib/axios";
import * as SecureStore from "expo-secure-store";
import { auth } from "../services/firebase";
import { signInWithCustomToken, signInWithEmailAndPassword } from "firebase/auth";
import user from "../interfaces/user";
import { registerRequest as registerRequest, registerResponse } from "@/interfaces";

interface AuthState {
  userInstance: user | null;
  checkingAuth: boolean;

  userNameTaken?: boolean;
  loginOnLoad: () => Promise<void>;
  loginAsync: (email: string, password: string, rememberLogin:boolean) => Promise<void>;
  registerAsync: (request: registerRequest) => Promise<void>;
  logoutAsync: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  userInstance: null,
  checkingAuth: false,
  userNameTaken: false,
  loginOnLoad: async () => {
    set({ checkingAuth: true });
    try {
      const uid = await SecureStore.getItemAsync("firebaseUID");
      if (uid !== null) {
        const res = await axiosInstance.get<user>(`/api/users/firebase/${uid}`);
        set({ userInstance: res.data });
      }
      set({ checkingAuth: false });
    } catch (error: any) {
      if (error.response?.status === 404) {
        await SecureStore.deleteItemAsync("firebaseUID");
        set({ userInstance: null });
      }

      set({ checkingAuth: false });
    }
  },
  loginAsync: async (email: string, password: string, rememberLogin:boolean) => {
    set({ checkingAuth: true });
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const firebaseUser = userCredential.user;

      const uid = firebaseUser.uid;
      const token = await firebaseUser.getIdToken();
      //for testing
      console.log(token);
      if(rememberLogin){
        await SecureStore.setItemAsync("firebaseUID", uid);}

      const res = await axiosInstance.post<user>(
      "/api/users/login", 
      {}, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
      set({ userInstance: res.data });

      set({ checkingAuth: false });

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: `Welcome ${res.data.username}!`,
      });
    } catch (error: any) {
      set({ checkingAuth: false });
      console.error("Login error:", error);

      let errorMessage = "An error occurred during login. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "User not found. Please check your email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      }

      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: errorMessage,
      });
    }
  },
  registerAsync: async (request: registerRequest) => {
    set({ checkingAuth: true });
    try {
      const res = await axiosInstance.post<registerResponse>(
        "/api/users/register",
        request
      );

      const token = res.data.token;
      const userCredential = await signInWithCustomToken(auth, token);
      const{username,  localId, gender, createdAt, profilePictureUrl} = res.data
      const user:user = {
        id:localId,
        username:username,
        gender:gender,
        createdAt:createdAt,
        profilePictureUrl:profilePictureUrl
      }
      
      set({ checkingAuth: false, userNameTaken: false, userInstance:user});

      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "Redirecting to login...",
      });
    } catch (error: any) {
      let errorMessage =
        "An error occurred during registration. Please try again.";

      if (error.response?.status === 400) {
        errorMessage =
          error.response?.data?.message || "Invalid registration data.";
          //backend response for username taken
      } else if (error.response?.status === 409) {
        set({ userNameTaken: true });
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      }
      set({ checkingAuth: false });
      console.error("Registration error:", error);

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: errorMessage,
      });
    }
  },
  logoutAsync: async () => {
    try {
    await auth.signOut();
    await SecureStore.deleteItemAsync("firebaseUID");
    set({ userInstance: null });
    
    console.log("Logout successful");
  } catch (error: any) {
    Toast.show({
      type: "error",
      text1: "Logout Failed",
      text2: error.message || "An error occurred during logout.",
    });
  }
  },
}));

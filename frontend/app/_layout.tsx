import { Stack, useRouter, useSegments } from "expo-router";
import './globals.css';
import { Header } from "@react-navigation/elements";
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';
import { useAuthStore } from "../store/useAuthStore";
import { use, useEffect } from "react";
import login from "./(auth)/login";
import LoadingScreen from "./components/LoadingScreen";


export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    ShareTech: require('../assets/fonts/ShareTech-Regular.ttf'),
  });

  const { userInstance, checkingAuth, loginOnLoad } = useAuthStore();
  useEffect(() => {loginOnLoad()}, [loginOnLoad]);
  
  //redirect logic for auth
  useEffect(() => {
    if (!fontsLoaded || checkingAuth) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!userInstance && !inAuthGroup) {
      // not logged in → force login page
      router.replace("/(auth)/login");
    }
    
    if (userInstance && inAuthGroup) {
      // logged in → send to tabs home
      router.replace("/(tabs)");
    }
  }, [userInstance, checkingAuth, fontsLoaded, segments]);
  

  if (!fontsLoaded || checkingAuth) {
    return <LoadingScreen />;
  }

  return <Stack  screenOptions={{headerShown: false}}>

    <Stack.Screen
      name="(tabs)"/>
    <Stack.Screen
      name="events/[id]"/>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
  </Stack>;
}

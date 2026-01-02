import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import './globals.css';
import { useFonts } from 'expo-font';
import { useAuthStore } from "../store/useAuthStore";
import { use, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";


export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const [fontsLoaded] = useFonts({
    ShareTech: require('../assets/fonts/ShareTech-Regular.ttf'),
  });

  const { userInstance, checkingAuth, loginOnLoad } = useAuthStore();
  useEffect(() => {loginOnLoad()}, [loginOnLoad]);
  
  //redirect logic for auth
  useEffect(() => {
    if (!fontsLoaded || checkingAuth) return;
    if (!navigationState?.key) return;
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
  </Stack>;
}

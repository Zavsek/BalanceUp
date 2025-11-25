import { Stack } from "expo-router";
import './globals.css';
import { Header } from "@react-navigation/elements";
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ShareTech: require('../assets/fonts/ShareTech-Regular.ttf'),
  });


  return <Stack >
    <Stack.Screen
      name="(tabs)"
      options={{headerShown: false}
      }/>
    <Stack.Screen
      name="events/[id]"
      options={{headerShown: false}
      }/>
  </Stack>;
}

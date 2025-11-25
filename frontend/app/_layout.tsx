import { Stack } from "expo-router";
import './globals.css';
import { Header } from "@react-navigation/elements";

export default function RootLayout() {
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

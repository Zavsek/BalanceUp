import { Stack } from "expo-router";
import { View } from "react-native";

export default function SocialLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "black" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: "black" },
          animation: "slide_from_right",
        }}
      >
        
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="requests" 
          options={{ 
            title: "Friend Requests",
            headerBackTitle: "Profile", 
          }} 
        />

        <Stack.Screen 
          name="search" 
          options={{ 
            title: "Find People",
            headerBackTitle: "Profile",
          }} 
        />
      </Stack>
    </View>
  );
}
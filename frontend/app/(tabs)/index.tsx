import { ScrollView, Text, View } from "react-native";
import AppHeader from "../components/Header";

export default function Index() {
  return (
    <View className="flex-1  items-center bg-black justify-start">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <AppHeader />
        <Text className="text-golden text-3xl mt-15">Welcome to Balance Up!</Text>

      </ScrollView>
    </View>
  );
}

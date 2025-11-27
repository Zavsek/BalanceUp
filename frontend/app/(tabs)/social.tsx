import { ScrollView, Text, View } from "react-native";
import AppHeader from "../components/Header";

export default function Social() {
  return (
    <View className="flex-1  items-center bg-black justify-start">
      <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
        <AppHeader />

      </ScrollView>
    </View>
  );
}

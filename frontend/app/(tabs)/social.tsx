import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import AppHeader from "../components/Header";
import { useAuthStore } from "../../store/useAuthStore"; 
import { useRouter } from "expo-router";

export default function Social() {
  const { logoutAsync } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAsync();

    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader />
      
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-6 w-full gap-y-10">
          
          <Text className="text-white text-2xl font-black text-center mt-10">
            Community & Social
          </Text>


          <View className="h-40 bg-white/5 border border-white/10 rounded-3xl justify-center items-center">
            <Text className="text-gray-500">Coming Soon: Friend Activity</Text>
          </View>
          <TouchableOpacity 
            onPress={handleLogout}
            activeOpacity={0.7}
            className="w-full h-16 bg-red-500/10 border border-red-500/50 rounded-2xl justify-center items-center"
          >
            <Text className="text-red-500 font-bold uppercase tracking-widest">
              Log Out
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}
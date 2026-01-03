import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { router } from "expo-router"; 
import { useUserStore } from "../../store/useUserStore"; 
import React, { useEffect, useCallback, useState } from "react";
import AddExpenseModal from "../components/AddExpenseModal"; 
import { useAuthStore } from "@/store/useAuthStore";
import { History, Plus, Utensils, Plane, Coffee, Home, Layers, ChevronRight, LayoutGrid} from "lucide-react-native";
import AppHeader from "../components/Header";
import dayjs from "dayjs";

export default function Dashboard() {
  const { dashboard, getDashboard, gettingDashboard } = useUserStore();
  const { userInstance } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (userInstance) {
      getDashboard();
    }
  }, [userInstance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getDashboard();
    setRefreshing(false);
  }, [getDashboard]);


  const renderCategoryIcon = (type: string) => {
    const iconProps = { size: 16, color: "#94a3b8" };
    switch (type) {
      case 'Travel': return <Plane size={16} color="#3b82f6" />;
      case 'Food': return <Utensils size={16} color="#f97316" />;
      case 'Drinks': return <Coffee size={16} color="#eab308" />;
      case 'Accommodation': return <Home size={16} color="#a855f7" />;
      default: return <Layers {...iconProps} />;
    }
  };

  if (gettingDashboard && !dashboard) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <AppHeader />
      
      <ScrollView 
        className="flex-1" 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
      >
        <View className="p-6">
          <Text className="text-white text-3xl font-black italic uppercase tracking-tighter mb-6">
            Overview
          </Text>


          <View className="bg-golden p-8 rounded-[40px] mb-6 shadow-xl">
            <Text className="text-black/60 uppercase text-[10px] font-black tracking-widest mb-1">
              Spent Today
            </Text>
            <Text className="text-black text-5xl font-black italic">
              €{dashboard?.dailySpent?.toFixed(2) || "0.00"}
            </Text>
          </View>



<View className="flex-row gap-3 mb-10">

  <TouchableOpacity 
    onPress={() => setModalVisible(true)}
    activeOpacity={0.8}
    className="flex-[2] h-16 bg-white rounded-2xl flex-row justify-center items-center shadow-sm"
  >
    <Plus color="black" size={20} />
    <Text className="text-black font-black ml-2 uppercase">Add</Text>
  </TouchableOpacity>


  <TouchableOpacity 
    onPress={() => router.push("/expenses")}
    activeOpacity={0.8}
    className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl justify-center items-center"
  >
    <History color="white" size={20} />
    <Text className="text-white text-[10px] font-black mt-1 uppercase">History</Text>
  </TouchableOpacity>


  <TouchableOpacity 
    onPress={() => router.push("/(tabs)/goals")} 
    activeOpacity={0.8}
    className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl justify-center items-center"
  >
    <LayoutGrid color="#FFD700" size={20} />
    <Text className="text-golden text-[10px] font-black mt-1 uppercase">Goals</Text>
  </TouchableOpacity>
</View>

          <View className="flex-row justify-between items-end mb-4 px-1">
            <View>
              <Text className="text-white text-xl font-black uppercase italic">Latest</Text>
              <View className="h-1 w-8 bg-golden rounded-full mt-1" />
            </View>
            <TouchableOpacity 
              onPress={() => router.push("/expenses")} 
              className="flex-row items-center"
            >
              <Text className="text-gray-500 font-bold mr-1">See All</Text>
              <ChevronRight size={16} color="#666" />
            </TouchableOpacity>
          </View>

          <View className="gap-y-2">
            {!dashboard?.recentExpenses || dashboard.recentExpenses.length === 0 ? (
              <Text className="text-gray-600 italic text-center mt-4">No transactions yet.</Text>
            ) : (
              dashboard.recentExpenses.map((item, i) => (
                <View key={i} className="bg-white/5 border border-white/5 p-4 rounded-[24px] flex-row items-center">
                  <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-4">
                    {renderCategoryIcon(item.type)}
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-white font-bold" numberOfLines={1}>{item.description}</Text>
                  </View>

                  <Text className="text-white font-black text-base ml-2">
                    €{item.amount.toFixed(2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>


      <AddExpenseModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}
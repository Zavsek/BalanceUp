import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import AppHeader from "../components/Header";
import { useRouter } from "expo-router";
import { useUserStore } from "../../store/useUserStore"; // Preveri pot
import { useEffect, useCallback, useState } from "react";

export default function Index() {
  const router = useRouter();
  
  const { dashboard, getDashboard, gettingDashboard } = useUserStore();
  const [refreshing, setRefreshing] = useState(false);


  useEffect(() => {
    getDashboard();
  }, []);


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getDashboard();
    setRefreshing(false);
  }, []);


  const calculatePercentage = () => {
    if (!dashboard || !dashboard.dailyLimit || dashboard.dailyLimit === 0) return 0;
    const percent = (dashboard.dailySpent / dashboard.dailyLimit) * 100;
    return Math.min(percent, 100); 
  };

  const percentage = calculatePercentage();


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
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
      >
        <View className="p-6 pb-24 gap-y-8">

          {/* 1. WELCOME & DAILY SNAPSHOT */}
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
              Today's Overview
            </Text>
            
            <View className="bg-white/10 border border-golden/30 p-5 rounded-3xl mt-2">
                <View className="flex-row justify-between items-end mb-2">
                    <View>

                        <Text className="text-white text-3xl font-black">
                            € {dashboard?.dailySpent?.toFixed(2) ?? "0.00"}
                        </Text>
                        <Text className="text-gray-400 text-xs">spent today</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-golden text-xl font-bold">
                            € {dashboard?.dailyLimit?.toFixed(2) ?? "0.00"}
                        </Text>
                        <Text className="text-gray-400 text-xs">daily limit</Text>
                    </View>
                </View>

                <View className="h-4 w-full bg-white/10 rounded-full overflow-hidden mt-3">
                    <View 
                        className="h-full bg-golden shadow-lg shadow-golden" 
                        style={{ width: `${percentage}%` }} 
                    />
                </View>
                <Text className="text-right text-golden/60 text-[10px] mt-1 font-bold">
                    {percentage.toFixed(0)}% USED
                </Text>
            </View>
          </View>

          {/* 2.  ADD EXPENSE */}
          <View className="items-center">
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => console.log("Open Add Expense Modal")}
                className="w-full"
            >
                <View className="h-20 bg-golden rounded-2xl flex-row justify-center items-center shadow-lg shadow-golden/30 border border-white/20">
                    <Text className="text-black text-3xl mr-3 font-light">+</Text>
                    <Text className="text-black text-xl font-black uppercase tracking-widest">
                        Add Expense
                    </Text>
                </View>
            </TouchableOpacity>
          </View>

          {/* 3. SECONDARY ACTIONS GRID */}
          <View className="flex-row gap-4">
            <TouchableOpacity 
              activeOpacity={0.7}
              className="flex-1 h-28 bg-white/5 rounded-2xl border border-white/10 justify-center items-center gap-2 p-3"
              onPress={() => router.push("/(tabs)/goals")} 
            >
               <View className="w-10 h-10 rounded-full bg-golden/10 justify-center items-center mb-1">
                  <Text className="text-golden text-xl">🎯</Text>
               </View>
              <Text className="text-gray-300 font-bold uppercase text-[10px] tracking-widest text-center">
                Spending Goals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
              className="flex-1 h-28 bg-white/5 rounded-2xl border border-white/10 justify-center items-center gap-2 p-3"
            >
               <View className="w-10 h-10 rounded-full bg-blue-500/10 justify-center items-center mb-1">
                  <Text className="text-blue-400 text-xl">📊</Text>
               </View>
              <Text className="text-gray-300 font-bold uppercase text-[10px] tracking-widest text-center">
                Full Analytics
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4. RECENT ACTIVITY */}
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              Latest Transactions
            </Text>

          
            {dashboard?.recentExpenses?.length === 0 && (
                <Text className="text-gray-500 text-center italic mt-2">No expenses today.</Text>
            )}

            {dashboard?.recentExpenses?.map((expense, index) => (
              <View key={index} className="w-full p-4 mb-3 bg-white/5 rounded-2xl border-l-[3px] border-l-golden/50 flex-row justify-between items-center">
                <View>
                    <Text className="text-white font-bold text-base">{expense.description}</Text>
                    <Text className="text-gray-500 text-xs">{expense.type}</Text>
                </View>
                <Text className="text-white font-bold text-base">€ {expense.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
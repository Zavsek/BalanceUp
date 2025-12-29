import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useUserStore } from "../../store/useUserStore";
import AppHeader from "../components/Header";
import GoalBar from "../components/GoalBar";

export default function Goals() {
  const { dashboard, getDashboard, gettingDashboard } = useUserStore();

  useEffect(() => {
    getDashboard();
  }, []);

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

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* TODO: DATE PICKER SECTION */}
        <View className="mb-8">
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                Time Travel
            </Text>
            <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => console.log("TODO: Implement Date Picker")}
                className="flex-row items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl border-dashed"
            >
                <View className="flex-row items-center gap-3">
                    <View className="bg-gray-700/50 w-10 h-10 rounded-full items-center justify-center">
                        <Text className="text-gray-300">📅</Text>
                    </View>
                    <View>
                        <Text className="text-gray-300 font-bold">Select Date</Text>
                        <Text className="text-gray-500 text-xs">View past analytics</Text>
                    </View>
                </View>
                <View className="bg-golden/20 px-3 py-1 rounded-full">
                    <Text className="text-golden text-xs font-bold">TODO</Text>
                </View>
            </TouchableOpacity>
        </View>

        {/* GOALS SECTION */}
        <View className="mb-8">
            <Text className="text-white text-2xl font-black mb-6">Spending Goals</Text>

            <View className="gap-y-6">
                <GoalBar 
                    title="Daily Limit" 
                    spent={dashboard?.dailySpent || 0} 
                    limit={dashboard?.dailyLimit} 
                    period="Today"
                />

                <GoalBar 
                    title="Weekly Limit" 
                    spent={dashboard?.weeklySpent || 0} 
                    limit={dashboard?.weeklyLimit} 
                    period="Last 7 Days"
                />

                <GoalBar 
                    title="Monthly Limit" 
                    spent={dashboard?.monthlySpent || 0} 
                    limit={dashboard?.monthlyLimit} 
                    period="This Month"
                />
            </View>
        </View>

        {/* QUICK STATS */}
        <View className="flex-row gap-4 pb-20">
             <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Monthly Total</Text>
                <Text className="text-white text-xl font-black">
                    € {dashboard?.monthlySpent.toFixed(2)}
                </Text>
             </View>
             
             <View className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/10">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Remaining Daily</Text>
                <Text className={`text-xl font-black ${
                    (dashboard?.dailyLimit && dashboard?.dailySpent > dashboard?.dailyLimit) 
                    ? "text-red-500" : "text-green-500"
                }`}>
                    {dashboard?.dailyLimit 
                        ? `€ ${(dashboard.dailyLimit - dashboard.dailySpent).toFixed(2)}`
                        : "No Limit"}
                </Text>
             </View>
        </View>
      </ScrollView>
    </View>
  );
}
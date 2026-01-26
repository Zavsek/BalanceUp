import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useUserStore } from "../../store/useUserStore";
import AppHeader from "../components/Header";
import Animated, { FadeInDown } from "react-native-reanimated"; 
import GoalBar from "../components/GoalBar";
import EditGoalsModal from "../components/EditGoalsModal"; 
import SpendingsCalendarModal from "../components/SpendingsCalendarModal";
import { Calendar as CalendarIcon } from "lucide-react-native";

export default function Goals() {
  const { dashboard, getDashboard, gettingDashboard } = useUserStore();
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const [isCalendarVisible, setCalendarVisible] = useState(false);

  useEffect(() => { getDashboard(); }, []);

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
        
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-3xl font-black">Goals</Text>
                <TouchableOpacity 
                    onPress={() => setEditModalVisible(true)}
                    className="bg-golden/10 border border-golden/50 px-4 py-2 rounded-full"
                >
                    <Text className="text-golden font-bold">Edit Limits</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>

        <View className="gap-y-8 mb-10">
            {[
                { t: "Daily", s: dashboard?.dailySpent, l: dashboard?.dailyLimit, p: "Today" },
                { t: "Weekly", s: dashboard?.weeklySpent, l: dashboard?.weeklyLimit, p: "Last 7 Days" },
                { t: "Monthly", s: dashboard?.monthlySpent, l: dashboard?.monthlyLimit, p: "This Month" }
            ].map((item, index) => (
                <Animated.View 
                    key={item.t} 
                    entering={FadeInDown.duration(500).delay(200 + index * 100)}
                >
                    <GoalBar 
                        title={`${item.t} Limit`} 
                        spent={item.s || 0} 
                        limit={item.l ?? null} 
                        period={item.p} 
                    />
                </Animated.View>
            ))}
        </View>

        {/* Bottom Section: Monthly Total + Calendar Button */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} className="flex-row gap-4 pb-20">
             {/*  Monthly Total */}
             <View className="flex-1 bg-white/5 p-5 rounded-3xl border border-white/10 shadow-sm">
                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">Monthly Total</Text>
                <Text className="text-white text-2xl font-black">€ {dashboard?.monthlySpent.toFixed(2)}</Text>
             </View>

             {/* Calendar button*/}
             <TouchableOpacity 
                onPress={() => setCalendarVisible(true)}
                className="bg-golden p-5 rounded-3xl shadow-sm items-center justify-center w-24"
             >
                <CalendarIcon color="black" size={28} />
                <Text className="text-black font-black text-[10px] uppercase mt-1">Calendar</Text>
             </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      <EditGoalsModal 
        isVisible={isEditModalVisible} 
        onClose={() => setEditModalVisible(false)}
        goals={{
            dailyLimit: dashboard?.dailyLimit || 0,
            weeklyLimit: dashboard?.weeklyLimit || 0,
            monthlyLimit: dashboard?.monthlyLimit || 0
        }}
      />

      {/*  Calendar Modal */}
      <SpendingsCalendarModal 
        isVisible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
      />

    </View>
  );
}
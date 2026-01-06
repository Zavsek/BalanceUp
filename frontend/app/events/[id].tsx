import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEventStore } from "../../store/useEventStore";
import {
  ArrowLeft,
  Users,
  Receipt,
  Utensils,
  Plane,
  Coffee,
  Home,
  Layers,
  Plus,
} from "lucide-react-native";
import dayjs from "dayjs";

import AddExpenseModal from "../components/AddExpenseModal"; 

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentEvent, getEventInfo } = useEventStore();
  

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (id && typeof id === "string") {
      getEventInfo(id);
    }
  }, [id]);

  const getExpenseIcon = (type: string) => {
    switch (type) {
      case "Food": return <Utensils size={18} color="#f97316" />;
      case "Travel": return <Plane size={18} color="#3b82f6" />;
      case "Drinks": return <Coffee size={18} color="#eab308" />;
      case "Accommodation": return <Home size={18} color="#a855f7" />;
      default: return <Layers size={18} color="#94a3b8" />;
    }
  };

  if (!currentEvent) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const totalSpent = currentEvent.expenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />


      <View className="pt-14 px-4 pb-4 bg-black flex-row items-center gap-4 border-b border-white/5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/10 p-2 rounded-full"
        >
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-white text-xl font-black uppercase italic"
            numberOfLines={1}
          >
            {currentEvent.title}
          </Text>
          <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Created {dayjs(currentEvent.createdAt).format("DD.MM.YYYY")}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

        <View className="bg-golden p-6 rounded-[32px] mb-6 mt-4 shadow-xl shadow-golden/20">
          <Text className="text-black/60 uppercase text-[10px] font-black tracking-widest mb-1">
            Total Group Spending
          </Text>
          <Text className="text-black text-4xl font-black italic">
            €{totalSpent.toFixed(2)}
          </Text>
        </View>


        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <Users size={16} color="#FFD700" />
            <Text className="text-white font-black ml-2 uppercase text-xs tracking-widest">
              Participants
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="gap-x-3"
          >
            {currentEvent.users.map((u) => (
              <View
                key={u.id}
                className="bg-white/10 px-4 py-2 rounded-full border border-white/5"
              >
                <Text className="text-white font-bold">{u.username}</Text>
              </View>
            ))}
          </ScrollView>
        </View>


        <View className="pb-24">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Receipt size={16} color="#FFD700" />
              <Text className="text-white font-black ml-2 uppercase text-xs tracking-widest">
                Expenses
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(true)} 
              className="bg-golden/10 px-3 py-1 rounded-lg border border-golden/20 flex-row items-center"
            >
              <Plus size={14} color="#FFD700" />
              <Text className="text-golden font-black text-[10px] ml-1 uppercase">
                Add New
              </Text>
            </TouchableOpacity>
          </View>

          {currentEvent.expenses.length === 0 ? (
            <View className="bg-white/5 rounded-3xl p-10 items-center border border-dashed border-white/10">
              <Text className="text-gray-500 italic text-center">
                No expenses recorded yet.
              </Text>
            </View>
          ) : (
            currentEvent.expenses.map((expense) => (
              <View
                key={expense.id}
                className="bg-mostlyBlack border border-white/5 p-4 rounded-[24px] mb-4"
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center mr-4 border border-white/5">
                    {getExpenseIcon(expense.type?.toString() || "")}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg leading-tight">
                      {expense.description}
                    </Text>
                    <Text className="text-gray-500 text-[10px] font-bold uppercase mt-1">
                      {dayjs(expense.dateTime).format("MMM DD, HH:mm")}
                    </Text>
                  </View>
                  <Text className="text-white font-black text-xl">
                    €{expense.amount.toFixed(2)}
                  </Text>
                </View>


                <View className="mt-4 pt-4 border-t border-white/5 flex-row flex-wrap gap-2">
                <Text className="text-gray-300">
                  Shares:
                  </Text>
                  {expense.shares.map((share) => (
                      <View
                        key={share.userId}
                        className="bg-white/5 px-2 py-1 rounded-lg border border-white/5"
                      >
                        <Text className="text-[10px] text-gray-400">

                          <Text className="font-bold text-gray-300">
                            {share.username}:
                          </Text>{" "}
                          {share.shareAmount.toFixed(2)}%
                        </Text>
                      </View>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>


      <AddExpenseModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        eventId={id as string}
        participants={currentEvent.users} 
      />

    </View>
  );
}
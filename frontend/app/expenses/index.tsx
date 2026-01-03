import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useExpenseStore } from '../../store/useExpenseStore'; 
import { Trash2, ArrowLeft, Edit3, Plane, Utensils, Coffee, Home, Layers, Plus } from 'lucide-react-native'; 
import dayjs from 'dayjs';
import AddExpenseModal from '../components/AddExpenseModal'; 
import { ExpenseDto } from '@/interfaces';

export default function ExpensesScreen() {
  const { expenses, getExpenses, fetchingExpenses, deleteExpense } = useExpenseStore();
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDto | null>(null);

  useEffect(() => {
    getExpenses();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getExpenses();
    setRefreshing(false);
  }, [getExpenses]);

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'Travel': return <Plane size={18} color="#3b82f6" />;
      case 'Food': return <Utensils size={18} color="#f97316" />;
      case 'Drinks': return <Coffee size={18} color="#eab308" />;
      case 'Accommodation': return <Home size={18} color="#a855f7" />;
      default: return <Layers size={18} color="#94a3b8" />;
    }
  };

  const handleEdit = (item: ExpenseDto) => {
    setSelectedExpense(item);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setSelectedExpense(null); 
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "All Transactions",
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.replace("/(tabs)")} 
              className="p-2 mr-2"
            >
               <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
          )
        }} 
      />

      {fetchingExpenses && !expenses && !refreshing ? (
         <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FFD700" />
         </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 100 }} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />}
        >
          <View className="py-6 gap-y-3">
            {expenses?.length === 0 ? (
               <Text className="text-gray-500 text-center mt-10 font-bold">No transactions found.</Text>
            ) : (
              expenses?.map((item) => (
                <View key={item.id} className="w-full bg-white/5 border border-white/10 rounded-[24px] p-4 flex-row items-center">
                  <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                    {getCategoryIcon(item.type)}
                  </View>

                  <View className="flex-1">
                      <Text className="text-white font-bold text-base" numberOfLines={1}>{item.description}</Text>
                      <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-tighter">
                        {item.type} • {dayjs(item.time).format('DD.MM.YYYY HH:mm')}
                      </Text>
                  </View>

                  <View className="items-end">
                      <Text className="text-golden font-black text-base mb-2">€{item.amount.toFixed(2)}</Text>
                      <View className="flex-row gap-x-2">
                          <TouchableOpacity 
                            onPress={() => handleEdit(item)}
                            className="bg-white/10 p-2 rounded-full border border-white/5"
                          >
                            <Edit3 size={14} color="#ccc" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              Alert.alert("Delete", "Are you sure?", [
                                { text: "Cancel" },
                                { text: "Delete", style: 'destructive', onPress: () => deleteExpense(item.id.toString()) }
                              ]);
                            }}
                            className="bg-red-500/10 p-2 rounded-full border border-red-500/10"
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </TouchableOpacity>
                      </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}


      <TouchableOpacity 
        onPress={handleAddNew}
        activeOpacity={0.8}
        className="absolute bottom-10 right-6 w-16 h-16 bg-golden rounded-full items-center justify-center shadow-2xl shadow-golden/40"
      >
        <Plus color="black" size={32} />
      </TouchableOpacity>


      <AddExpenseModal 
        isVisible={isModalVisible} 
        onClose={() => {
          setModalVisible(false);
          setSelectedExpense(null);
        }} 
        initialData={selectedExpense}
      />
    </View>
  );
}
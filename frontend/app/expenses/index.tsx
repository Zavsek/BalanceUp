import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useExpenseStore } from '../../store/useExpenseStore'; 
import { Trash2, ArrowLeft, Edit3, Plane, Utensils, Coffee, Home, Layers, Plus } from 'lucide-react-native'; 
import dayjs from 'dayjs';
import AddExpenseModal from '../components/AddExpenseModal'; 
import { ExpenseDto } from '@/interfaces';

export default function ExpensesScreen() {

  const { expenses, getExpenses, fetchingExpenses, deleteExpense, resetExpenses } = useExpenseStore();
  const [refreshing, setRefreshing] = useState(false);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDto | null>(null);

  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    if (resetExpenses) resetExpenses();
    await getExpenses();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (resetExpenses) resetExpenses();
    await getExpenses();
    setRefreshing(false);
  }, [getExpenses, resetExpenses]);

  // Funkcija, ki se sproži, ko uporabnik pride do konca seznama
  const handleLoadMore = () => {
    if (!fetchingExpenses) {
      getExpenses();
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'Travel': return <Plane size={18} color="#3b82f6" />;
      case 'Food': return <Utensils size={18} color="#f97316" />;
      case 'Drinks': return <Coffee size={18} color="#eab308" />;
      case 'Accommodation': return <Home size={18} color="#a855f7" />;
      default: return <Layers size={18} color="#94a3b8" />;
    }
  };

  const renderExpenseItem = ({ item }: { item: ExpenseDto }) => (
    <View className="w-full bg-white/5 border border-white/10 rounded-[24px] p-4 flex-row items-center mb-3">
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
                onPress={() => {
                  setSelectedExpense(item);
                  setModalVisible(true);
                }}
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
  );

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "All Transactions",
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="p-2 mr-2">
               <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
          )
        }} 
      />

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        ListEmptyComponent={() => (
          !fetchingExpenses ? (
            <Text className="text-gray-500 text-center mt-10 font-bold">No transactions found.</Text>
          ) : null
        )}
        ListFooterComponent={() => (
          fetchingExpenses && !refreshing ? (
            <View className="py-4">
              <ActivityIndicator color="#FFD700" />
            </View>
          ) : null
        )}
      />

      <TouchableOpacity 
        onPress={() => { setSelectedExpense(null); setModalVisible(true); }}
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
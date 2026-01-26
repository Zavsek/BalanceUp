import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useExpenseStore } from '../../store/useExpenseStore'; 
import { Trash2, ArrowLeft, Edit3, Plane, Utensils, Coffee, Home, Layers, Plus } from 'lucide-react-native'; 
import dayjs from 'dayjs';
import AddExpenseModal from '../components/AddExpenseModal'; 
import { ExpenseDto } from '@/interfaces';

export default function ExpensesScreen() {
  const router = useRouter();
  const { 
    expenses, 
    getExpenses, 
    fetchingExpenses, 
    deleteExpense, 
    resetExpenses,
    pageNumber,
    totalPages 
  } = useExpenseStore();

  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDto | null>(null);

  // Začetni naloži podatke
  useEffect(() => {
    loadInitial();
  }, []);

  const loadInitial = async () => {
    resetExpenses();
    await getExpenses();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    resetExpenses();
    await getExpenses();
    setRefreshing(false);
  }, []);

  // Funkcija, ki se sproži ko prideš do dna
  const handleLoadMore = () => {
    // Preveri če že nalagaš ali če si že na koncu (da ne gnjaviš baze brezveze)
    if (!fetchingExpenses && totalPages !== null && pageNumber < totalPages) {
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
    <View className="w-full bg-[#121212] border border-white/5 rounded-[24px] p-4 flex-row items-center mb-3">
      <View className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center mr-4 border border-white/5">
        {getCategoryIcon(item.type)}
      </View>

      <View className="flex-1">
          <Text className="text-white font-bold text-base" numberOfLines={1}>{item.description}</Text>
          <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">
            {item.type} • {dayjs(item.time).format('DD.MM.YYYY HH:mm')}
          </Text>
      </View>

      <View className="items-end">
          <Text className="text-white font-black text-base mb-2">€{item.amount.toFixed(2)}</Text>
          <View className="flex-row gap-x-2">
              <TouchableOpacity 
                onPress={() => {
                  setSelectedExpense(item);
                  setModalVisible(true);
                }}
                className="bg-white/5 p-2 rounded-xl border border-white/10"
              >
                <Edit3 size={14} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  Alert.alert("Delete", "Remove this transaction?", [
                    { text: "Cancel", style: 'cancel' },
                    { text: "Delete", style: 'destructive', onPress: () => deleteExpense(item.id.toString()) }
                  ]);
                }}
                className="bg-red-500/10 p-2 rounded-xl border border-red-500/20"
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
          title: "ALL TRANSACTIONS",
          headerTitleStyle: { fontFamily: 'System', fontWeight: '900' },
          headerStyle: { backgroundColor: 'black' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="bg-white/10 p-2 rounded-full mr-2">
               <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
          )
        }} 
      />

      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 }}
        
        // PAGINACIJA LOGIKA
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2} // Sproži klic, ko si 20% pred dnom
        
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
        
        ListEmptyComponent={() => (
          !fetchingExpenses ? (
            <View className="mt-20 items-center">
                <Text className="text-gray-500 font-bold italic">No transactions found.</Text>
            </View>
          ) : null
        )}
        
        ListFooterComponent={() => (
          fetchingExpenses && !refreshing ? (
            <View className="py-6">
              <ActivityIndicator color="#FFD700" />
            </View>
          ) : <View className="h-10" />
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => { setSelectedExpense(null); setModalVisible(true); }}
        activeOpacity={0.8}
        className="absolute bottom-10 right-6 w-16 h-16 bg-golden rounded-2xl items-center justify-center shadow-2xl shadow-golden/40"
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
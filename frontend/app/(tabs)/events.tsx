import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventStore } from '../../store/useEventStore';
import { Calendar, ChevronRight, Plus } from 'lucide-react-native';
import dayjs from 'dayjs';
import AppHeader from '../components/Header'; 
import CreateEventModal from '../components/CreateEventModal';

export default function EventsScreen() {
  const router = useRouter();
  const { events, getEvents, fetchingEvents } = useEventStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false); 

  useEffect(() => {
    getEvents();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getEvents();
    setRefreshing(false);
  }, []);

  return (
    <View className="flex-1 bg-black">
      <AppHeader /> 
      
      <View className="px-6 pb-4 pt-2 flex-row justify-between items-center">
        <Text className="text-white text-3xl font-black italic uppercase">My Events</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          className="bg-golden p-2 rounded-xl"
        >
            <Plus color="black" size={24} />
        </TouchableOpacity>
      </View>

      {fetchingEvents && !events && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
          ListEmptyComponent={
            <View className="mt-20 items-center">
               <Text className="text-gray-500 text-center font-bold">No events found.</Text>
               <Text className="text-gray-600 text-sm italic">Start by creating one!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push(`/events/${item.id}`)} 
              className="bg-white/5 border border-white/10 p-5 rounded-[24px] mb-4 flex-row justify-between items-center"
            >
              <View className="flex-1">
                <Text className="text-white text-lg font-bold mb-1">{item.title}</Text>
                <View className="flex-row items-center">
                  <Calendar size={14} color="#666" />
                  <Text className="text-gray-500 text-xs ml-2 font-bold uppercase">
                    {dayjs(item.createdAt).format('MMM DD, YYYY')}
                  </Text>
                </View>
                {item.description && (
                   <Text className="text-gray-400 text-sm mt-2" numberOfLines={1}>{item.description}</Text>
                )}
              </View>
              
              <View className="bg-white/10 p-2 rounded-full">
                <ChevronRight size={20} color="#FFD700" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Vključitev modala */}
      <CreateEventModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}
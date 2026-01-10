import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Keyboard } from 'react-native';
import { useEventStore } from '../../store/useEventStore';
import { useFriendStore } from '../../store/useFriendStore';
import { X, Search, Check, Calendar, Users } from 'lucide-react-native';
import { UserCard } from '@/interfaces'; 

interface CreateEventModalProps {
  isVisible: boolean;
  onClose: () => void;
}


interface DisplayUser {
  id: string;
  username: string;
  type: 'friend' | 'search_result';
}

export default function CreateEventModal({ isVisible, onClose }: CreateEventModalProps) {

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  

  const [query, setQuery] = useState('');
  const [localSearchResults, setLocalSearchResults] = useState<DisplayUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<DisplayUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);


  const { createEvent, creatingEvent, addUserToList } = useEventStore();
  const { 
    friends, 
    showFriendsList, 
    findUsersByUsername, 
    fetchingUsers 
  } = useFriendStore();


  useEffect(() => {
    if (isVisible) {
      showFriendsList(); 
      setQuery('');
      setLocalSearchResults([]);
      setSelectedUsers([]);
      setTitle('');
      setDescription('');
    }
  }, [isVisible]);


  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      const results = await findUsersByUsername(text);
      
      if (results) {

        const mappedResults: DisplayUser[] = results.map(u => ({
          id: u.id,
          username: u.username,
          type: 'search_result'
        }));
        setLocalSearchResults(mappedResults);
      }
      setIsSearching(false);
    } else {
      setLocalSearchResults([]);
    }
  };

  const toggleUserSelection = (user: DisplayUser) => {
    const isSelected = selectedUsers.some(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };


  const handleCreate = async () => {
    if (!title.trim()) return;


    
    selectedUsers.forEach(u => {
      addUserToList(u.id);
    });


    const success = await createEvent(title, description);
    
    if (success) {
      onClose();
    }
  };


  const isQueryActive = query.length > 2;
  
  const dataToShow: DisplayUser[] = isQueryActive 
    ? localSearchResults 
    : (friends || []).map(f => ({
        id: f.userId, 
        username: f.username, 
        type: 'friend'
      }));

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/80 justify-end">
        <TouchableOpacity style={{flex:1}} onPress={onClose} />
        
        <View className="bg-[#121212] h-[85%] w-full rounded-t-[40px] border-t border-white/10 overflow-hidden">
          
          {/* HEADER */}
          <View className="p-6 border-b border-white/5 flex-row justify-between items-center bg-[#121212]">
            <View>
              <Text className="text-white text-2xl font-black italic tracking-tighter uppercase">New Event</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="bg-white/10 p-2 rounded-full">
              <X color="white" size={24} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 p-6">
            
            {/* INPUTS */}
            <View className="gap-y-4 mb-6">
              <TextInput
                placeholder="Title (e.g., Pizza Night)"
                placeholderTextColor="#666"
                value={title}
                onChangeText={setTitle}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-lg font-bold"
              />
              <TextInput
                placeholder="Description"
                placeholderTextColor="#666"
                value={description}
                onChangeText={setDescription}
                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-base"
              />
            </View>

            {/* SEARCH SECTION */}
            <View className="flex-1">
              <Text className="text-golden font-bold uppercase text-xs mb-3 tracking-widest">Invite People</Text>
              
              <View className="bg-white/5 border border-white/10 rounded-2xl flex-row items-center px-4 mb-4 h-12">
                <Search size={18} color="#666" />
                <TextInput
                  placeholder="Search by username..."
                  placeholderTextColor="#666"
                  value={query}
                  onChangeText={handleSearch}
                  className="flex-1 ml-3 text-white font-medium"
                  autoCapitalize="none"
                />
                {isSearching && <ActivityIndicator size="small" color="#FFD700" />}
              </View>

              {/* Selected Users (CHIPS) */}
              {selectedUsers.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {selectedUsers.map(u => (
                    <TouchableOpacity 
                      key={u.id} 
                      onPress={() => toggleUserSelection(u)}
                      className="bg-golden px-3 py-1 rounded-full flex-row items-center"
                    >
                      <Text className="text-black text-xs font-bold mr-1">{u.username}</Text>
                      <X size={12} color="black" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <FlatList
                data={dataToShow}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View className="items-center mt-10">
                    <Users size={40} color="#333" />
                    <Text className="text-gray-600 mt-2 italic">
                       {isQueryActive ? "No users found." : "No friends loaded."}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isSelected = selectedUsers.some(u => u.id === item.id);
                  return (
                    <TouchableOpacity
                      onPress={() => toggleUserSelection(item)}
                      className={`p-4 rounded-2xl mb-2 flex-row items-center border ${isSelected ? 'bg-white/10 border-golden' : 'bg-white/5 border-white/5'}`}
                    >
                      <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                        <Text className="text-white font-bold">{item.username.charAt(0).toUpperCase()}</Text>
                      </View>
                      
                      <View className="flex-1">
                        <Text className={`text-base font-bold ${isSelected ? 'text-golden' : 'text-white'}`}>
                          {item.username}
                        </Text>
                        <Text className="text-gray-500 text-[10px] uppercase">
                           {item.type === 'friend' ? 'Friend' : 'Search Result'}
                        </Text>
                      </View>

                      {isSelected && (
                        <View className="bg-golden w-6 h-6 rounded-full items-center justify-center">
                          <Check size={14} color="black" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>

          {/* CREATE BUTTON */}
          <View className="p-6 border-t border-white/10 bg-[#121212]">
            <TouchableOpacity
              onPress={handleCreate}
              disabled={creatingEvent || !title}
              className={`w-full h-16 rounded-2xl flex-row items-center justify-center ${!title ? 'bg-white/10' : 'bg-golden'}`}
            >
              {creatingEvent ? (
                <ActivityIndicator color="black" />
              ) : (
                <>
                  <Calendar size={20} color={!title ? "#666" : "black"} />
                  <Text className={`font-black uppercase text-lg ml-2 ${!title ? 'text-gray-500' : 'text-black'}`}>
                    Create Event
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
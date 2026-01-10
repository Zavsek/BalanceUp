import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from "react-native";
import { useEventStore } from "../../store/useEventStore";
import { useFriendStore } from "../../store/useFriendStore"; // Uvoz tvojega friend stora
import { X, CheckCircle2, Circle, Search } from "lucide-react-native";

interface AddUsersModalProps {
  isVisible: boolean;
  onClose: () => void;
  eventId: string;
}

export default function AddUsersModal({ isVisible, onClose, eventId }: AddUsersModalProps) {

  const { addUsersToEvent, addedUsers, addUserToList, removeUserFromList } = useEventStore();
  
  const { findUsersByUsername } = useFriendStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await findUsersByUsername(query);
      if (results) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    if (addedUsers.length === 0) return;
    setIsSubmitting(true);
    

    const success = await addUsersToEvent(eventId, addedUsers);
    
    setIsSubmitting(false);
    if (success) {
      setSearchQuery("");
      setSearchResults([]);
      onClose();
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/80">
        <View className="bg-[#121212] rounded-t-[40px] pt-8 px-6 pb-10 border-t border-white/10 h-[85%]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-2xl font-black uppercase italic tracking-tighter">Add Users</Text>
            <TouchableOpacity onPress={onClose} className="bg-white/5 p-2 rounded-full">
              <X color="white" size={24} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 mb-6">
            <Search size={18} color="#FFD700" />
            <TextInput 
              placeholder="Search by username..." 
              placeholderTextColor="#555"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
              className="flex-1 h-12 text-white ml-3 font-bold"
            />
            {isSearching && <ActivityIndicator size="small" color="#FFD700" />}
          </View>

          {/* Results List */}
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {searchResults.map((user) => {
              const isSelected = addedUsers.includes(user.id);
              return (
                <TouchableOpacity 
                  key={user.id} 
                  onPress={() => isSelected ? removeUserFromList(user.id) : addUserToList(user.id)}
                  className={`flex-row items-center p-5 rounded-[24px] mb-3 border ${isSelected ? 'bg-golden border-golden' : 'bg-white/5 border-white/10'}`}
                >
                  <View className="flex-1">
                    <Text className={`font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>
                      {user.username}
                    </Text>
                  </View>
                  {isSelected ? (
                    <CheckCircle2 size={22} color="black" />
                  ) : (
                    <Circle size={22} color="#333" />
                  )}
                </TouchableOpacity>
              );
            })}
            
            {searchQuery.length > 1 && searchResults.length === 0 && !isSearching && (
              <Text className="text-gray-600 text-center italic mt-10">User not found.</Text>
            )}
          </ScrollView>

          {/* Action Button */}
          <View className="mt-4">
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSubmitting || addedUsers.length === 0}
              className={`h-16 rounded-2xl items-center justify-center ${addedUsers.length > 0 ? 'bg-golden' : 'bg-white/5 opacity-20'}`}
            >
              {isSubmitting ? <ActivityIndicator color="black" /> : (
                <Text className="text-black font-black uppercase tracking-widest text-lg">
                  Confirm ({addedUsers.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
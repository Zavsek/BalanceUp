import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from "react-native";
import React, { useEffect, useCallback } from "react";
import { useFriendStore } from "@/store/useFriendStore";
import { UserX, MessageCircle, Search } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function Friends() {
  const { friends, fetchingUsers, showFriendsList, deleteFriend } = useFriendStore();
  const router = useRouter(); 


  useEffect(() => {
    showFriendsList();
  }, []);


  const handleRemoveFriend = (friendshipId: string, username: string) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${username} from your friends?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const success = await deleteFriend(friendshipId);
            if (!success) {
              Alert.alert("Error", "Could not remove friend. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-black px-4 pt-4">
      
      {/* HEADER */}
      <View className="mb-6 mt-2">
        <Text className="text-white text-3xl font-bold">My Friends</Text>
        <Text className="text-gray-400 text-sm">
           {friends ? `${friends.length} connections` : "Loading..."}
        </Text>
      </View>


      {fetchingUsers && !friends ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.friendshipId} 
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={fetchingUsers}
              onRefresh={showFriendsList}
              tintColor="#FFD700"
              colors={["#FFD700"]}
            />
          }
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-20 opacity-50">
              <View className="bg-gray-800 p-6 rounded-full mb-4">
                <Search size={40} color="#666" />
              </View>
              <Text className="text-white font-bold text-lg">No friends yet</Text>
              <Text className="text-gray-500 text-center mt-2 px-10">
                Search for users and start building your network!
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl mb-3 border border-white/5">
              
              {/* Leva stran: Slika in Ime */}
              <TouchableOpacity 
                className="flex-row items-center gap-3 flex-1"
                onPress={() => console.log("Navigate to profile:", item.userId)} // Tu lahko dodaš navigacijo na profil
              >
                <Image
                  source={{ uri: item.profilePictureUrl || "https://i.pravatar.cc/150" }}
                  className="w-12 h-12 rounded-full border border-white/10"
                />
                <View>
                  <Text className="text-white font-bold text-base">{item.username}</Text>
                  <Text className="text-gray-500 text-xs capitalize">{item.gender}</Text>
                </View>
              </TouchableOpacity>


              <View className="flex-row items-center gap-3">
                <TouchableOpacity 
                    className="bg-gray-800 p-2.5 rounded-full"
                    onPress={() => console.log("Open chat with", item.username)}
                >
                  <MessageCircle size={20} color="white" />
                </TouchableOpacity>

                {/* Delete Gumb */}
                <TouchableOpacity
                  onPress={() => handleRemoveFriend(item.friendshipId, item.username)}
                  className="bg-red-500/10 p-2.5 rounded-full border border-red-500/20"
                >
                  <UserX size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
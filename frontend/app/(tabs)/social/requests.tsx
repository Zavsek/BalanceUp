import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import { useFriendStore } from "../../../store/useFriendStore";
import { Check, X, Clock } from "lucide-react-native";

export default function Requests() {
  const { pendingFriendRequests, getPendingFriendRequests, acceptFriendRequest, rejectFriendRequest } = useFriendStore();

  useEffect(() => {
    getPendingFriendRequests();
  }, []);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <View className="flex-1 bg-black px-4 pt-4">
      {pendingFriendRequests === null ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      ) : pendingFriendRequests.length === 0 ? (
        <View className="flex-1 justify-center items-center opacity-50">
          <Text className="text-4xl mb-4">📭</Text>
          <Text className="text-gray-400 font-bold">No pending requests</Text>
        </View>
      ) : (
        <FlatList
          data={pendingFriendRequests}
          keyExtractor={(item) => item.fromUserId.toString()}
          contentContainerStyle={{ gap: 12, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl border border-white/5">
              

              <View className="flex-row items-center gap-3 flex-1">
                <Image
                  source={{ uri: item.user.profilePictureUrl || "https://i.pravatar.cc/150" }}
                  className="w-12 h-12 rounded-full border border-white/10"
                />
                <View className="flex-1">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>
                    {item.user.username}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Clock size={10} color="#666" />
                    <Text className="text-gray-500 text-xs">
                       Received {formatDate(item.sentAt)}
                    </Text>
                  </View>
                </View>
              </View>


              <View className="flex-row gap-2 ml-2">
                <TouchableOpacity 
                    onPress={() => acceptFriendRequest(item.requestId)}
                    className="bg-golden/20 p-2.5 rounded-full border border-golden/50"
                >
                    <Check size={18} color="#FFD700" />
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => rejectFriendRequest(item.requestId)}
                    className="bg-red-500/10 p-2.5 rounded-full border border-red-500/30"
                >
                    <X size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
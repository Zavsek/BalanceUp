import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import AppHeader from "../../components/Header"; 
import { useAuthStore } from "../../../store/useAuthStore";
import { useFriendStore } from "../../../store/useFriendStore";
import { useRouter } from "expo-router";
import { User, Users, UserPlus, LogOut, Edit3, Search } from "lucide-react-native";
import MenuItem from '../../components/MenuItem';

export default function Social() {
  const { logoutAsync, userInstance } = useAuthStore();
  const { numOfPendingFriendRequests, getNumberOfPendingFriendRequests } = useFriendStore();
  const router = useRouter();

  useEffect(() => {
    getNumberOfPendingFriendRequests();
  }, []);

  const handleLogout = async () => {
    await logoutAsync();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-black">
      <AppHeader />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 1. PROFILE HEADER SECTION */}
        <View className="items-center justify-center pt-8 pb-12 bg-black">
            <View className="shadow-lg shadow-golden/50">
                <Image 
                    source={{ uri: userInstance?.profilePictureUrl || "https://i.pravatar.cc/300" }} 
                    className="w-32 h-32 rounded-full border-4 border-golden"
                />
                <TouchableOpacity className="absolute bottom-0 right-0 bg-[#1a1a1a] p-2 rounded-full border border-golden/50">
                    <Edit3 size={16} color="#FFD700" />
                </TouchableOpacity>
            </View>

            <Text className="text-white text-2xl font-black mt-4">
                {userInstance?.username || "User Name"}
            </Text>
        </View>

        {/* 2. MENU CONTAINER */}
        <View className="flex-1 bg-[#1a1a1a] rounded-t-[40px] px-6 pt-10 pb-20 min-h-screen">
            
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 ml-2">
                Account & Social
            </Text>

            {/* Menu Group */}
            <View className="bg-black/40 rounded-3xl overflow-hidden border border-white/5 mb-6">
                

                <MenuItem 
                    icon={<Search size={22} color="white" />} 
                    label="Find New Friends" 
                    onPress={() => router.push("/social/search")}
                />

                <View className="h-[1px] bg-white/5 mx-4" />

                {/* Friend Requests */}
                <MenuItem 
                    icon={<UserPlus size={22} color="white" />} 
                    label="Friend Requests" 
                    onPress={() => router.push("/social/requests")}
                    badge={numOfPendingFriendRequests} 
                />

                <View className="h-[1px] bg-white/5 mx-4" />

                {/* My Friends */}
                <MenuItem 
                    icon={<Users size={22} color="white" />} 
                    label="My Friends" 
                    onPress={() => router.push("/social/friends")}
                />

                <View className="h-[1px] bg-white/5 mx-4" />

                {/* Edit Profile */}
                <MenuItem 
                    icon={<User size={22} color="white" />} 
                    label="Profile Settings" 
                    onPress={() => console.log("Navigate to Edit Profile")}
                />
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
                onPress={handleLogout}
                activeOpacity={0.7}
                className="flex-row items-center justify-center gap-3 bg-red-500/10 border border-red-500/30 p-5 rounded-2xl mt-4"
            >
                <LogOut size={20} color="#ef4444" />
                <Text className="text-red-500 font-bold uppercase tracking-wider">
                    Log Out
                </Text>
            </TouchableOpacity>

            <Text className="text-gray-600 text-center text-xs mt-8">
                Balance Up v1.0.0
            </Text>

        </View>
      </ScrollView>
    </View>
  );
}
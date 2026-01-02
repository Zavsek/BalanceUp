import { View, Text, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react"; 
import { Search as SearchIcon, UserPlus } from "lucide-react-native";
import { useFriendStore } from "@/store/useFriendStore"; 
import { UserCard } from "@/interfaces";
import { ICONS } from '../../../constants/icons';


export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { findUsersByUsername, findUsersById, sendFriendRequest } = useFriendStore();

    const isGuid = (str: string) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return guidRegex.test(str);
    };


    useEffect(() => {

        if (query.trim().length < 2) {
            setResults([]);
            setError("");
            return;
        }


        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            setError("");
            
            try {
                let data: UserCard[] | UserCard | null | undefined;

                if (isGuid(query)) {
                    data = await findUsersById(query);
                    setResults(data ? [data as UserCard] : []);
                } else {
                    data = await findUsersByUsername(query);
                    setResults((data as UserCard[]) || []);
                }

                if (!data || (Array.isArray(data) && data.length === 0)) {
                    setError("No users found");
                }
            } catch (err) {
                setError("Something went wrong");
            } finally {
                setLoading(false);
            }
        }, 500); 

       
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const onAddFriend = async (userId: string) => {
        const success = await sendFriendRequest(userId);
        if (success) {
            Alert.alert("Success", "Friend request sent!");
        } else {
            Alert.alert("Error", "Could not send request.");
        }
    };

    return (
        <View className="flex-1 bg-black px-4 pt-4">
            {/* SEARCH BAR */}
            <View className="flex-row items-center bg-[#1a1a1a] rounded-xl px-4 py-3 border border-white/10 mb-6">
                <SearchIcon size={20} color="#666" />
                <TextInput
                    placeholder="Search by username or ID..."
                    placeholderTextColor="#666"
                    value={query}
                    onChangeText={setQuery}
                    className="flex-1 ml-3 text-white font-medium text-base"
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <ActivityIndicator color="#FFD700" className="mt-4" />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={() => (
                        query.length >= 2 ? (
                            <Text className="text-gray-500 text-center mt-4">{error || "No results"}</Text>
                        ) : null
                    )}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between p-4 bg-white/5 rounded-2xl mb-3">
                            <View className="flex-row items-center gap-3">
                                <Image
                                    source={item.profilePictureUrl 
                                        ? { uri: item.profilePictureUrl } 
                                         : ICONS.defaultUserIcon}
                                    className="w-10 h-10 rounded-full bg-gray-700"
                                />
                                <View>
                                    <Text className="text-white font-bold">{item.username}</Text>
                                    <Text className="text-gray-500 text-xs capitalize">{item.gender}</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => onAddFriend(item.id)}
                                className="bg-golden px-4 py-2 rounded-full"
                            >
                                <View className="flex-row items-center gap-2">
                                    <UserPlus size={16} color="black" />
                                    <Text className="text-black font-bold text-xs">ADD</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}
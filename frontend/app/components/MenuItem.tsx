import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import {ChevronRight} from 'lucide-react-native' 

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    badge?: number;
}

const MenuItem = ({ icon, label, onPress, badge }: MenuItemProps) => {
    return (
        <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-5"
        >
            <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                    {icon}
                </View>
                <Text className="text-white text-base font-semibold">{label}</Text>
            </View>

            <View className="flex-row items-center gap-2">
                {badge && badge > 0 && (
                    <View className="bg-golden px-2 py-0.5 rounded-full">
                        <Text className="text-black text-xs font-bold">{badge} New</Text>
                    </View>
                )}
                <ChevronRight size={20} color="#555" />
            </View>
        </TouchableOpacity>
    );
};
export default MenuItem;
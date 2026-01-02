import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";

interface GoalBarProps {
    title: string;
    spent: number;
    limit: number | null;
    period: string;
}

const GoalBar = ({ title, spent, limit, period }: GoalBarProps) => {

    const hasLimit = limit !== null && limit > 0;
    const percentage = hasLimit ? (spent / limit) * 100 : 0;
    const displayPercent = Math.min(percentage, 100);
    const isOver = hasLimit && spent > limit;

    return (
        <View>
            <View className="flex-row justify-between items-end mb-2">
                <View>
                    <Text className="text-gray-400 text-xs font-bold uppercase">{title}</Text>
                    <Text className="text-gray-500 text-[10px]">{period}</Text>
                </View>
                <View className="items-end">
                     <Text className="text-white font-bold text-base">
                        € {spent.toFixed(2)} 
                        <Text className="text-gray-500 text-xs font-normal">
                             {' '}/ {hasLimit ? `€ ${limit?.toFixed(0)}` : "No Limit"}
                        </Text>
                    </Text>
                </View>
            </View>

            {/* THE BAR BACKGROUND */}
            <View className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                {/* THE FILL */}
                <View 
                    className={`h-full rounded-full ${isOver ? "bg-red-500" : "bg-golden"}`}
                    style={{ width: hasLimit ? `${displayPercent}%` : "5%" }} 
                />
            </View>

            {/* PERCENTAGE TEXT BELOW */}
            {hasLimit && (
                <Text className={`text-right text-[10px] mt-1 font-bold ${isOver ? "text-red-500" : "text-golden"}`}>
                    {percentage.toFixed(0)}% USED
                </Text>
            )}
        </View>
    );
};
export default GoalBar;
import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useUserStore } from "../../store/useUserStore";
import { spendingGoal } from "@/interfaces";

interface EditGoalProps{
    isVisible:boolean;
    onClose:()=>void;
    goals:{ dailyLimit: number, weeklyLimit: number, monthlyLimit: number }
}

export default function EditGoalsModal({isVisible, onClose, goals}:EditGoalProps) {
    const { updateGoal } = useUserStore();
    const [daily, setDaily] = useState(goals.dailyLimit?.toString());
    const [weekly, setWeekly] = useState(goals.weeklyLimit?.toString());
    const [monthly, setMonthly] = useState(goals.monthlyLimit?.toString());

    const handleSave = async () => {
        if(daily && weekly && monthly){
            const dailyLimit = parseInt(daily);
            const weeklyLimit = parseInt(weekly);
            const monthlyLimit= parseInt(monthly);
            const success = await updateGoal({dailyLimit, weeklyLimit, monthlyLimit});
            if (success) onClose();
        }
    };

    return (
        <Modal visible={isVisible} transparent animationType="slide">
            <View className="flex-1 bg-black/90 justify-center px-6">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <View className="bg-[#111] p-8 rounded-3xl border border-golden/20 shadow-2xl">
                        <Text className="text-white text-2xl font-black mb-6 text-center">Set Your Limits</Text>
                        
                        <GoalInput label="Daily (€)" value={daily} onChange={setDaily} />
                        <GoalInput label="Weekly (€)" value={weekly} onChange={setWeekly} />
                        <GoalInput label="Monthly (€)" value={monthly} onChange={setMonthly} />

                        <View className="flex-row gap-4 mt-4">
                            <TouchableOpacity onPress={onClose} className="flex-1 p-4 rounded-2xl bg-white/10">
                                <Text className="text-white text-center font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} className="flex-1 p-4 rounded-2xl bg-golden">
                                <Text className="text-black text-center font-black">SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

function GoalInput({ label, value, onChange }: any) {
    return (
        <View className="mb-4">
            <Text className="text-gray-500 text-[10px] font-bold uppercase mb-2 ml-1">{label}</Text>
            <TextInput 
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-xl font-bold"
            />
        </View>
    );
}
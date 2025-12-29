import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import ExpenseType from "../../interfaces/types/ExpenseType";
import { useExpenseStore } from "../../store/useExpenseStore";


const CATEGORIES: ExpenseType[] = ["Travel", "Food", "Drinks", "Accommodation", "Miscellaneous"];

interface AddExpenseModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function AddExpenseModal({ isVisible, onClose }: AddExpenseModalProps) {
    const { createExpense, isCreating } = useExpenseStore();

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedType, setSelectedType] = useState<ExpenseType>("Food");

    const handleSubmit = async () => {
        if (!amount || !description) return;

        const numericAmount = parseFloat(amount.replace(",", "."));
        if (isNaN(numericAmount)) return;

        const success = await createExpense({
            amount: numericAmount,
            description: description,
            type: selectedType,
            time: new Date().toISOString()
        });

        if (success) {
            setAmount("");
            setDescription("");
            setSelectedType("Food");
            onClose();
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View className="flex-1 bg-black/80 justify-end">
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
                    <View className="bg-[#1a1a1a] rounded-t-3xl p-6 border-t border-white/10">
                        
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">New Expense</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text className="text-gray-400">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 text-xs uppercase font-bold mb-2">Amount (€)</Text>
                        <TextInput
                            className="bg-black/50 text-white text-3xl font-bold p-4 rounded-xl border border-golden/30 mb-4"
                            placeholder="0.00"
                            placeholderTextColor="#555"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        <Text className="text-gray-400 text-xs uppercase font-bold mb-2">Description</Text>
                        <TextInput
                            className="bg-black/50 text-white text-base p-4 rounded-xl border border-white/10 mb-4"
                            placeholder="Lunch, Gas, Netflix..."
                            placeholderTextColor="#555"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <Text className="text-gray-400 text-xs uppercase font-bold mb-2">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setSelectedType(cat)}
                                    className={`mr-3 px-4 py-2 rounded-full border ${
                                        selectedType === cat 
                                        ? "bg-golden border-golden" 
                                        : "bg-white/5 border-white/10"
                                    }`}
                                >
                                    <Text className={`font-bold ${selectedType === cat ? "text-black" : "text-gray-400"}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isCreating}
                            className={`h-16 rounded-2xl justify-center items-center mb-4 ${
                                isCreating ? "bg-gray-700" : "bg-golden"
                            }`}
                        >
                            {isCreating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-black font-black text-xl uppercase tracking-widest">
                                    Save Expense
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
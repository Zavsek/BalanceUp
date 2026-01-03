import React, { useState, useEffect } from "react";
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useExpenseStore } from "../../store/useExpenseStore";
import { X } from "lucide-react-native";
import { ExpenseDto } from "@/interfaces";

interface AddExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialData?: ExpenseDto | null;
}

const CATEGORIES = ["Food", "Drinks", "Travel", "Accommodation", "Miscellaneous"];

export default function AddExpenseModal({ isVisible, onClose, initialData }: AddExpenseModalProps) {
  const { createExpense, updateExpense, isCreating } = useExpenseStore();
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Food");

  // Ko se modal odpre/zapre ali ko se spremeni initialData, osvežimo polja
  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setType(initialData.type);
      } else {
        setAmount("");
        setDescription("");
        setType("Food");
      }
    }
  }, [initialData, isVisible]);

  const handleSubmit = async () => {
    if (!amount || !description) return;

    const payload = {
      amount: parseFloat(amount),
      description,
      type,
      time: initialData ? initialData.time : new Date().toISOString(),
    };

    let success;
    if (initialData) {
      success = await updateExpense({ ...payload, id: initialData.id } as ExpenseDto);
    } else {
      success = await createExpense(payload as any);
    }

    if (success) onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/70">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View className="bg-[#121212] rounded-t-[40px] p-8 border-t border-white/10">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-white text-2xl font-black uppercase italic tracking-tighter">
                  {initialData ? "Edit Expense" : "New Expense"}
                </Text>
                <TouchableOpacity onPress={onClose} className="bg-white/5 p-2 rounded-full">
                  <X color="white" size={20} />
                </TouchableOpacity>
              </View>

              <View className="mb-6">
                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-2 ml-1">Amount (€)</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  placeholderTextColor="#333"
                  keyboardType="numeric"
                  className="bg-white/5 border border-white/10 text-white text-3xl font-black p-5 rounded-2xl"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-2 ml-1">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What was this for?"
                  placeholderTextColor="#444"
                  className="bg-white/5 border border-white/10 text-white p-5 rounded-2xl font-bold"
                />
              </View>

              <View className="mb-8">
                <Text className="text-gray-500 text-[10px] font-bold uppercase mb-3 ml-1">Category</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setType(cat)}
                      className={`px-4 py-2 rounded-xl border ${type === cat ? "bg-golden border-golden" : "bg-white/5 border-white/10"}`}
                    >
                      <Text className={`font-bold text-[11px] ${type === cat ? "text-black" : "text-gray-400"}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isCreating}
                className="bg-golden h-16 rounded-2xl items-center justify-center shadow-lg mb-4"
              >
                {isCreating ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black font-black uppercase tracking-widest text-lg">
                    {initialData ? "Update Transaction" : "Save Transaction"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
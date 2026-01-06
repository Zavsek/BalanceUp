import React, { useState, useEffect } from "react";
import {
  View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView
} from "react-native";
import Slider from '@react-native-community/slider';
import { useEventStore } from "../../store/useEventStore";
import { useExpenseStore } from "../../store/useExpenseStore";
import { X } from "lucide-react-native";
import { EventUser } from "@/interfaces/Event";
import ExpenseType from "@/interfaces/types/ExpenseType";
import { ExpenseDto } from "@/interfaces"; // Uvozi tip

interface AddExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  eventId?: string;
  participants?: EventUser[];
  initialData?: ExpenseDto | null; // DODANO: Podatki za edit
}

const CATEGORIES: ExpenseType[] = ["Food", "Drinks", "Travel", "Accommodation", "Miscellaneous"];

export default function AddExpenseModal({ isVisible, onClose, eventId, participants, initialData }: AddExpenseModalProps) {
  const { addEventExpense } = useEventStore();
  const { createExpense, updateExpense } = useExpenseStore(); // DODANO: updateExpense
  
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ExpenseType>("Food");
  const [isLoading, setIsLoading] = useState(false);
  const [userShares, setUserShares] = useState<{ [key: string]: number }>({});

  const isEventExpense = !!(eventId && participants && participants.length > 0);
  const totalAmount = parseFloat(amount.replace(',', '.')) || 0;

  // POSODOBLJEN useEffect: polni podatke, če gre za edit
  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        // EDIT MODE
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setType(initialData.type as ExpenseType);
        
        // Če so v bazi shranjeni shares, bi jih tukaj lahko naložil, 
        // ampak za osebne stroške jih običajno ni.
        setUserShares({}); 
      } else {
        // NEW EXPENSE MODE
        setAmount("");
        setDescription("");
        setType("Food");
        const initial: { [key: string]: number } = {};
        if (isEventExpense && participants) {
          participants.forEach(u => initial[u.id] = 0);
        }
        setUserShares(initial);
      }
    }
  }, [isVisible, isEventExpense, initialData]);

  if (!isVisible) return null;

  const handleSliderChange = (userId: string, val: number) => {
    const otherTotal = Object.entries(userShares)
      .filter(([id]) => id !== userId)
      .reduce((sum, [_, v]) => sum + v, 0);
    const maxAllowed = 100 - otherTotal;
    const finalVal = val > maxAllowed ? maxAllowed : Math.round(val);
    setUserShares(prev => ({ ...prev, [userId]: finalVal }));
  };

  const handleEuroInput = (userId: string, text: string) => {
    if (totalAmount <= 0) return;
    const euroVal = parseFloat(text.replace(',', '.')) || 0;
    let targetPercent = Math.round((euroVal / totalAmount) * 100);
    const otherTotal = Object.entries(userShares)
      .filter(([id]) => id !== userId)
      .reduce((sum, [_, v]) => sum + v, 0);
    const maxAllowed = 100 - otherTotal;
    if (targetPercent > maxAllowed) targetPercent = maxAllowed;
    setUserShares(prev => ({ ...prev, [userId]: targetPercent }));
  };

  const currentTotalPercent = Object.values(userShares).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (!amount || !description) return;
    if (isEventExpense && currentTotalPercent !== 100) return;

    setIsLoading(true);
    let success = false;

    if (isEventExpense && eventId && participants) {
      success = await addEventExpense(eventId, {
        id: initialData?.id || null, 
        amount: totalAmount,
        description,
        type,
        dateTime: new Date().toISOString(),
        shares: Object.entries(userShares).map(([id, share]) => ({
          userId: id,
          username: participants.find(p => p.id === id)?.username || "Unknown",
          shareAmount: share,
        })),
      });
    } else {
      if (initialData) {

        success = await updateExpense({
          ...initialData,
          amount: totalAmount,
          description,
          type,
        });
      } else {

        success = await createExpense({
          amount: totalAmount,
          description,
          type,
          time: new Date().toISOString(),
        });
      }
    }

    setIsLoading(false);
    if (success) onClose();
  };

  const isSubmitDisabled = isLoading || (isEventExpense ? currentTotalPercent !== 100 : (!amount || !description));

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end bg-black/80">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View className="bg-[#121212] rounded-t-[40px] p-8 border-t border-white/10 max-h-[90%]">
              
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-white text-2xl font-black uppercase italic tracking-tighter">
                  {initialData ? 'Edit Expense' : 'New Expense'}
                </Text>
                <TouchableOpacity onPress={onClose} className="bg-white/5 p-2 rounded-full"><X color="white" size={20} /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
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
                    textAlignVertical="center"
                    className="bg-white/5 border border-white/10 text-white px-5 py-4 rounded-2xl font-bold min-h-[60px]"
                  />
                </View>

                <View className="mb-8 flex-row flex-wrap gap-2">
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

                {isEventExpense && participants && (

                   <View className="mb-4 flex-row justify-between items-center px-1">
                    <Text className="text-gray-500 text-[10px] font-bold uppercase">Split Details</Text>
                    <Text className={`font-black ${currentTotalPercent === 100 ? 'text-green-500' : 'text-golden'}`}>
                      {currentTotalPercent}% / 100%
                    </Text>
                  </View>
                )}

                {/* Slider Mapping */}
                {isEventExpense && participants?.map((user) => {
                    const sharePercent = userShares[user.id] || 0;
                    const shareEuro = ((totalAmount * sharePercent) / 100).toFixed(2);
                    return (
                        <View key={user.id} className="mb-6 bg-white/5 p-5 rounded-3xl border border-white/5">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-white font-bold">{user.username}</Text>
                                <View className="flex-row gap-2">
                                    <View className="bg-black/40 px-3 py-1 rounded-xl border border-white/10 flex-row items-center">
                                        <TextInput
                                            keyboardType="numeric"
                                            placeholder="0.00"
                                            placeholderTextColor="#333"
                                            value={sharePercent > 0 ? shareEuro : ""}
                                            onChangeText={(t) => handleEuroInput(user.id, t)}
                                            className="text-golden font-black text-right min-w-[50px]"
                                        />
                                        <Text className="text-golden font-bold ml-1 text-[10px]">€</Text>
                                    </View>
                                    <View className="bg-white/5 px-3 py-1 rounded-xl border border-white/5 flex-row items-center">
                                        <Text className="text-white font-black">{sharePercent}%</Text>
                                    </View>
                                </View>
                            </View>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={sharePercent}
                                onValueChange={(v) => handleSliderChange(user.id, v)}
                                minimumTrackTintColor="#FFD700"
                                maximumTrackTintColor="#1A1A1A"
                                thumbTintColor="#FFD700"
                            />
                        </View>
                    );
                })}

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={`h-16 rounded-2xl items-center justify-center shadow-lg mb-10 ${!isSubmitDisabled ? 'bg-golden' : 'bg-white/5 opacity-20'}`}
                >
                  {isLoading ? <ActivityIndicator color="black" /> : (
                    <Text className="text-black font-black uppercase tracking-widest text-lg">
                        {initialData ? 'Update Expense' : 'Add Expense'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
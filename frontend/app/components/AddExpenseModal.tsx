import React, { useState, useEffect } from "react";
import {
  View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import Slider from '@react-native-community/slider';
import { useEventStore } from "../../store/useEventStore";
import { useExpenseStore } from "../../store/useExpenseStore";
import { X } from "lucide-react-native";
import { EventUser } from "@/interfaces/Event";
import ExpenseType from "@/interfaces/types/ExpenseType";
import { ExpenseDto } from "@/interfaces";

interface AddExpenseModalProps {
  isVisible: boolean;
  onClose: () => void;
  eventId?: string;
  participants?: EventUser[];
  initialData?: ExpenseDto | null;
}

const CATEGORIES: ExpenseType[] = ["Food", "Drinks", "Travel", "Accommodation", "Miscellaneous"];

export default function AddExpenseModal({ isVisible, onClose, eventId, participants, initialData }: AddExpenseModalProps) {
  const { addEventExpense } = useEventStore();
  const { createExpense, updateExpense } = useExpenseStore();
  
  const [editingValue, setEditingValue] = useState<{ [key: string]: string }>({});
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ExpenseType>("Food");
  const [isLoading, setIsLoading] = useState(false);
  const [userShares, setUserShares] = useState<{ [key: string]: number }>({});

  const isEventExpense = !!(eventId && participants && participants.length > 0);
  const totalAmount = parseFloat(amount.replace(',', '.')) || 0;

  useEffect(() => {
    if (isVisible) {
      if (initialData) {
        setAmount(initialData.amount.toString());
        setDescription(initialData.description);
        setType(initialData.type as ExpenseType);
        
        // Če urejamo, moramo pobrati obstoječe deleže, če so na voljo
        const initial: { [key: string]: number } = {};
        // Tukaj ne uporabljamo .shares, ker si rekel, da ga ni v DTO, 
        // zato pustimo prazno ali implementiramo tvojo logiko za pridobivanje share-ov
        setUserShares({}); 
      } else {
        setAmount("");
        setDescription("");
        setType("Food");
        const initial: { [key: string]: number } = {};
        if (isEventExpense && participants) {
          participants.forEach(u => initial[u.id] = 0);
        }
        setUserShares(initial);
      }
      setEditingValue({});
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
    setEditingValue(prev => ({ ...prev, [userId]: text }));
  };

  const syncEuroToPercent = (userId: string) => {
    const text = editingValue[userId];
    if (text === undefined || totalAmount <= 0) {
      setEditingValue(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      return;
    }

    const euroVal = parseFloat(text.replace(',', '.')) || 0;
    let targetPercent = Math.round((euroVal / totalAmount) * 100);
    
    const otherTotal = Object.entries(userShares)
      .filter(([id]) => id !== userId)
      .reduce((sum, [_, v]) => sum + v, 0);
    
    const maxAllowed = 100 - otherTotal;
    if (targetPercent > maxAllowed) targetPercent = maxAllowed;
    if (targetPercent < 0) targetPercent = 0;

    setUserShares(prev => ({ ...prev, [userId]: targetPercent }));
    setEditingValue(prev => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  };

  const currentTotalPercent = Object.values(userShares).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (!amount || !description) return;
    if (isEventExpense && currentTotalPercent !== 100) return;

    setIsLoading(true);
    let success = false;


    if (initialData) {
      if (isEventExpense && eventId) {
        success = await addEventExpense(eventId, {
          id: initialData.id,
          amount: totalAmount,
          description,
          type,
          dateTime: initialData.time || new Date().toISOString(),
          shares: Object.entries(userShares).map(([id, share]) => ({
            userId: id,
            username: participants?.find(p => p.id === id)?.username || "Unknown",
            shareAmount: share,
          })),
        });
      } else {
        success = await updateExpense({
          ...initialData,
          amount: totalAmount,
          description,
          type,
        });
      }
    } 

    else {
      if (isEventExpense && eventId && participants) {
        success = await addEventExpense(eventId, {
          id: null, 
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
      <View className="flex-1 justify-end bg-black/80">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="bg-[#121212] rounded-t-[40px] pt-8 border-t border-white/10 max-h-[92%]">
            
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6 px-8">
              <Text className="text-white text-2xl font-black uppercase italic tracking-tighter">
                {initialData ? 'Edit Expense' : 'New Expense'}
              </Text>
              <TouchableOpacity onPress={onClose} className="bg-white/5 p-2 rounded-full">
                <X color="white" size={20} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 32 }}
            >
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

              {isEventExpense && participants?.map((user) => {
                  const sharePercent = userShares[user.id] || 0;
                  const shareEuro = ((totalAmount * sharePercent) / 100).toFixed(2);
                  const displayValue = editingValue[user.id] !== undefined ? editingValue[user.id] : (sharePercent > 0 ? shareEuro : "");

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
                                          value={displayValue}
                                          onChangeText={(t) => handleEuroInput(user.id, t)}
                                          onBlur={() => syncEuroToPercent(user.id)}
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
            </ScrollView>

            {/* Footer Button */}
            <View className="pt-4 px-8 pb-10">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                className={`h-16 rounded-2xl items-center justify-center shadow-lg ${!isSubmitDisabled ? 'bg-golden' : 'bg-white/5 opacity-20'}`}
              >
                {isLoading ? <ActivityIndicator color="black" /> : (
                  <Text className="text-black font-black uppercase tracking-widest text-lg">
                      {initialData ? 'Update Expense' : 'Add Expense'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
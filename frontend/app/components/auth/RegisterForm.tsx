import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/useAuthStore";
import { Gender } from "@/interfaces/Dtos/registerRequest";

const RegisterForm = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<Gender>("Male");
  
  const { registerAsync, checkingAuth } = useAuthStore();

  return (
    <View className="w-[92%] p-7 bg-black/60 rounded-[30px] border-[1px] border-golden/30">
      <View className="items-center mb-6">
        <Text className="text-3xl font-black text-golden uppercase italic">Register</Text>

      </View>

      <View className="gap-y-3">
        <TextInput
          className="w-full p-4 h-14 border-[1px] border-golden/40 rounded-xl text-white bg-mostlyBlack/40"
          placeholder="Username" placeholderTextColor="#666"
          value={username} onChangeText={setUsername}
        />

        <TextInput
          className="w-full p-4 h-14 border-[1px] border-golden/40 rounded-xl text-white bg-mostlyBlack/40"
          placeholder="Email" placeholderTextColor="#666"
          value={email} onChangeText={setEmail} keyboardType="email-address"
        />

        <View className="flex-row gap-x-2">
          <TextInput
            className="flex-1 p-4 h-14 border-[1px] border-golden/40 rounded-xl text-white bg-mostlyBlack/40"
            placeholder="Pass" placeholderTextColor="#666"
            value={password} onChangeText={setPassword} secureTextEntry
          />
          <TextInput
            className="flex-1 p-4 h-14 border-[1px] border-golden/40 rounded-xl text-white bg-mostlyBlack/40"
            placeholder="Confirm" placeholderTextColor="#666"
            value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry
          />
        </View>

        {/* Gender Selection */}
        <View className="mt-2">
          <Text className="text-golden font-bold mb-2 ml-1 text-xs uppercase tracking-widest">Identity</Text>
          <View className="flex-row justify-between gap-2">
            {["Male", "Female", "Other"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setGender(item as Gender)}
                className={`flex-1 p-3 rounded-xl border-[1px] items-center ${
                  gender === item ? "border-golden bg-golden/20" : "border-white/10 bg-mostlyBlack/20"
                }`}
              >
                <Text className={`font-bold text-xs ${gender === item ? "text-golden" : "text-gray-500"}`}>
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          className="w-full h-16 rounded-2xl bg-golden flex-row justify-center items-center mt-6 shadow-lg shadow-golden/40"
          onPress={() => registerAsync({email, password, username, gender})}
          disabled={checkingAuth}
        >
          {checkingAuth ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-black text-xl font-black uppercase tracking-widest">Create Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center items-center mt-6">
        <Text className="text-gray-400 text-sm">Member already? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text className="text-golden font-black">LOGIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterForm;
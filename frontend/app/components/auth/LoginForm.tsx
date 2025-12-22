import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox"; 
import { useAuthStore } from "../../../store/useAuthStore"; 
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberLogin, setRememberLogin] = useState<boolean>(false);
  const { loginAsync, checkingAuth } = useAuthStore();

  return (
    <View className="w-[92%] p-8 bg-black/60 rounded-[30px] border-[1px] border-golden/30 shadow-2xl">
      {/* Header Section */}
      <View className="items-center mb-10">
        <Text className="text-4xl font-black text-golden tracking-tighter mb-1">
          BALANCE UP
        </Text>
        <View className="h-[2px] w-20 bg-golden mb-4" />
        <Text className="text-gray-400 text-base font-medium">
          Welcome back!
        </Text>
      </View>
      
      {/* Inputs */}
      <View className="space-y-4 mb-6">
        <TextInput
          className="w-full p-4 h-16 border-[1px] border-golden/50 rounded-2xl text-white text-lg bg-mostlyBlack/40"
          placeholder="Email Address"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          className="w-full p-4 h-16 border-[1px] border-golden/50 rounded-2xl text-lg text-white bg-mostlyBlack/40"
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Row: Remember Me & Forgot Pass */}
      <View className="flex-row justify-between items-center mb-8 px-1">
        <View className="flex-row items-center">
          <Checkbox
            value={rememberLogin}
            onValueChange={setRememberLogin}
            color={rememberLogin ? "#FFC107" : "#444"}
          />
          <Text className="ml-2 text-gray-300">Remember me</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-golden font-semibold">Forgot?</Text>
        </TouchableOpacity>
      </View>

      {/* Submit */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="w-full h-16 rounded-2xl bg-golden flex-row justify-center items-center shadow-lg shadow-golden/50"
        onPress={() => loginAsync(email, password, rememberLogin)}
        disabled={checkingAuth}
      >
        {checkingAuth ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black text-xl font-bold uppercase tracking-widest">Login</Text>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View className="flex-row justify-center items-center mt-8">
        <Text className="text-gray-400">New here? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text className="text-golden font-extrabold text-lg">Sign Up</Text> 
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginForm;
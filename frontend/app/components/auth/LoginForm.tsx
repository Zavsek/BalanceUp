import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import Checkbox from "expo-checkbox"; 
import { useAuthStore } from "../../../store/useAuthStore"; 
import { useRouter } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native"; 

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false); 
  const [rememberLogin, setRememberLogin] = useState<boolean>(false);
  const { loginAsync, checkingAuth } = useAuthStore();

  return (
    <View className="w-[92%] p-8 bg-black/60 rounded-[40px] border border-white/10 shadow-2xl">
      <View className="items-center mb-10">
        <Text className="text-4xl font-black text-golden tracking-tighter italic">
          BALANCE UP
        </Text>
        <View className="h-1 w-12 bg-golden rounded-full mt-2" />
      </View>
      
      <View className="gap-y-4 mb-6">
        {/* Email Input */}
        <TextInput
          className="w-full p-4 h-16 border border-white/10 rounded-2xl text-white text-lg bg-white/5"
          placeholder="Email Address"
          placeholderTextColor="#444"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Input z gumbom */}
        <View className="relative justify-center">
          <TextInput
            className="w-full p-4 h-16 border border-white/10 rounded-2xl text-lg text-white bg-white/5 pr-14"
            placeholder="Password"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            className="absolute right-4 p-2"
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#FFD700" />
            ) : (
              <Eye size={20} color="#444" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-8 px-1">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => setRememberLogin(!rememberLogin)}
        >
          <Checkbox
            value={rememberLogin}
            onValueChange={setRememberLogin}
            color={rememberLogin ? "#FFD700" : "#333"}
            className="rounded-md"
          />
          <Text className="ml-2 text-gray-400 font-bold text-xs uppercase">Remember me</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text className="text-golden font-bold text-xs uppercase">Forgot?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        className="w-full h-16 rounded-2xl bg-golden flex-row justify-center items-center"
        onPress={() => loginAsync(email, password, rememberLogin)}
        disabled={checkingAuth}
      >
        {checkingAuth ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text className="text-black text-xl font-black uppercase tracking-widest italic">Login</Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center items-center mt-8">
        <Text className="text-gray-500 font-bold uppercase text-[10px]">New here? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text className="text-golden font-black uppercase text-[10px] ml-1">Create Account</Text> 
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginForm;
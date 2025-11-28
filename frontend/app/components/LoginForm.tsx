import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Checkbox from "expo-checkbox"; 
import { useAuthStore } from "../../store/useAuthStore"; 
import Toast from "react-native-toast-message";

const LoginForm = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberLogin, setRememberLogin] = useState<boolean>(false);
  const { loginAsync, checkingAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      // Basic validation
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter email and password.",
      });
      return;
    }
    await loginAsync(email, password, rememberLogin);
  };

  return (
    <View className=" min-w-[90%] min-h-[60%] p-6 bg-black/30 rounded-2xl shadow-2xl border-4 border-golden">
        {/* Form Title and Subtitle */}
      <View className=" flex flex-rows-1 items-center mb-3 gap-2">
        <Text className="text-2xl font-bold mb-2 text-center text-golden relative shadow-lg border-2 border-white/20 bg-mostlyBlack/60 pl-2 pb-2 pt-2 pr-1 rounded-lg">
          Balance UP!
        </Text>
        <Text className="text-xl font-semibold text-golden text-center mb-10 border-2 shadow-xl border-white/20  bg-mostlyBlack/60 pl-2 pb-2 pt-2 pr-1 rounded-lg">
          Welcome Back, Please Login
        </Text>
      </View>
      
        {/* email */}
      <TextInput
        className=" min-w-[90%] p-3 mb-8 min-h-16 border-2  border-golden rounded-md text-white text-xl bg-mostlyBlack/50"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />


        {/* password */}
      <TextInput
        className="min-w-[90%] p-3 mb-4 min-h-16 border-2 border-golden rounded-md text-xl text-white bg-mostlyBlack/50 "
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />


        {/* checkbox */}
      <View className="flex-row items-center pl-4 mb-14">
        <Checkbox
          value={rememberLogin}
          onValueChange={setRememberLogin}
          color={rememberLogin ? "#FFC107" : undefined}
        />
        <Text className="ml-2 text-golden">Remember me</Text>
      </View>

        {/* submit */}
      <TouchableOpacity
        className="min-w-[90%] p-4 pl-40 pr-40 rounded-md mb-5  bg-golden"
        onPress={handleLogin}
        disabled={checkingAuth}
      >
        {checkingAuth ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">Login</Text>
        )}
      </TouchableOpacity>

      
      <TouchableOpacity className="mt-4">
        <Text className="text-golden text-center font-bold">Forgot Password?</Text>
      </TouchableOpacity>

        <Text className="text-white text-center mt-4">
          Don't have an account
      <TouchableOpacity >
            <Text className="text-golden font-bold "> Sign Up</Text>    
      </TouchableOpacity>
        </Text>
    </View>
  );
};

export default LoginForm;

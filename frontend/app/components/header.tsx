import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { User, Bell } from 'lucide-react-native'

const AppHeader = () => {
  return (
    <View className="pt-14 pb-4 bg-black px-6 border-b border-white/5 flex-row justify-between items-center">
      <View>
        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[3px]">
          Balance
        </Text>
        <Text className="text-golden text-2xl font-black italic tracking-tighter">
          UP
        </Text>
      </View>

      <View className="flex-row gap-x-4">
        <TouchableOpacity className="bg-white/5 p-2 rounded-full border border-white/10">
          <Bell size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="bg-golden p-2 rounded-full shadow-lg shadow-golden/20">
          <User size={20} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default AppHeader
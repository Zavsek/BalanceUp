import { View, Text, Image } from 'react-native'
import React from 'react'
import ICONS from '@/constants/icons'

const AppHeader = () => {
  return (
    <View className="pt-16 pb-5 bg-black/90 border-b border-golden/30 w-full flex-row justify-center items-center shadow-lg shadow-golden/10">  
      <Text className="text-golden text-4xl font-customFont tracking-widest shadow-black shadow-md">
        BALANCE UP
      </Text>
    </View>
  )
}

export default AppHeader
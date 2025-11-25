import { View, Text, Image } from 'react-native'
import React from 'react'
import ICONS from '@/constants/icons'

const AppHeader = () => {
  return (
    <View className="h-18 border-b-2 bg-white/10 pt-20 flex flex-1 flex-row items-center  border-brightGolden/60 w-screen" >
          <Text className="text-golden  text-5xl font-bold font-customFont">BALANCE UP</Text>
    </View>
  )
}

export default AppHeader
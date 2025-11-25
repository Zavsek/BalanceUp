import { View, Text, ScrollView } from 'react-native'
import AppHeader from '../components/header'
import React from 'react'

const goals = () => {
  return (
    <View className="flex-1  items-center bg-black justify-start">
      <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
        <AppHeader />
      </ScrollView>
    </View>
  )
}

export default goals
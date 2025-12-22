import { Text, View, StatusBar,  } from 'react-native'
import React, { Component } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AuthBackground from '../components/auth/AuthBackground'
import LoginForm from '../components/auth/LoginForm'

const login = () => {
  {
    return (
      <View className='flex-1 w-screen h-screen justify-center items-center '>
        <AuthBackground/>
        <LoginForm/>
      </View>
    )
  }
}

export default login
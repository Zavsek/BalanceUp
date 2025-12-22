import { Text, View, StatusBar,  } from 'react-native'
import React, { Component } from 'react'
import RegisterForm from '../components/auth/RegisterForm'
import AuthBackground from '../components/auth/AuthBackground'

const register = () => {
   {
    return (
       <View className='flex-1 w-screen h-screen justify-center items-center'>
        <AuthBackground/>
        <RegisterForm/>
      </View>
    )
  }
}

export default register
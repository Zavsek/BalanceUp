import { Text, View } from 'react-native'
import React, { Component } from 'react'
import { Tabs } from 'expo-router'

export class _layout extends Component {
  render() {
    return (
     <Tabs
      screenOptions={{
      tabBarShowLabel:false,
      tabBarStyle:{
      display: 'none'
      },
      headerShown:false
      }}
      >



    <Tabs.Screen
        name="login"/>

    <Tabs.Screen
        name="register"/>
    </Tabs>
    
    )
  }
}

export default _layout
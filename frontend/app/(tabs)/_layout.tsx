import { View, Text } from 'react-native'
import React from 'react'
import { TabActions } from '@react-navigation/native';
import {Tabs} from "expo-router"
import { ICONS } from '../../constants/icons';
import TabIcon from '../components/Tabicon';


const _layout = () => {
  return (
    <Tabs
    screenOptions={{
        tabBarShowLabel:false,
        tabBarItemStyle:{
            width:'100%',
            height:'100%',
            justifyContent:'center',
            alignItems:'center'
        },
        tabBarStyle:{
            backgroundColor:'rgba(108,81,0,0.8)',
            
            borderRadius:50,
            marginBottom:50,
            paddingHorizontal:15,
            marginHorizontal:10,
            height:56,
            position:'absolute',
            overflow:'hidden',
            borderWidth:1,
            borderColor:'#FFDE08',
        }
    }}  
    >

        {/*index.tsx*/}
        <Tabs.Screen
        name="index"
        options={{
            headerShown:false,
            title: "Home",
            tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} label="Home" image={ICONS.chart} />
        }}
        />
        {/* events.tsx */}
        <Tabs.Screen
        name="events"
        options={{
            headerShown:false,
            title: "Events",
            tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} label="Events" image={ICONS.calendarDay} />
        }}
        />
        {/* goals.tsx */}
        <Tabs.Screen
        name="goals"
        options={{
            headerShown:false,
            title: "Goals",
            tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} label="Goals" image={ICONS.flag} />
        }}
        />
        {/* social.tsx */}
        <Tabs.Screen
        name="social"
        options={{
            headerShown:false,
            title: "Social",
            tabBarIcon: ({ focused }) =>
            <TabIcon focused={focused} label="Social" image={ICONS.users} />
        }}
        />
    </Tabs>
  )
}

export default _layout;
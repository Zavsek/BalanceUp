import { View, Text, Image } from "react-native";
import React from "react";

const TabIcon = ({ focused, label, image }: any) => {
  if (focused) {
    return (
      <View className="flex-1 items-center mt-4 justify-center">
        <View className="bg-golden flex flex-row w-full min-w-[122px] min-h-[58px]  justify-center items-center rounded-full">
          <Image source={image} className="w-6 h-6 mr-2" resizeMode="contain" />
          <Text className="text-black font-semibold">{label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center  justify-center ">
      <View className=" flex flex-row w-full  mb-1  m-auto mt-3 justify-center items-center "></View>
      <Image
        source={image}
        className="w-6 h-6 opacity-60"
        resizeMode="contain"
      />
    </View>
  );
};
export default TabIcon;

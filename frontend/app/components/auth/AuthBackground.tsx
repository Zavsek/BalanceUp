import React, { useState, useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient"; 

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");


const numColumns = 5;
const numRows = 10;

const colors = ["#FFD700", "#D4AF37", "#996515", "#222", "#111"];

interface Cell {
  id: number;
  baseColor: string;
  opacity: Animated.Value;
  scale: Animated.Value; 
  active: boolean;
}

const AuthBackground = () => {
  const createGrid = (): Cell[] => {
    return Array.from({ length: numColumns * numRows }, (_, i) => ({
      id: i,
      baseColor: colors[Math.floor(Math.random() * colors.length)],
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3), 
      active: false,
    }));
  };

  const [cells, setCells] = useState<Cell[]>(createGrid());
  const cellsRef = useRef<Cell[]>(cells);

  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);

  const animateCell = (cell: Cell) => {

    Animated.sequence([
      Animated.parallel([
        Animated.timing(cell.opacity, {
          toValue: 0.5, 
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(cell.scale, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(cell.opacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(cell.scale, {
          toValue: 0.5,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setCells((prev) =>
        prev.map((c) => (c.id === cell.id ? { ...c, active: false } : c))
      );
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const activeNow = cellsRef.current.filter((k) => k.active).length;
      if (activeNow >= 8) return; 

      const inactiveCells = cellsRef.current.filter((k) => !k.active);
      if (inactiveCells.length === 0) return;

      const numToAnimate = Math.min(
        Math.floor(Math.random() * 2) + 1,
        10 - activeNow,
        inactiveCells.length
      );

      const chosen = [...inactiveCells]
        .sort(() => Math.random() - 0.5)
        .slice(0, numToAnimate);

      chosen.forEach((chosenCell) => {
        animateCell(chosenCell);
      });

      setCells((prev) =>
        prev.map((k) =>
          chosen.some((c) => c.id === k.id) ? { ...k, active: true } : k
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000" }}>
      
      {/* Mreža celic */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: 'center' }}>
        {cells.map((cell) => (
          <Animated.View
            key={cell.id}
            style={{
              width: SCREEN_WIDTH / numColumns,
              height: SCREEN_HEIGHT / numRows,
              backgroundColor: cell.baseColor,
              opacity: cell.opacity,
              borderRadius: 100, 
              transform: [{ scale: cell.scale }],
  
              shadowColor: cell.baseColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 15,
            }}
          />
        ))}
      </View>


      <LinearGradient

        colors={["transparent", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.9)", "#000"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "100%",
        }}
      />
    </View>
  );
};

export default AuthBackground;
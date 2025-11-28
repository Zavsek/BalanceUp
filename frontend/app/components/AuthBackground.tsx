import { View, Animated, Dimensions } from "react-native";
import React, { useState, useEffect, useRef } from "react";

const numColumns = 3;
const numRows = 6;
const colors = ["#0072ED", "#D80E0E", "#4CAF50", "#E31DD5"];

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const cellHeight = SCREEN_HEIGHT / numRows;
 
interface Cell {
  id: number;
  baseColor: string;
  opacity: Animated.Value;
  active: boolean;
}

const AuthBackground = () => {
  const createGrid = (): Cell[] => {
    return Array.from({ length: numColumns * numRows }, (_, i) => ({
      id: i,
      baseColor: colors[Math.floor(Math.random() * colors.length)],
      opacity: new Animated.Value(0), 
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
      Animated.timing(cell.opacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(cell.opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCells(prev => prev.map(c => c.id === cell.id ? { ...c, active: false } : c));
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const activeNow = cellsRef.current.filter(k => k.active).length;
      if (activeNow >= 4) return; 

      const inactiveCells = cellsRef.current.filter(k => !k.active);
      if (inactiveCells.length === 0) return;

      const numToAnimate = Math.min(
        Math.floor(Math.random() * 3) + 2, 
        6 - activeNow, 
        inactiveCells.length
      );

      const chosen = [...inactiveCells]
        .sort(() => Math.random() - 0.5)
        .slice(0, numToAnimate);

      chosen.forEach(chosenCell => {
        animateCell(chosenCell);
      });

      setCells(prev =>
        prev.map(k => 
          chosen.some(c => c.id === k.id) ? { ...k, active: true } : k
        )
      );
    }, 600); 

    return () => {
      clearInterval(interval);
    };
  }, []); 

  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#111', 
      }}
    >
      {cells.map((cell) => (
        <Animated.View
          key={cell.id}
          style={{
            width: (SCREEN_WIDTH / numColumns) - 2, 
            height: cellHeight - 2,
            borderWidth: 1,
            borderColor: '#191919', 
            backgroundColor: cell.baseColor,
            borderRadius: 4,
            opacity: cell.opacity,
          }}
        />
      ))}
    </View>
  );
};

export default AuthBackground;
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { useUserStore } from "../../store/useUserStore";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import dayjs from "dayjs";

interface SpendingsCalendarModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SpendingsCalendarModal({
  isVisible,
  onClose,
}: SpendingsCalendarModalProps) {
  const { currentCalendar, getSpendingsCalendar } = useUserStore();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadData(currentMonth.year(), currentMonth.month() + 1);
    }
  }, [isVisible, currentMonth]);

  const loadData = async (year: number, month: number) => {
    setLoading(true);
    await getSpendingsCalendar(year, month);
    setLoading(false);
  };

  const handleMonthChange = (date: DateData) => {
    const newDate = dayjs(date.dateString);
    setCurrentMonth(newDate);

    loadData(newDate.year(), newDate.month() + 1);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View className="flex-1 bg-black/90 justify-center px-4">
        <View className="bg-[#121212] border border-white/10 rounded-3xl overflow-hidden pb-6">
          <View className="flex-row justify-between items-center p-4 border-b border-white/5 bg-white/5">
            <Text className="text-white font-black text-lg uppercase italic tracking-wider">
              Spending History
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-white/10 p-2 rounded-full"
            >
              <X color="white" size={20} />
            </TouchableOpacity>
          </View>

          <View className="p-2">
            {loading && (
              <View className="absolute z-10 w-full h-full bg-black/50 justify-center items-center">
                <ActivityIndicator color="#FFD700" />
              </View>
            )}

            <Calendar
              current={currentMonth.format("YYYY-MM-DD")}
              onMonthChange={handleMonthChange}
              theme={{
                backgroundColor: "transparent",
                calendarBackground: "transparent",
                textSectionTitleColor: "#666",
                selectedDayBackgroundColor: "#FFD700",
                selectedDayTextColor: "#000",
                todayTextColor: "#FFD700",
                dayTextColor: "#FFF",
                textDisabledColor: "#333",
                monthTextColor: "#FFF",
                textMonthFontWeight: "900",
                textDayHeaderFontWeight: "bold",
                textDayFontWeight: "bold",
                arrowColor: "#FFD700",
              }}
              dayComponent={({ date, state }: any) => {
                if (!date) return null;

                const dateStr = date.dateString;
                const spentAmount =
                  currentCalendar?.dailyTotals?.[dateStr] || 0;
                const isToday = dateStr === dayjs().format("YYYY-MM-DD");
                const isDisabled = state === "disabled";

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className="items-center justify-center h-12 w-full"
                  >
                    <Text
                      className={`text-xs font-bold mb-0.5 ${
                        isToday
                          ? "text-golden"
                          : isDisabled
                            ? "text-gray-700"
                            : "text-white"
                      }`}
                    >
                      {date.day}
                    </Text>

                    {spentAmount > 0 ? (
                      <View className="bg-golden/20 px-1.5 py-0.5 rounded-md border border-golden/30">
                        <Text className="text-[8px] font-black text-golden">
                          €{Math.round(spentAmount)}
                        </Text>
                      </View>
                    ) : (
                      <View className="h-[14px]" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>

          <View className="mx-4 mt-4 bg-golden/10 p-4 rounded-xl border border-golden/20 flex-row justify-between items-center">
            <Text className="text-gray-400 text-xs font-bold uppercase">
              Total for {currentMonth.format("MMMM")}
            </Text>
            <Text className="text-golden text-xl font-black">
              €{currentCalendar?.totalMonthly?.toFixed(2) || "0.00"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

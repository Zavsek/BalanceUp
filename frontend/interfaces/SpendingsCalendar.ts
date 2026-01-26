interface SpendingsCalendar{
    totalMonthly: number,
    dailyTotals: {[date:string]: number };
}
export default SpendingsCalendar;
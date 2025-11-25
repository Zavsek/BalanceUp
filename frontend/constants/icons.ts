
import calendarDay from '../assets/icons/calendar-day.png';
import chart from '../assets/icons/chart-mixed-up-circle-dollar.png';
import flag from '../assets/icons/flag.png';
import users from '../assets/icons/users.png';

export const ICONS = {
	calendarDay,
	chart,
    flag,
	users,
} as const;

export type IconKey = keyof typeof ICONS;

export default ICONS;

export { calendarDay, chart, flag,  users };


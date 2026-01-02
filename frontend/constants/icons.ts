
import calendarDay from '../assets/icons/calendar-day.png';
import chart from '../assets/icons/chart-mixed-up-circle-dollar.png';
import flag from '../assets/icons/flag.png';
import users from '../assets/icons/users.png';
import linechart from '../assets/icons/line-chart.png';
import defaultUserIcon from '../assets/icons/job-search-symbol-of-a-man-with-dollar-coin.png';

export const ICONS = {
	calendarDay,
	chart,
    flag,
	users,
	linechart,
	defaultUserIcon
} as const;

export type IconKey = keyof typeof ICONS;

export default ICONS;

export { calendarDay, chart, flag, linechart,  users, defaultUserIcon };


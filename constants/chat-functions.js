import { format, isToday, isYesterday } from "date-fns";

export function extractTime(dateString) {
  const date = new Date(dateString);
  const hours = padZero(date.getHours());
  const minutes = padZero(date.getMinutes());
  return `${hours}:${minutes}`;
}

// Helper function to pad single-digit numbers with a leading zero
function padZero(number) {
  return number.toString().padStart(2, "0");
}

export const groupMessagesByDate = (messages) => {
  const groups = {};

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);

    let groupLabel;
    if (isToday(date)) {
      groupLabel = "Today";
    } else if (isYesterday(date)) {
      groupLabel = "Yesterday";
    } else {
      groupLabel = format(date, "MMMM d, yyyy");
    }

    if (!groups[groupLabel]) {
      groups[groupLabel] = [];
    }

    groups[groupLabel].push(msg);
  });

  return groups;
};

const now = new Date();
const nextMonth = new Date();
nextMonth.setMonth(now.getMonth() + 1);

const formatDate = (date) => date.toISOString().split("T")[0];

export const minDate = formatDate(now);
export const maxDate = formatDate(nextMonth);

const hours = String(now.getHours()).padStart(2, "0"); // Format hours as HH
const minutes = String(now.getMinutes()).padStart(2, "0"); // Format minutes as MM

// Combine into "HH:MM" format
export const currentTime = `${hours}:${minutes}`;

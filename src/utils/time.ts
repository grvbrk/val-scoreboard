export const createDatetime = (
  dateString: string, // expected in `yyyy-mm-dd` format
  timeString: string,
  timezoneName: string
): string => {
  const date = new Date(`${dateString}T${timeString}`);
  const sameDateInCorrectTimezone = new Date(
    date.toLocaleString('en-US', { timeZone: timezoneName })
  );
  const timeDiff = date.getTime() - sameDateInCorrectTimezone.getTime();
  const timezonedDate = new Date(date.getTime() + timeDiff);
  return timezonedDate.toISOString();
};

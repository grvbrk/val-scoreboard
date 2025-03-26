export function totalRoundTime(timeArray: string[]) {
  let totalSeconds = 0;

  for (const time of timeArray) {
    const parts = time.split(':');

    if (parts.length === 3) {
      // HH:MM:SS format
      totalSeconds += parseInt(parts[0]) * 3600; // Hours to seconds
      totalSeconds += parseInt(parts[1]) * 60; // Minutes to seconds
      totalSeconds += parseInt(parts[2]); // Seconds
    } else if (parts.length === 2) {
      // MM:SS format
      totalSeconds += parseInt(parts[0]) * 60; // Minutes to seconds
      totalSeconds += parseInt(parts[1]); // Seconds
    }
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format the result
  if (hours > 0) {
    // HH:MM:SS format
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    // MM:SS format
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

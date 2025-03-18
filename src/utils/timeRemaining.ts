import { DateTime } from 'luxon';

export function getTimeRemaining(
  apiDateStr: string,
  userTimezone: string
): { timeLeft: string; hasTimeLeft: boolean } {
  const targetTime = DateTime.fromFormat('2025-03-17 17:31:00', 'yyyy-MM-dd HH:mm:ss', {
    zone: 'UTC',
  }).setZone(userTimezone, { keepLocalTime: false });

  const now = DateTime.now().setZone(userTimezone);
  const diff = targetTime.diff(now, ['days', 'hours', 'minutes']).toObject();

  const hasTimeLeft = (diff.days ?? 0) > 0 || (diff.hours ?? 0) > 0 || (diff.minutes ?? 0) > 0;

  if (!hasTimeLeft) {
    return { timeLeft: 'Expired', hasTimeLeft: false };
  }

  const parts = [];
  if (diff.days) parts.push(`${diff.days}d`);
  if (diff.hours) parts.push(`${diff.hours}h`);
  if (diff.minutes) parts.push(`${Math.floor(diff.minutes)}m`);

  return { timeLeft: parts.join(' '), hasTimeLeft: true };
}

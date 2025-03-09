import { DateTime } from 'luxon';

export function getTimeRemaining(apiDateStr: string, userTimezone: string): string {
  const targetTime = DateTime.fromFormat(apiDateStr, 'yyyy-MM-dd HH:mm:ss', {
    zone: 'UTC',
  }).setZone(userTimezone, { keepLocalTime: false });

  const now = DateTime.now().setZone(userTimezone);

  const diff = targetTime.diff(now, ['days', 'hours', 'minutes']).toObject();

  if ((diff.days ?? 0) <= 0 && (diff.hours ?? 0) <= 0 && (diff.minutes ?? 0) <= 0) {
    return 'Expired';
  }

  return `${diff.days ?? 0}d ${diff.hours ?? 0}h ${Math.floor(diff.minutes ?? 0)}m remaining`;
}

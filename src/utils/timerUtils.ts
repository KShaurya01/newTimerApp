export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
};

export const convertDurationToSeconds = (
  hours: number,
  minutes: number,
  seconds: number,
): number => {
  return hours * 3600 + minutes * 60 + seconds;
};

export const convertSecondsToDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds };
};

export const calculateProgress = (
  remainingTime: number,
  originalDuration: number,
): number => {
  if (originalDuration === 0) return 100;
  const progress =
    ((originalDuration - remainingTime) / originalDuration) * 100;
  return Math.max(0, Math.min(100, progress));
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const isHalfwayPoint = (
  remainingTime: number,
  originalDuration: number,
): boolean => {
  if (originalDuration === 0) return false;
  const progress = calculateProgress(remainingTime, originalDuration);
  return progress >= 50 && progress < 52; // Small range to avoid multiple triggers
};

export const getTimerStatusColor = (status: string): string => {
  switch (status) {
    case 'running':
      return '#34C759'; // Green
    case 'paused':
      return '#FF9500'; // Orange
    case 'completed':
      return '#007AFF'; // Blue
    default:
      return '#666666'; // Gray
  }
};

export const validateTimerData = (
  name: string,
  duration: number,
): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Timer name is required' };
  }

  if (duration <= 0) {
    return { isValid: false, error: 'Duration must be greater than 0' };
  }

  if (duration > 86400) {
    // 24 hours in seconds
    return { isValid: false, error: 'Duration cannot exceed 24 hours' };
  }

  return { isValid: true };
};

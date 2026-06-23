export function isPredictionLocked(utcDate: string): boolean {
  return Date.now() >= new Date(utcDate).getTime()
}

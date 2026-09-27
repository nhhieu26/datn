export const SLOT_STEP_MINUTES = 30;
export const DAY_START_TIME = "06:00";
export const DAY_END_TIME = "22:30";

export type TimeSlot = {
  startTime: string;
  endTime: string;
};

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function generateBoundaries(): string[] {
  const start = toMinutes(DAY_START_TIME);
  const end = toMinutes(DAY_END_TIME);
  const boundaries: string[] = [];
  for (let minutes = start; minutes <= end; minutes += SLOT_STEP_MINUTES) {
    boundaries.push(toTimeString(minutes));
  }
  return boundaries;
}

export const TIME_BOUNDARIES: string[] = generateBoundaries();

export const FIXED_TIME_SLOTS: TimeSlot[] = TIME_BOUNDARIES.slice(0, -1).map(
  (startTime, index) => ({
    startTime,
    endTime: TIME_BOUNDARIES[index + 1],
  })
);

export function isFixedTimeSlot(slot: TimeSlot): boolean {
  return FIXED_TIME_SLOTS.some(
    (fixed) => fixed.startTime === slot.startTime && fixed.endTime === slot.endTime
  );
}

export function getSlotsWithinRange(
  rangeStart: string,
  rangeEnd: string
): TimeSlot[] {
  const startMinutes = toMinutes(rangeStart);
  const endMinutes = toMinutes(rangeEnd);
  return FIXED_TIME_SLOTS.filter(
    (slot) =>
      toMinutes(slot.startTime) >= startMinutes &&
      toMinutes(slot.endTime) <= endMinutes
  );
}

import type { TimeInput } from "./types.js";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;

export interface TimeParts {
  hour: number;
  minute: number;
  second: number | null;
}

export const parseTime = (value: TimeInput): TimeParts | null => {
  if (typeof value !== "string") {
    return null;
  }

  const match = TIME_PATTERN.exec(value);

  if (match === null) {
    return null;
  }

  const [, hour, minute, second] = match;

  return {
    hour: Number(hour),
    minute: Number(minute),
    second: second === undefined ? null : Number(second),
  };
};

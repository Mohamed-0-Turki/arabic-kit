import type { DateInput } from "./types.js";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseDate = (value: DateInput): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = ISO_DATE_PATTERN.exec(value);

  if (match === null) {
    return null;
  }

  return toLocalDate(Number(match[1]), Number(match[2]), Number(match[3]));
};

const toLocalDate = (year: number, month: number, day: number): Date | null => {
  const date = new Date(year, month - 1, day);
  const isExactDay =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;

  return isExactDay ? date : null;
};

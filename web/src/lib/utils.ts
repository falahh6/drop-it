import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function disableConsoleLogs() {
  if (process.env.NODE_ENV !== "production") {
    console.log = function () {};
    console.info = function () {};
    console.warn = function () {};
    console.error = function () {};
  }
}

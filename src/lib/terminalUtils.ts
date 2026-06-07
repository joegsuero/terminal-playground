/**
 * Small terminal helpers shared across commands.
 */

/** Wildcard (glob) pattern matching supporting * and ?. */
export const matchPattern = (pattern: string, text: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&") // escape regex specials
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${regexPattern}$`).test(text);
};

/** Format a date the way `ls -l` does (recent files show time, older show year). */
export const formatDateForLs = (date: Date): string => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, " ");
  const year = date.getFullYear();
  const now = new Date();

  if (year === now.getFullYear()) {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month} ${day} ${hours}:${minutes}`;
  }
  return `${month} ${day} ${year}`;
};

/** Generate a unique-ish id for terminal lines. */
export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

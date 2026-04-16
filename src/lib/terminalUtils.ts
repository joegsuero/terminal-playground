/**
 * Terminal utilities for enhanced terminal experience
 * Supports ANSI color codes, pipes, and other advanced features
 */

export interface AnsiStyle {
  fg?: string;
  bg?: string;
  bold?: boolean;
  underline?: boolean;
  italic?: boolean;
}

// ANSI color codes
const ANSI_COLORS: Record<string, string> = {
  // Foreground colors
  '30': '\x1b[30m', // Black
  '31': '\x1b[31m', // Red
  '32': '\x1b[32m', // Green
  '33': '\x1b[33m', // Yellow
  '34': '\x1b[34m', // Blue
  '35': '\x1b[35m', // Magenta
  '36': '\x1b[36m', // Cyan
  '37': '\x1b[37m', // White
  '39': '\x1b[39m', // Default
  
  // Background colors
  '40': '\x1b[40m', // Black
  '41': '\x1b[41m', // Red
  '42': '\x1b[42m', // Green
  '43': '\x1b[43m', // Yellow
  '44': '\x1b[44m', // Blue
  '45': '\x1b[45m', // Magenta
  '46': '\x1b[46m', // Cyan
  '47': '\x1b[47m', // White
  '49': '\x1b[49m', // Default
  
  // Styles
  '0': '\x1b[0m',  // Reset
  '1': '\x1b[1m',  // Bold
  '3': '\x1b[3m',  // Italic
  '4': '\x1b[4m',  // Underline
  '22': '\x1b[22m', // Normal intensity
  '23': '\x1b[23m', // Not italic
  '24': '\x1b[24m', // Not underlined
};

/**
 * Parse ANSI escape codes and convert to HTML/CSS
 */
export const parseAnsiCodes = (text: string): string => {
  if (!text) return '';
  
  let result = text;
  
  // Replace ANSI reset code
  result = result.replace(/\x1b\[0m/g, '</span>');
  
  // Replace bold
  result = result.replace(/\x1b\[1m/g, '<span style="font-weight: bold;">');
  
  // Replace italic
  result = result.replace(/\x1b\[3m/g, '<span style="font-style: italic;">');
  
  // Replace underline
  result = result.replace(/\x1b\[4m/g, '<span style="text-decoration: underline;">');
  
  // Replace foreground colors
  for (let i = 30; i <= 37; i++) {
    const colorMap: Record<number, string> = {
      30: '#000000',
      31: '#ff5555',
      32: '#50fa7b',
      33: '#f1fa8c',
      34: '#8be9fd',
      35: '#bd93f9',
      36: '#8be9fd',
      37: '#bbbbbb',
    };
    result = result.replace(
      new RegExp(`\\x1b\\[${i}m`, 'g'),
      `<span style="color: ${colorMap[i]};">`
    );
  }
  
  // Replace background colors
  for (let i = 40; i <= 47; i++) {
    const colorMap: Record<number, string> = {
      40: '#000000',
      41: '#ff5555',
      42: '#50fa7b',
      43: '#f1fa8c',
      44: '#8be9fd',
      45: '#bd93f9',
      46: '#8be9fd',
      47: '#bbbbbb',
    };
    result = result.replace(
      new RegExp(`\\x1b\\[${i}m`, 'g'),
      `<span style="background-color: ${colorMap[i]};">`
    );
  }
  
  return result;
};

/**
 * Process command with pipe support
 * Splits command by '|' and processes each part
 */
export const processPipes = (command: string): string[] => {
  if (!command.includes('|')) {
    return [command];
  }
  
  return command.split('|').map(cmd => cmd.trim()).filter(Boolean);
};

/**
 * Check if output should be redirected to file
 */
export const parseRedirection = (command: string): { 
  cmd: string; 
  file?: string; 
  append?: boolean 
} => {
  // Check for append redirection (>>)
  const appendMatch = command.match(/^(.+?)\s*>>\s*(.+)$/);
  if (appendMatch) {
    return {
      cmd: appendMatch[1].trim(),
      file: appendMatch[2].trim(),
      append: true,
    };
  }
  
  // Check for write redirection (>)
  const writeMatch = command.match(/^(.+?)\s*>\s*(.+)$/);
  if (writeMatch) {
    return {
      cmd: writeMatch[1].trim(),
      file: writeMatch[2].trim(),
      append: false,
    };
  }
  
  return { cmd: command };
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date for ls -l style output
 */
export const formatDateForLs = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate().toString().padStart(2, ' ');
  const year = date.getFullYear();
  const now = new Date();
  
  // If file is from this year, show time instead of year
  if (year === now.getFullYear()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${hours}:${minutes}`;
  }
  
  return `${month} ${day} ${year}`;
};

/**
 * Wildcard pattern matching for glob patterns (*, ?)
 */
export const matchPattern = (pattern: string, text: string): boolean => {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*/g, '.*') // * matches anything
    .replace(/\?/g, '.'); // ? matches single char
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(text);
};

/**
 * Create a simple progress bar
 */
export const createProgressBar = (
  current: number, 
  total: number, 
  width: number = 40
): string => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const filledWidth = Math.round((percentage / 100) * width);
  const emptyWidth = width - filledWidth;
  
  const filled = '█'.repeat(filledWidth);
  const empty = '░'.repeat(emptyWidth);
  
  return `[${filled}${empty}] ${percentage.toFixed(1)}%`;
};

/**
 * Generate random ID for terminal lines
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

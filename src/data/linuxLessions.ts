export interface Lesson {
  id: string;
  title: string;
  description: string;
  commands: string[];
  explanation: string;
  expectedOutput?: string;
}

export const lessons: Lesson[] = [
  {
    id: "1",
    title: "Navigation Basics",
    description: "Learn to navigate the file system",
    commands: ["pwd", "ls", "cd Documents", "pwd", "cd ..", "pwd", "whoami"],
    explanation:
      "pwd shows your current directory, ls lists files, and cd changes directories. Use cd .. to go up one level. whoami shows your username.",
    expectedOutput:
      "You should see directory paths, file listings, and your username",
  },
  {
    id: "2",
    title: "File Operations",
    description: "Create and manipulate files",
    commands: [
      "touch myfile.txt",
      "ls",
      "cat myfile.txt",
      "mkdir newfolder",
      "ls -l",
      "file myfile.txt",
    ],
    explanation:
      "touch creates empty files, mkdir creates directories, cat displays file contents, and file shows file type information.",
    expectedOutput:
      "New files and directories should appear in listings with detailed information",
  },
  {
    id: "3",
    title: "File Content Management",
    description: "Work with file content and copying",
    commands: [
      'echo "Hello World" > hello.txt',
      "cat hello.txt",
      "cp hello.txt hello2.txt",
      "ls",
      "wc hello.txt",
    ],
    explanation:
      "echo writes text to files, cp copies files, and wc counts words, lines, and characters in files.",
    expectedOutput:
      "Files should be created, copied, and word counts displayed",
  },
  {
    id: "4",
    title: "Text Processing",
    description: "Search and process text content",
    commands: [
      'echo "apple\nbanana\napple\ncherry" > fruits.txt',
      "cat fruits.txt",
      "grep apple fruits.txt",
      "sort fruits.txt",
      "head -n 2 fruits.txt",
    ],
    explanation:
      "grep searches for patterns in text, sort arranges lines alphabetically, and head shows the first lines of a file.",
    expectedOutput: "Text search results, sorted content, and first few lines",
  },
  {
    id: "5",
    title: "System Information",
    description: "Monitor system resources and processes",
    commands: ["ps", "top", "df -h", "free -h", "uname -a"],
    explanation:
      "ps shows running processes, top displays real-time system info, df shows disk usage, free shows memory usage, and uname shows system information.",
    expectedOutput:
      "System processes, disk space, memory usage, and system details",
  },
  {
    id: "6",
    title: "Advanced File Operations",
    description: "Move, search, and manage files",
    commands: [
      "mv hello2.txt renamed.txt",
      "ls",
      'find . -name "*.txt"',
      "chmod 755 renamed.txt",
      "ls -l",
    ],
    explanation:
      "mv moves/renames files, find searches for files by name or pattern, and chmod changes file permissions.",
    expectedOutput:
      "Renamed files, search results, and updated file permissions",
  },
  {
    id: "7",
    title: "Network Commands",
    description: "Basic network troubleshooting and downloads",
    commands: [
      "ping localhost",
      "traceroute google.com",
      "wget http://example.com",
      "curl http://httpbin.org/json",
    ],
    explanation:
      "ping tests connectivity, traceroute shows network path, wget downloads files, and curl transfers data from servers.",
    expectedOutput:
      "Network connectivity information, routing paths, and web content",
  },
  {
    id: "8",
    title: "Text Analysis",
    description: "Advanced text processing and analysis",
    commands: [
      'echo "one\ntwo\nthree\ntwo\none" > numbers.txt',
      "cat numbers.txt",
      "sort numbers.txt",
      "tail -n 3 numbers.txt",
    ],
    explanation:
      "Practice with more text processing: sort arranges content, tail shows the last lines of files.",
    expectedOutput: "Sorted text content and last few lines of files",
  },
  {
    id: "9",
    title: "System Commands",
    description: "Date, time, and command information",
    commands: ["date", "uptime", "history", "which ls", "man grep"],
    explanation:
      "date shows current time, uptime shows system uptime, history shows command history, which locates commands, and man shows manual pages.",
    expectedOutput:
      "Current date/time, system uptime, command history, and documentation",
  },
  {
    id: "10",
    title: "Cleanup and Archives",
    description: "Remove files and work with archives",
    commands: [
      "ls",
      "rm fruits.txt",
      "rm numbers.txt",
      "tar -czf backup.tar.gz *.txt",
      "ls -la",
    ],
    explanation:
      "rm removes files, tar creates compressed archives. Be careful with rm as it permanently deletes files!",
    expectedOutput: "Files should be removed and archives created",
  },
];

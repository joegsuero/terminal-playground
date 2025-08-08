import { Command } from "@/types/types";

export const help: Command = {
  name: "help",
  description: "Show available commands",
  execute: () => [
    {
      id: Date.now().toString(),
      type: "output",
      content:
        "Available commands:\n\nFile Operations:\n  ls - list directory contents\n  cd - change directory\n  pwd - print working directory\n  mkdir - create directory\n  touch - create file\n  cat - display file content\n  rm - remove files\n  cp - copy files\n  mv - move/rename files\n  find - search for files\n  grep - search text patterns\n  head - display first lines\n  tail - display last lines\n  wc - word, line, character count\n  sort - sort lines\n  uniq - report unique lines\n  cut - extract columns\n  tr - translate characters\n\nSystem Information:\n  ps - show running processes\n  top - display system processes\n  df - disk space usage\n  du - directory space usage\n  free - memory usage\n  uname - system information\n  whoami - current user\n  date - current date/time\n  uptime - system uptime\n  history - command history\n\nFile Permissions:\n  chmod - change file permissions\n  chown - change file ownership\n  chgrp - change group ownership\n\nNetworking:\n  ping - ping a host\n  traceroute - trace route to host\n  wget - download files\n  curl - transfer data\n  netstat - network connections\n  ssh - secure shell (simulated)\n\nText Processing:\n  echo - display text\n  sed - stream editor\n  awk - text processing\n\nArchive Operations:\n  tar - archive files\n  gzip - compress files\n  gunzip - decompress files\n  zip - create zip archives\n  unzip - extract zip archives\n\nProcess Management:\n  kill - terminate processes\n  jobs - active jobs\n  nohup - run commands immune to hangups\n\nEnvironment:\n  env - environment variables\n  export - set environment variables\n  alias - create command aliases\n\nOther:\n  clear - clear terminal\n  man - manual pages (simulated)\n  which - locate command\n  file - determine file type",
      timestamp: new Date(),
    },
  ],
};

import { help } from "./help";
import { clear } from "./clear";
import { pwd } from "./pwd";
import { ls } from "./ls";
import { cd } from "./cd";
import { mkdir } from "./mkdir";
import { touch } from "./touch";
import { cat } from "./cat";
import { rm } from "./rm";
import { cp } from "./cp";
import { mv } from "./mv";
import { find } from "./find";
import { grep } from "./grep";
import { head } from "./head";
import { tail } from "./tail";
import { wc } from "./wc";
import { ps } from "./ps";
import { top } from "./top";
import { df } from "./df";
import { free } from "./free";
import { uname } from "./uname";
import { whoami } from "./whoami";
import { date } from "./date";
import { uptime } from "./uptime";
import { echo } from "./echo";
import { chmod } from "./chmod";
import { wget } from "./wget";
import { curl } from "./curl";
import { history } from "./history";
import { man } from "./man";
import { which } from "./which";
import { file } from "./file";
import { tar } from "./tar";
import { sort } from "./sort";
import { ping } from "./ping";
import { traceroute } from "./traceroute";
import { Command } from "@/types/types";

export const commands: Record<string, Command> = {
  help: help,
  clear: clear,
  pwd: pwd,
  ls: ls,
  cd: cd,
  mkdir: mkdir,
  touch: touch,
  cat: cat,
  rm: rm,
  cp: cp,
  mv: mv,
  find: find,
  grep: grep,
  head: head,
  tail: tail,
  wc: wc,
  ps: ps,
  top: top,
  df: df,
  free: free,
  uname: uname,
  whoami: whoami,
  date: date,
  uptime: uptime,
  echo: echo,
  chmod: chmod,
  wget: wget,
  curl: curl,
  history: history,
  man: man,
  which: which,
  file: file,
  tar: tar,
  sort: sort,
  ping: ping, // <-- Nuevo
  traceroute: traceroute, // <-- Nuevo
};

import { Command } from "@/types/types";

export const tee: Command = {
  name: "tee",
  description: "Read from stdin and write to files and stdout",
  execute: (args, fs, _history, stdin) => {
    const append = args.includes("-a");
    const files = args.filter((a) => !a.startsWith("-"));
    const content = stdin ?? "";

    for (const file of files) {
      if (append) {
        const prev = fs.getFile(file)?.content ?? "";
        fs.createFile(file, prev ? prev + "\n" + content : content);
      } else {
        // createFile overwrites existing files in this VFS.
        if (fs.getFile(file)) fs.removeItem(file);
        fs.createFile(file, content);
      }
    }

    return [{ id: Date.now().toString(), type: "output", content, timestamp: new Date() }];
  },
};

/**
 * Framework-agnostic virtual file system.
 *
 * Stores the directory tree as a map of absolute directory path -> entries,
 * exactly like a real shell would resolve inodes. All methods operate on
 * already-resolved absolute paths; path normalization (cwd, ~, .., .) is the
 * caller's responsibility (see ShellSession.resolvePath).
 */

export interface FileSystemItem {
  name: string;
  type: "file" | "directory";
  content?: string;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modified: Date;
}

export interface FileSystemData {
  [path: string]: FileSystemItem[];
}

export const HOME = "/home/user";

const dirItem = (name: string, perms = "drwxr-xr-x", owner = "user"): FileSystemItem => ({
  name,
  type: "directory",
  permissions: perms,
  owner,
  group: owner,
  size: 4096,
  modified: new Date(),
});

const fileItem = (name: string, content: string, owner = "user"): FileSystemItem => ({
  name,
  type: "file",
  content,
  permissions: "-rw-r--r--",
  owner,
  group: owner,
  size: content.length,
  modified: new Date(),
});

export const createInitialData = (): FileSystemData => ({
  "/": [
    dirItem("home", "drwxr-xr-x", "root"),
    dirItem("etc", "drwxr-xr-x", "root"),
    dirItem("var", "drwxr-xr-x", "root"),
    dirItem("usr", "drwxr-xr-x", "root"),
    dirItem("bin", "drwxr-xr-x", "root"),
    dirItem("tmp", "drwxrwxrwt", "root"),
  ],
  "/home": [dirItem("user")],
  "/home/user": [
    dirItem("Documents"),
    dirItem("Downloads"),
    dirItem("projects"),
    fileItem(
      "welcome.txt",
      "Welcome to the Linux Terminal Playground!\nThis is a simulated environment for learning Linux commands.\nTry: ls, cat welcome.txt, help, or open a split with Ctrl+B then %"
    ),
    fileItem("notes.md", "# Notes\n- learn pipes\n- learn redirection\n- master tmux\n"),
  ],
  "/home/user/Documents": [
    fileItem("todo.txt", "buy milk\nwrite code\nread a book\nwrite code\n"),
  ],
  "/home/user/Downloads": [],
  "/home/user/projects": [],
  "/tmp": [],
  "/etc": [
    fileItem("hostname", "linux-playground\n", "root"),
    fileItem("os-release", 'NAME="Playground Linux"\nVERSION="1.0"\n', "root"),
  ],
  "/var": [],
  "/usr": [],
  "/bin": [],
});

export class VirtualFileSystem {
  private data: FileSystemData;

  constructor(data?: FileSystemData) {
    this.data = data || createInitialData();
  }

  /** Parent directory of an absolute path. */
  private parentOf(abs: string): string {
    return abs.substring(0, abs.lastIndexOf("/")) || "/";
  }

  private baseName(abs: string): string {
    return abs.substring(abs.lastIndexOf("/") + 1);
  }

  isDir(abs: string): boolean {
    return abs in this.data;
  }

  exists(abs: string): boolean {
    return this.isDir(abs) || this.getItem(abs) !== null;
  }

  getItem(abs: string): FileSystemItem | null {
    if (abs === "/") return dirItem("/", "drwxr-xr-x", "root");
    const parent = this.parentOf(abs);
    const name = this.baseName(abs);
    return (this.data[parent] || []).find((i) => i.name === name) || null;
  }

  list(abs: string): FileSystemItem[] {
    return this.data[abs] || [];
  }

  mkdir(abs: string, parents = false): boolean {
    if (abs === "/") return false;

    if (parents) {
      const segments = abs.split("/").filter(Boolean);
      let built = "";
      for (const seg of segments) {
        const parent = built || "/";
        built = built === "" ? "/" + seg : built + "/" + seg;
        if (!(built in this.data)) {
          if (!(this.data[parent] || []).some((i) => i.name === seg)) {
            this.data[parent] = [...(this.data[parent] || []), dirItem(seg)];
          }
          this.data[built] = this.data[built] || [];
        }
      }
      return true;
    }

    const parent = this.parentOf(abs);
    const name = this.baseName(abs);
    if (this.exists(abs)) return false;
    if (!(parent in this.data)) return false;
    this.data[parent] = [...(this.data[parent] || []), dirItem(name)];
    this.data[abs] = [];
    return true;
  }

  writeFile(abs: string, content: string): boolean {
    const parent = this.parentOf(abs);
    const name = this.baseName(abs);
    if (!(parent in this.data)) return false;
    if (this.isDir(abs)) return false;

    const items = this.data[parent] || [];
    const idx = items.findIndex((i) => i.name === name);
    if (idx >= 0) {
      this.data[parent] = items.map((i, k) =>
        k === idx ? { ...i, content, size: content.length, modified: new Date() } : i
      );
    } else {
      this.data[parent] = [...items, fileItem(name, content)];
    }
    return true;
  }

  touch(abs: string): boolean {
    const parent = this.parentOf(abs);
    const name = this.baseName(abs);
    if (!(parent in this.data)) return false;
    const items = this.data[parent] || [];
    if (items.some((i) => i.name === name)) {
      this.data[parent] = items.map((i) =>
        i.name === name ? { ...i, modified: new Date() } : i
      );
    } else {
      this.data[parent] = [...items, fileItem(name, "")];
    }
    return true;
  }

  remove(abs: string, recursive = false): boolean {
    const parent = this.parentOf(abs);
    const name = this.baseName(abs);
    if (!(parent in this.data)) return false;
    const item = (this.data[parent] || []).find((i) => i.name === name);
    if (!item) return false;
    if (item.type === "directory" && !recursive) return false;

    this.data[parent] = (this.data[parent] || []).filter((i) => i.name !== name);
    if (item.type === "directory") {
      const prefix = abs + "/";
      Object.keys(this.data).forEach((key) => {
        if (key === abs || key.startsWith(prefix)) delete this.data[key];
      });
    }
    return true;
  }

  copy(absSrc: string, absDest: string, recursive = false): boolean {
    const srcItem = this.getItem(absSrc);
    if (!srcItem) return false;

    // Copying into an existing directory keeps the source basename.
    let dest = absDest;
    if (this.isDir(dest)) {
      dest = (dest === "/" ? "" : dest) + "/" + srcItem.name;
    }
    const destParent = this.parentOf(dest);
    const destName = this.baseName(dest);
    if (!(destParent in this.data)) return false;

    if (srcItem.type === "file") {
      const items = this.data[destParent] || [];
      const copy: FileSystemItem = { ...srcItem, name: destName, modified: new Date() };
      const idx = items.findIndex((i) => i.name === destName);
      this.data[destParent] =
        idx >= 0 ? items.map((i, k) => (k === idx ? copy : i)) : [...items, copy];
      return true;
    }

    if (!recursive) return false;

    const walk = (from: string, to: string) => {
      const toParent = this.parentOf(to);
      const toName = this.baseName(to);
      const fromMeta = this.getItem(from);
      this.data[toParent] = [
        ...(this.data[toParent] || []).filter((i) => i.name !== toName),
        { ...(fromMeta || dirItem(toName)), name: toName },
      ];
      this.data[to] = [];
      for (const child of this.data[from] || []) {
        if (child.type === "directory") walk(from + "/" + child.name, to + "/" + child.name);
        else this.data[to] = [...this.data[to], { ...child }];
      }
    };
    walk(absSrc, dest);
    return true;
  }

  /** Recursively sum the byte size of a path (files + nested files). */
  diskUsage(abs: string): number {
    const item = this.getItem(abs);
    if (!item) return 0;
    if (item.type === "file") return item.content?.length || 0;
    let total = 4096;
    for (const child of this.list(abs)) {
      total +=
        child.type === "directory"
          ? this.diskUsage(abs + "/" + child.name)
          : child.content?.length || 0;
    }
    return total;
  }

  // ---- Persistence ----
  serialize(): string {
    return JSON.stringify(this.data, (key, value) =>
      key === "modified" && value instanceof Date ? value.toISOString() : value
    );
  }

  static deserialize(json: string): VirtualFileSystem {
    try {
      const parsed = JSON.parse(json) as FileSystemData;
      Object.values(parsed).forEach((items) =>
        items.forEach((item) => {
          item.modified = new Date(item.modified);
        })
      );
      return new VirtualFileSystem(parsed);
    } catch {
      return new VirtualFileSystem();
    }
  }
}

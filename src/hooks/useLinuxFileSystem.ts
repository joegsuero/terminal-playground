import { useRef, useState, useCallback } from 'react';

export interface FileSystemItem {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modified: Date;
}

export interface FileSystem {
  [path: string]: FileSystemItem[];
}

const HOME = '/home/user';

const createInitialFileSystem = (): FileSystem => ({
  '/': [
    { name: 'home', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'etc', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'var', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'usr', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'bin', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'tmp', type: 'directory', permissions: 'drwxrwxrwt', owner: 'root', group: 'root', size: 4096, modified: new Date() },
  ],
  '/home': [
    { name: 'user', type: 'directory', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', size: 4096, modified: new Date() },
  ],
  '/home/user': [
    { name: 'Documents', type: 'directory', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', size: 4096, modified: new Date() },
    { name: 'Downloads', type: 'directory', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', size: 4096, modified: new Date() },
    { name: 'welcome.txt', type: 'file', content: 'Welcome to the Linux Terminal Playground!\nThis is a simulated environment for learning Linux commands.', permissions: '-rw-r--r--', owner: 'user', group: 'user', size: 87, modified: new Date() },
  ],
  '/home/user/Documents': [],
  '/home/user/Downloads': [],
  '/tmp': [],
  '/etc': [],
  '/var': [],
  '/usr': [],
  '/bin': [],
});

const defaultEnv = (): Record<string, string> => ({
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  HOME,
  USER: 'user',
  LOGNAME: 'user',
  SHELL: '/bin/bash',
  TERM: 'xterm-256color',
  LANG: 'en_US.UTF-8',
  PWD: HOME,
  OLDPWD: HOME,
  HOSTNAME: 'linux-playground',
});

/**
 * In-memory file system backed by refs so that mutations made by one command
 * are visible synchronously to the next command in the same line (needed for
 * pipelines and `&&`/`;` chaining). A version counter triggers re-renders.
 */
export const useFileSystem = () => {
  const fsRef = useRef<FileSystem>(createInitialFileSystem());
  const pathRef = useRef<string>(HOME);
  const envRef = useRef<Record<string, string>>(defaultEnv());
  const aliasRef = useRef<Record<string, string>>({});
  const lastExitRef = useRef<number>(0);

  const [, setVersion] = useState(0);
  const rerender = useCallback(() => setVersion((v) => v + 1), []);

  const resolvePath = useCallback((path: string, current: string = pathRef.current): string => {
    if (!path) return current;

    if (path === '~') path = HOME;
    else if (path.startsWith('~/')) path = HOME + path.slice(1);

    const isAbsolute = path.startsWith('/');
    const baseParts = isAbsolute ? [] : current.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    const parts = [...baseParts];
    for (const part of pathParts) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }

    return parts.length === 0 ? '/' : '/' + parts.join('/');
  }, []);

  const setCurrentPath = useCallback((path: string) => {
    envRef.current.OLDPWD = pathRef.current;
    pathRef.current = path;
    envRef.current.PWD = path;
    rerender();
  }, [rerender]);

  const isDirectory = useCallback((path: string): boolean => {
    return resolvePath(path) in fsRef.current;
  }, [resolvePath]);

  const getFile = useCallback((path: string): FileSystemItem | null => {
    const resolved = resolvePath(path);
    if (resolved === '/') {
      return { name: '/', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() };
    }
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);
    return (fsRef.current[parentPath] || []).find((item) => item.name === fileName) || null;
  }, [resolvePath]);

  const pathExists = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    if (resolved in fsRef.current) return true;
    return getFile(resolved) !== null;
  }, [resolvePath, getFile]);

  const getDirectory = useCallback((path: string): FileSystemItem[] => {
    return fsRef.current[resolvePath(path)] || [];
  }, [resolvePath]);

  const createDirectory = useCallback((path: string, parents = false): boolean => {
    const resolved = resolvePath(path);
    if (resolved === '/') return false;

    const fs = fsRef.current;

    if (parents) {
      const segments = resolved.split('/').filter(Boolean);
      let built = '';
      let changed = false;
      for (const seg of segments) {
        const parent = built || '/';
        built = built === '' ? '/' + seg : built + '/' + seg;
        const parentItems = fs[parent] || [];
        if (!(built in fs)) {
          if (!parentItems.some((i) => i.name === seg)) {
            fs[parent] = [
              ...parentItems,
              { name: seg, type: 'directory', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', size: 4096, modified: new Date() },
            ];
          }
          fs[built] = fs[built] || [];
          changed = true;
        }
      }
      if (changed) rerender();
      return true; // mkdir -p is idempotent
    }

    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const dirName = resolved.substring(resolved.lastIndexOf('/') + 1);

    if (pathExists(resolved)) return false;
    if (!(parentPath in fs)) return false;

    fs[parentPath] = [
      ...(fs[parentPath] || []),
      { name: dirName, type: 'directory', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', size: 4096, modified: new Date() },
    ];
    fs[resolved] = [];
    rerender();
    return true;
  }, [resolvePath, pathExists, rerender]);

  const createFile = useCallback((path: string, content: string = ''): boolean => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);

    const fs = fsRef.current;
    if (!(parentPath in fs)) return false;
    if (resolved in fs) return false; // would clobber a directory

    const parentItems = fs[parentPath] || [];
    const existingIndex = parentItems.findIndex((item) => item.name === fileName);
    if (existingIndex >= 0) {
      fs[parentPath] = parentItems.map((item, i) =>
        i === existingIndex
          ? { ...item, content, size: content.length, modified: new Date() }
          : item
      );
    } else {
      fs[parentPath] = [
        ...parentItems,
        { name: fileName, type: 'file', content, permissions: '-rw-r--r--', owner: 'user', group: 'user', size: content.length, modified: new Date() },
      ];
    }
    rerender();
    return true;
  }, [resolvePath, rerender]);

  const touchFile = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);

    const fs = fsRef.current;
    if (!(parentPath in fs)) return false;

    const parentItems = fs[parentPath] || [];
    const existing = parentItems.find((item) => item.name === fileName);
    if (existing) {
      fs[parentPath] = parentItems.map((item) =>
        item.name === fileName ? { ...item, modified: new Date() } : item
      );
    } else {
      fs[parentPath] = [
        ...parentItems,
        { name: fileName, type: 'file', content: '', permissions: '-rw-r--r--', owner: 'user', group: 'user', size: 0, modified: new Date() },
      ];
    }
    rerender();
    return true;
  }, [resolvePath, rerender]);

  const removeItem = useCallback((path: string, recursive = false): boolean => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const itemName = resolved.substring(resolved.lastIndexOf('/') + 1);

    const fs = fsRef.current;
    if (!(parentPath in fs)) return false;

    const item = (fs[parentPath] || []).find((it) => it.name === itemName);
    if (!item) return false;
    if (item.type === 'directory' && !recursive) return false;

    fs[parentPath] = (fs[parentPath] || []).filter((it) => it.name !== itemName);

    if (item.type === 'directory') {
      const prefix = resolved + '/';
      Object.keys(fs).forEach((key) => {
        if (key === resolved || key.startsWith(prefix)) delete fs[key];
      });
    }
    rerender();
    return true;
  }, [resolvePath, rerender]);

  const copyItem = useCallback((src: string, dest: string, recursive = false): boolean => {
    const srcResolved = resolvePath(src);
    const srcItem = getFile(srcResolved);
    if (!srcItem) return false;

    const fs = fsRef.current;

    let destResolved = resolvePath(dest);
    if (destResolved in fs) {
      destResolved = (destResolved === '/' ? '' : destResolved) + '/' + srcItem.name;
    }
    const destParent = destResolved.substring(0, destResolved.lastIndexOf('/')) || '/';
    const destName = destResolved.substring(destResolved.lastIndexOf('/') + 1);

    if (!(destParent in fs)) return false;

    if (srcItem.type === 'file') {
      const parentItems = fs[destParent] || [];
      const copy: FileSystemItem = { ...srcItem, name: destName, modified: new Date() };
      const idx = parentItems.findIndex((i) => i.name === destName);
      fs[destParent] = idx >= 0
        ? parentItems.map((i, n) => (n === idx ? copy : i))
        : [...parentItems, copy];
      rerender();
      return true;
    }

    if (!recursive) return false;

    const walk = (from: string, to: string) => {
      const fromName = from.substring(from.lastIndexOf('/') + 1);
      const toParent = to.substring(0, to.lastIndexOf('/')) || '/';
      const toName = to.substring(to.lastIndexOf('/') + 1);
      const fromParent = from.substring(0, from.lastIndexOf('/')) || '/';
      const dirMeta = (fs[fromParent] || []).find((i) => i.name === fromName);

      fs[toParent] = [
        ...(fs[toParent] || []).filter((i) => i.name !== toName),
        { ...(dirMeta || { type: 'directory', permissions: 'drwxr-xr-x', owner: 'user', group: 'user', size: 4096, modified: new Date() } as FileSystemItem), name: toName },
      ];
      fs[to] = [];
      for (const child of fs[from] || []) {
        if (child.type === 'directory') walk(from + '/' + child.name, to + '/' + child.name);
        else fs[to] = [...fs[to], { ...child }];
      }
    };
    walk(srcResolved, destResolved);
    rerender();
    return true;
  }, [resolvePath, getFile, rerender]);

  return {
    get currentPath() {
      return pathRef.current;
    },
    setCurrentPath,
    pathExists,
    isDirectory,
    getDirectory,
    createDirectory,
    createFile,
    touchFile,
    removeItem,
    copyItem,
    getFile,
    resolvePath,
    envVars: envRef.current,
    aliases: aliasRef.current,
    getLastExit: () => lastExitRef.current,
    setLastExit: (code: number) => {
      lastExitRef.current = code;
    },
  };
};

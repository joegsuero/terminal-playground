import { useState, useCallback } from 'react';

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

const initialFileSystem: FileSystem = {
  '/': [
    { name: 'home', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'etc', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'var', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'usr', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
    { name: 'bin', type: 'directory', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', size: 4096, modified: new Date() },
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
};

export const useFileSystem = () => {
  const [fileSystem, setFileSystem] = useState<FileSystem>(initialFileSystem);
  const [currentPath, setCurrentPath] = useState('/home/user');

  const resolvePath = useCallback((path: string, current: string = currentPath): string => {
    if (path.startsWith('/')) {
      return path === '/' ? '/' : path.replace(/\/$/, '');
    }
    
    const parts = current.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);
    
    for (const part of pathParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.') {
        parts.push(part);
      }
    }
    
    return '/' + parts.join('/').replace(/\/$/, '') || '/';
  }, [currentPath]);

  const pathExists = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    return resolved in fileSystem;
  }, [fileSystem, resolvePath]);

  const getDirectory = useCallback((path: string): FileSystemItem[] => {
    const resolved = resolvePath(path);
    return fileSystem[resolved] || [];
  }, [fileSystem, resolvePath]);

  const createDirectory = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const dirName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    if (pathExists(resolved)) return false;
    if (!pathExists(parentPath)) return false;
    
    const newDir: FileSystemItem = {
      name: dirName,
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'user',
      group: 'user',
      size: 4096,
      modified: new Date()
    };
    
    setFileSystem(prev => ({
      ...prev,
      [parentPath]: [...(prev[parentPath] || []), newDir],
      [resolved]: []
    }));
    
    return true;
  }, [pathExists, resolvePath]);

  const createFile = useCallback((path: string, content: string = ''): boolean => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    if (!pathExists(parentPath)) return false;
    
    const newFile: FileSystemItem = {
      name: fileName,
      type: 'file',
      content,
      permissions: '-rw-r--r--',
      owner: 'user',
      group: 'user',
      size: content.length,
      modified: new Date()
    };
    
    setFileSystem(prev => {
      const parentItems = prev[parentPath] || [];
      const existingIndex = parentItems.findIndex(item => item.name === fileName);
      
      const updatedItems = existingIndex >= 0 
        ? parentItems.map((item, i) => i === existingIndex ? newFile : item)
        : [...parentItems, newFile];
      
      return {
        ...prev,
        [parentPath]: updatedItems
      };
    });
    
    return true;
  }, [pathExists, resolvePath]);

  const removeItem = useCallback((path: string): boolean => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const itemName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    if (!pathExists(parentPath)) return false;
    
    setFileSystem(prev => {
      const parentItems = prev[parentPath] || [];
      const item = parentItems.find(item => item.name === itemName);
      
      if (!item) return prev;
      
      const updatedParentItems = parentItems.filter(item => item.name !== itemName);
      const newState = {
        ...prev,
        [parentPath]: updatedParentItems
      };
      
      // If it's a directory, remove it from the filesystem
      if (item.type === 'directory') {
        delete newState[resolved];
      }
      
      return newState;
    });
    
    return true;
  }, [pathExists, resolvePath]);

  const getFile = useCallback((path: string): FileSystemItem | null => {
    const resolved = resolvePath(path);
    const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
    const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);
    
    const parentItems = fileSystem[parentPath] || [];
    return parentItems.find(item => item.name === fileName) || null;
  }, [fileSystem, resolvePath]);

  return {
    currentPath,
    setCurrentPath,
    pathExists,
    getDirectory,
    createDirectory,
    createFile,
    removeItem,
    getFile,
    resolvePath
  };
};
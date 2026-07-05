import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { ReplSession, EditorRequest } from "@/lib/repl";
import { ReadlineShell } from "@/lib/ReadlineShell";
import { EditorOverlay } from "./EditorOverlay";
import { useTerminalStore } from "@/store/terminalStore";

// ---- Pane layout tree -----------------------------------------------------

type PaneNode =
  | { kind: "pane"; id: string }
  | { kind: "split"; id: string; dir: "h" | "v"; a: PaneNode; b: PaneNode };

interface WindowState {
  id: string;
  root: PaneNode;
}

interface PaneRuntime {
  term: Terminal;
  fit: FitAddon;
  shell: ReadlineShell;
  session: ReplSession;
  started?: boolean;
}

let idCounter = 1;
const nextId = (p: string) => `${p}${idCounter++}`;

const collectLeaves = (node: PaneNode): string[] =>
  node.kind === "pane" ? [node.id] : [...collectLeaves(node.a), ...collectLeaves(node.b)];

const replaceLeaf = (node: PaneNode, id: string, repl: PaneNode): PaneNode => {
  if (node.kind === "pane") return node.id === id ? repl : node;
  return { ...node, a: replaceLeaf(node.a, id, repl), b: replaceLeaf(node.b, id, repl) };
};

const removeLeaf = (node: PaneNode, id: string): PaneNode | null => {
  if (node.kind === "pane") return node.id === id ? null : node;
  const a = removeLeaf(node.a, id);
  const b = removeLeaf(node.b, id);
  if (a === null) return b;
  if (b === null) return a;
  return { ...node, a, b };
};

interface TmuxTerminalProps {
  themeMode?: "light" | "dark";
  /** Create a fresh session for a new pane (sharing the backing engine). */
  createSession: () => ReplSession;
  /** Serialize the shared backing engine for persistence. */
  serialize: () => string;
  /** localStorage key under which the engine state is persisted. */
  storageKey: string;
  /** Accent colour for the status bar / active pane border. */
  accent?: "green" | "cyan";
  /** Label shown in the status bar (e.g. "playground", "docker"). */
  label?: string;
}

export const TmuxTerminal: React.FC<TmuxTerminalProps> = ({
  themeMode = "dark",
  createSession,
  serialize,
  storageKey,
  accent = "green",
  label = "playground",
}) => {
  const runtimes = useRef<Map<string, PaneRuntime>>(new Map());
  const prefixMode = useRef(false);
  const handlersRef = useRef<{
    onEditor: (paneId: string, req: EditorRequest) => void;
    onExit: (paneId: string) => void;
    onUpdate: () => void;
    onPrefixKey: (paneId: string, e: KeyboardEvent) => boolean;
  }>({ onEditor: () => {}, onExit: () => {}, onUpdate: () => {}, onPrefixKey: () => true });

  const themeRef = useRef(themeMode);
  themeRef.current = themeMode;

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState("");
  const [activePaneId, setActivePaneId] = useState("");
  const [editor, setEditor] = useState<{ paneId: string; req: EditorRequest } | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [statusTick, setStatusTick] = useState(0);

  const { commandToExecute, clearCommand } = useTerminalStore();

  // ---- Persistence --------------------------------------------------------
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const persist = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, serialize());
      } catch {
        /* ignore quota errors */
      }
    }, 300);
  }, [serialize, storageKey]);

  // ---- Pane runtime creation ---------------------------------------------
  const xtermTheme = useMemo(
    () =>
      themeMode === "light"
        ? { background: "#f5f7fa", foreground: "#1b2430", cursor: "#1b7f3b", selectionBackground: "#bcd9ff" }
        : { background: "#0b1020", foreground: "#d6f5d6", cursor: "#43e07f", selectionBackground: "#1f4d2e" },
    [themeMode]
  );

  const createPane = useCallback((): string => {
    const id = nextId("p");
    const term = new Terminal({
      convertEol: true,
      cursorBlink: true,
      fontFamily: '"Fira Code", "Cascadia Code", Menlo, Consolas, monospace',
      fontSize: 13,
      theme: xtermTheme,
      scrollback: 2000,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);

    const session = createSession();
    const shell = new ReadlineShell(term, session, {
      onEditor: (req) => handlersRef.current.onEditor(id, req),
      onExit: () => handlersRef.current.onExit(id),
      onUpdate: () => handlersRef.current.onUpdate(),
    });

    term.attachCustomKeyEventHandler((e) => {
      if (e.type !== "keydown") return true;
      return handlersRef.current.onPrefixKey(id, e);
    });

    runtimes.current.set(id, { term, fit, shell, session });
    return id;
  }, [xtermTheme, createSession]);

  // ---- Initial window -----------------------------------------------------
  useEffect(() => {
    const paneId = createPane();
    const winId = nextId("w");
    setWindows([{ id: winId, root: { kind: "pane", id: paneId } }]);
    setActiveWindowId(winId);
    setActivePaneId(paneId);
    const map = runtimes.current;
    return () => {
      map.forEach((r) => {
        r.shell.dispose();
        r.term.dispose();
      });
      map.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Clock --------------------------------------------------------------
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const focusPane = useCallback((id: string) => {
    setActivePaneId(id);
    setTimeout(() => runtimes.current.get(id)?.term.focus(), 0);
  }, []);

  // ---- Layout operations --------------------------------------------------
  const splitActive = useCallback(
    (dir: "h" | "v") => {
      const newId = createPane();
      setWindows((wins) =>
        wins.map((w) => {
          if (w.id !== activeWindowId) return w;
          const repl: PaneNode = {
            kind: "split",
            id: nextId("s"),
            dir,
            a: { kind: "pane", id: activePaneId },
            b: { kind: "pane", id: newId },
          };
          return { ...w, root: replaceLeaf(w.root, activePaneId, repl) };
        })
      );
      focusPane(newId);
    },
    [activeWindowId, activePaneId, createPane, focusPane]
  );

  const closePane = useCallback(
    (paneId: string) => {
      const rt = runtimes.current.get(paneId);
      if (rt) {
        rt.shell.dispose();
        rt.term.dispose();
        runtimes.current.delete(paneId);
      }

      setWindows((wins) => {
        const win = wins.find((w) => w.id === activeWindowId);
        if (!win) return wins;
        const newRoot = removeLeaf(win.root, paneId);

        if (newRoot === null) {
          // Window emptied: drop it (or recreate a fresh one if it was the last).
          const remaining = wins.filter((w) => w.id !== activeWindowId);
          if (remaining.length === 0) {
            const np = createPane();
            const nw = nextId("w");
            setActiveWindowId(nw);
            focusPane(np);
            return [{ id: nw, root: { kind: "pane", id: np } }];
          }
          const target = remaining[0];
          setActiveWindowId(target.id);
          focusPane(collectLeaves(target.root)[0]);
          return remaining;
        }

        focusPane(collectLeaves(newRoot)[0]);
        return wins.map((w) => (w.id === activeWindowId ? { ...w, root: newRoot } : w));
      });
    },
    [activeWindowId, createPane, focusPane]
  );

  const newWindow = useCallback(() => {
    const paneId = createPane();
    const winId = nextId("w");
    setWindows((wins) => [...wins, { id: winId, root: { kind: "pane", id: paneId } }]);
    setActiveWindowId(winId);
    focusPane(paneId);
  }, [createPane, focusPane]);

  const selectWindow = useCallback(
    (idx: number) => {
      setWindows((wins) => {
        const w = wins[idx];
        if (w) {
          setActiveWindowId(w.id);
          focusPane(collectLeaves(w.root)[0]);
        }
        return wins;
      });
    },
    [focusPane]
  );

  const cycleWindow = useCallback(
    (delta: number) => {
      setWindows((wins) => {
        const i = wins.findIndex((w) => w.id === activeWindowId);
        const next = wins[(i + delta + wins.length) % wins.length];
        if (next) {
          setActiveWindowId(next.id);
          focusPane(collectLeaves(next.root)[0]);
        }
        return wins;
      });
    },
    [activeWindowId, focusPane]
  );

  const moveFocus = useCallback(
    (delta: number) => {
      const win = windows.find((w) => w.id === activeWindowId);
      if (!win) return;
      const leaves = collectLeaves(win.root);
      const i = leaves.indexOf(activePaneId);
      const next = leaves[(i + delta + leaves.length) % leaves.length];
      if (next) focusPane(next);
    },
    [windows, activeWindowId, activePaneId, focusPane]
  );

  // ---- tmux prefix key handling ------------------------------------------
  handlersRef.current.onPrefixKey = (paneId, e) => {
    // Ctrl+B enters prefix mode.
    if (!prefixMode.current && e.ctrlKey && e.key === "b") {
      prefixMode.current = true;
      return false;
    }
    if (prefixMode.current) {
      prefixMode.current = false;
      const k = e.key;
      if (k === "%") splitActive("v");
      else if (k === '"') splitActive("h");
      else if (k === "c") newWindow();
      else if (k === "x") closePane(paneId);
      else if (k === "o") moveFocus(1);
      else if (k === "n") cycleWindow(1);
      else if (k === "p") cycleWindow(-1);
      else if (k === "ArrowLeft" || k === "ArrowUp") moveFocus(-1);
      else if (k === "ArrowRight" || k === "ArrowDown") moveFocus(1);
      else if (/^[0-9]$/.test(k)) selectWindow(parseInt(k, 10));
      return false;
    }
    return true;
  };

  // ---- Editor + update handlers ------------------------------------------
  handlersRef.current.onEditor = (paneId, req) => setEditor({ paneId, req });
  handlersRef.current.onExit = (paneId) => closePane(paneId);
  handlersRef.current.onUpdate = () => {
    persist();
    setStatusTick((t) => t + 1);
  };

  const closeEditor = useCallback(
    (result: { saved: boolean; content: string }) => {
      if (!editor) return;
      const rt = runtimes.current.get(editor.paneId);
      let message = "";
      if (rt) {
        if (result.saved) {
          rt.session.saveEditorFile?.(editor.req.path, result.content);
          persist();
          const lc = result.content.split("\n").length;
          message =
            editor.req.editor === "vim"
              ? `"${editor.req.path}" ${lc}L, ${result.content.length}C written`
              : "";
        }
        rt.shell.resumeAfterEditor(message);
      }
      setEditor(null);
    },
    [editor, persist]
  );

  // ---- Tutorial command suggestions --------------------------------------
  useEffect(() => {
    if (commandToExecute && activePaneId) {
      runtimes.current.get(activePaneId)?.shell.setBuffer(commandToExecute);
      clearCommand();
    }
  }, [commandToExecute, activePaneId, clearCommand]);

  // ---- Rendering ----------------------------------------------------------
  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const activeStatus = runtimes.current.get(activePaneId)?.session.getStatus() ?? "";

  const accentCls =
    accent === "cyan"
      ? {
          bar: "bg-cyan-700",
          tag: "bg-cyan-900 text-cyan-100",
          activeBtn: "bg-black text-cyan-300",
          hover: "hover:bg-cyan-600",
          border: "border-cyan-400",
        }
      : {
          bar: "bg-green-700",
          tag: "bg-green-900 text-green-100",
          activeBtn: "bg-black text-green-300",
          hover: "hover:bg-green-600",
          border: "border-green-500",
        };

  const renderNode = (node: PaneNode): React.ReactNode => {
    if (node.kind === "pane") {
      return (
        <PaneView
          key={node.id}
          paneId={node.id}
          active={node.id === activePaneId}
          activeBorder={accentCls.border}
          runtimes={runtimes}
          onFocus={focusPane}
        />
      );
    }
    return (
      <div
        key={node.id}
        className={`flex ${node.dir === "v" ? "flex-row" : "flex-col"} flex-1 min-h-0 min-w-0 gap-[2px]`}
      >
        {renderNode(node.a)}
        {renderNode(node.b)}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-[#0b1020]">
      <div className="flex flex-1 min-h-0 p-[2px] gap-[2px]">
        {activeWindow ? renderNode(activeWindow.root) : null}
      </div>

      {/* Editor overlay */}
      {editor && <EditorOverlay request={editor.req} onClose={closeEditor} />}

      {/* tmux-style status bar */}
      <div className={`flex items-center justify-between px-2 py-[2px] text-xs font-mono ${accentCls.bar} text-black select-none`}>
        <span className="flex gap-2">
          <span className={`${accentCls.tag} px-1 rounded-sm`}>[{label}]</span>
          {windows.map((w, i) => (
            <button
              key={w.id}
              onClick={() => selectWindow(i)}
              className={`px-1 ${w.id === activeWindowId ? accentCls.activeBtn : accentCls.hover}`}
            >
              {i}:bash{w.id === activeWindowId ? "*" : ""}
            </button>
          ))}
        </span>
        <span className="flex gap-3" data-tick={statusTick}>
          <span className="hidden sm:inline">{activeStatus}</span>
          <span>{clock.toString().split(" ")[4]?.slice(0, 5)}</span>
        </span>
      </div>
    </div>
  );
};

// ---- Single pane view -----------------------------------------------------

interface PaneViewProps {
  paneId: string;
  active: boolean;
  activeBorder: string;
  runtimes: React.MutableRefObject<Map<string, PaneRuntime>>;
  onFocus: (id: string) => void;
}

const PaneView: React.FC<PaneViewProps> = ({ paneId, active, activeBorder, runtimes, onFocus }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rt = runtimes.current.get(paneId);
    const el = containerRef.current;
    if (!rt || !el) return;

    if (!rt.term.element) {
      // First mount: attach xterm to this container.
      rt.term.open(el);
      requestAnimationFrame(() => {
        try {
          rt.fit.fit();
        } catch {
          /* element not sized yet */
        }
        if (!rt.started) {
          rt.started = true;
          rt.shell.start();
        }
      });
    } else if (rt.term.element.parentElement !== el) {
      // Re-parented by a layout change: move the existing xterm node instead
      // of re-opening it (xterm can only be opened once).
      el.appendChild(rt.term.element);
      requestAnimationFrame(() => {
        try {
          rt.fit.fit();
        } catch {
          /* ignore */
        }
      });
    }

    const ro = new ResizeObserver(() => {
      try {
        rt.fit.fit();
      } catch {
        /* ignore */
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paneId]);

  return (
    <div
      onMouseDown={() => onFocus(paneId)}
      className={`flex-1 min-h-0 min-w-0 overflow-hidden rounded-sm border ${
        active ? activeBorder : "border-transparent"
      }`}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

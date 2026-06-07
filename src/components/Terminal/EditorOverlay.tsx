import React, { useEffect, useRef, useState, useCallback } from "react";
import { EditorRequest } from "@/lib/repl";

interface EditorOverlayProps {
  request: EditorRequest;
  onClose: (result: { saved: boolean; content: string }) => void;
}

type VimMode = "normal" | "insert" | "command";

/** A pragmatic in-browser vim / nano editor backed by a textarea. */
export const EditorOverlay: React.FC<EditorOverlayProps> = ({ request, onClose }) => {
  const [content, setContent] = useState(request.content);
  const [dirty, setDirty] = useState(false);
  const [mode, setMode] = useState<VimMode>(request.editor === "vim" ? "normal" : "insert");
  const [cmdLine, setCmdLine] = useState("");
  const [status, setStatus] = useState(
    request.editor === "vim"
      ? request.existed
        ? `"${request.path}" ${request.content.split("\n").length}L`
        : `"${request.path}" [New File]`
      : ""
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const lines = content.split("\n").length;
  const chars = content.length;

  const finishSave = useCallback(() => {
    setDirty(false);
    return content;
  }, [content]);

  // ---- nano keybindings ---------------------------------------------------
  const handleNanoKey = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key.toLowerCase() === "o") {
      e.preventDefault();
      finishSave();
      setStatus(`[ Wrote ${lines} lines ]`);
    } else if (e.ctrlKey && e.key.toLowerCase() === "x") {
      e.preventDefault();
      onClose({ saved: !dirty || true, content });
    }
  };

  // ---- vim keybindings ----------------------------------------------------
  const handleVimKey = (e: React.KeyboardEvent) => {
    if (mode === "insert") {
      if (e.key === "Escape") {
        e.preventDefault();
        setMode("normal");
        setStatus("");
      }
      return; // let the textarea handle typing
    }

    if (mode === "command") {
      if (e.key === "Enter") {
        e.preventDefault();
        runVimCommand(cmdLine);
        setCmdLine("");
        setMode("normal");
      } else if (e.key === "Escape") {
        e.preventDefault();
        setCmdLine("");
        setMode("normal");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setCmdLine((c) => c.slice(0, -1));
      } else if (e.key.length === 1) {
        e.preventDefault();
        setCmdLine((c) => c + e.key);
      }
      return;
    }

    // normal mode
    if (e.key === "i") {
      e.preventDefault();
      setMode("insert");
      setStatus("-- INSERT --");
    } else if (e.key === "a") {
      e.preventDefault();
      setMode("insert");
      setStatus("-- INSERT --");
      const ta = textareaRef.current;
      if (ta) ta.selectionStart = ta.selectionEnd = ta.selectionStart + 1;
    } else if (e.key === "o") {
      e.preventDefault();
      insertNewLineBelow();
      setMode("insert");
      setStatus("-- INSERT --");
    } else if (e.key === ":") {
      e.preventDefault();
      setMode("command");
      setCmdLine("");
    } else if (["h", "j", "k", "l", "0", "$", "G", "g", "x", "d", "w", "b"].includes(e.key)) {
      // Let arrows work; block letters from typing into the buffer.
      e.preventDefault();
      if (e.key === "x") deleteCharUnderCursor();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Block stray typing in normal mode.
      e.preventDefault();
    }
  };

  const insertNewLineBelow = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = content.indexOf("\n", ta.selectionStart);
    const at = pos === -1 ? content.length : pos;
    const next = content.slice(0, at) + "\n" + content.slice(at);
    setContent(next);
    setDirty(true);
  };

  const deleteCharUnderCursor = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const i = ta.selectionStart;
    if (i < content.length && content[i] !== "\n") {
      setContent(content.slice(0, i) + content.slice(i + 1));
      setDirty(true);
    }
  };

  const runVimCommand = (cmd: string) => {
    const c = cmd.trim();
    if (c === "w") {
      finishSave();
      setStatus(`"${request.path}" written`);
    } else if (c === "wq" || c === "x") {
      onClose({ saved: true, content });
    } else if (c === "q") {
      if (dirty) setStatus("E37: No write since last change (add ! to override)");
      else onClose({ saved: false, content: request.content });
    } else if (c === "q!") {
      onClose({ saved: false, content: request.content });
    } else {
      setStatus(`E492: Not an editor command: ${c}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (request.editor === "nano") handleNanoKey(e);
    else handleVimKey(e);
  };

  const isVim = request.editor === "vim";

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#0b1020] text-green-200 font-mono text-sm">
      {/* Editor body */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          if (isVim && mode !== "insert") return; // only edit in insert mode
          setContent(e.target.value);
          setDirty(true);
        }}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="flex-1 w-full resize-none bg-transparent outline-none p-3 leading-5 caret-green-300"
        style={{ whiteSpace: "pre", overflowWrap: "normal" }}
      />

      {/* Status / command line */}
      {isVim ? (
        <div className="px-2 py-1 bg-[#0b1020] border-t border-green-900 text-green-300 min-h-[1.5rem]">
          {mode === "command" ? (
            <span>:{cmdLine}</span>
          ) : (
            <span className="flex justify-between">
              <span>{status}</span>
              <span className="text-green-500">
                {lines}L, {chars}C {dirty ? "[+]" : ""}
              </span>
            </span>
          )}
        </div>
      ) : (
        <div className="bg-green-900/30 border-t border-green-800">
          <div className="px-2 py-1 text-green-300 min-h-[1.25rem]">{status}</div>
          <div className="grid grid-cols-2 gap-x-6 px-2 py-1 text-xs bg-[#0b1020]">
            <span>
              <span className="bg-green-200 text-black px-1">^O</span> Write Out
            </span>
            <span>
              <span className="bg-green-200 text-black px-1">^X</span> Exit
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

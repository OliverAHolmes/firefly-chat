import { useState } from 'react';

interface Session {
  id: number;
  title: string;
  created_at: string;
}

interface RenameDialogState {
  open: boolean;
  sessionId: number | null;
  currentTitle: string;
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [renameDialog, setRenameDialog] = useState<RenameDialogState>({
    open: false,
    sessionId: null,
    currentTitle: ""
  });
  const [editTitle, setEditTitle] = useState("");

  const loadSessions = async () => {
    if (window.pywebview?.api) {
      const sessions = await window.pywebview.api.get_sessions();
      setSessions(sessions);
    }
  };

  const createNewSession = async () => {
    if (window.pywebview?.api) {
      await window.pywebview.api.create_new_session();
      loadSessions();
    }
  };

  const loadSession = async (sessionId: number) => {
    if (window.pywebview?.api) {
      const messages = await window.pywebview.api.load_session(sessionId);
      return messages;
    }
  };

  const deleteSession = async (sessionId: number) => {
    if (window.pywebview?.api) {
      await window.pywebview.api.delete_session(sessionId);
      loadSessions();
    }
  };

  const renameSession = async (sessionId: number, newTitle: string) => {
    if (window.pywebview?.api) {
      return await window.pywebview.api.rename_session(sessionId, newTitle);
    }
  };

  return {
    sessions,
    loadSessions,
    createNewSession,
    loadSession,
    deleteSession,
    renameSession,
    renameDialog,
    setRenameDialog,
    editTitle,
    setEditTitle
  };
}; 
import { useRef, useEffect } from "react";

import { Box, List } from "@mui/material";
import { ChatInput } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { SessionsList } from "./components/SessionsList";
import { RenameDialog } from "./components/RenameDialog";
import { useChat } from "./hooks/useChat";
import { useSessions } from "./hooks/useSessions";

function App() {
  const {
    messages,
    userInput,
    setUserInput,
    isLoading,
    sendMessage,
    updateMessages,
  } = useChat();

  const {
    sessions,
    loadSessions,
    createNewSession,
    loadSession,
    deleteSession,
    renameSession,
    renameDialog,
    setRenameDialog,
    editTitle,
    setEditTitle,
  } = useSessions();

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Add handler for loading sessions
  const handleLoadSession = async (sessionId: number) => {
    const messages = await loadSession(sessionId);
    if (messages) {
      updateMessages(messages);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar */}
      <SessionsList
        sessions={sessions}
        onNewChat={createNewSession}
        onLoadSession={handleLoadSession}
        onDeleteSession={deleteSession}
        onRenameSession={(id, title) => {
          setRenameDialog({
            open: true,
            sessionId: id,
            currentTitle: title,
          });
          setEditTitle(title);
        }}
      />

      {/* Main Chat Area */}
      <Box
        sx={{
          flexGrow: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#343541",
          color: "white",
          height: "100vh",
          width: "100%",
        }}
      >
        {/* Chat Messages */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <List
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Input Area */}
        <ChatInput
          value={userInput}
          onChange={setUserInput}
          onSend={sendMessage}
          isLoading={isLoading}
        />
      </Box>

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialog.open}
        title={editTitle}
        onTitleChange={setEditTitle}
        onClose={() => {
          setRenameDialog({
            open: false,
            sessionId: null,
            currentTitle: "",
          });
          setEditTitle("");
        }}
        onSave={async () => {
          if (!editTitle.trim() || !renameDialog.sessionId) return;

          try {
            const result = await renameSession(
              renameDialog.sessionId,
              editTitle.trim()
            );
            if (result?.success) {
              loadSessions();
            }
          } catch (error) {
            console.error("Failed to rename session:", error);
          }

          setRenameDialog({
            open: false,
            sessionId: null,
            currentTitle: "",
          });
          setEditTitle("");
        }}
      />
    </Box>
  );
}

export default App;

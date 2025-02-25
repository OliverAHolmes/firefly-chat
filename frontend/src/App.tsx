import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Box, TextField, Button, 
  List, ListItem, ListItemText, Typography,
  CircularProgress, Drawer, ListItemIcon,
  Divider, IconButton, ListItemButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

function App() {
  // We'll store messages as an array of { role: 'user'|'assistant', content: string }
  const [messages, setMessages] = useState<{role: string; content: string}[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (window.pywebview?.api) {
      const sessions = await window.pywebview.api.get_sessions();
      setSessions(sessions);
    }
  };

  const createNewSession = async () => {
    if (window.pywebview?.api) {
      await window.pywebview.api.create_new_session();
      setMessages([]);
      loadSessions();
    }
  };

  const loadSession = async (sessionId: number) => {
    if (window.pywebview?.api) {
      const messages = await window.pywebview.api.load_session(sessionId);
      setMessages(messages);
    }
  };

  const deleteSession = async (sessionId: number) => {
    if (window.pywebview?.api) {
      await window.pywebview.api.delete_session(sessionId);
      loadSessions();
    }
  };

  // Helper to send a message to Python/OpenAI
  const sendMessage = async () => {
    const trimmed = userInput.trim();
    if (!trimmed || isLoading) return;

    // Add user's message to local state
    const newMessages = [
      ...messages,
      { role: 'user', content: trimmed }
    ];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    // Call Python's chat_with_openai method
    try {
      if (window.pywebview?.api) {
        const assistantReply = await window.pywebview.api.chat_with_openai(trimmed);

        // Add the assistant reply to local state
        const updatedMessages = [
          ...newMessages,
          { role: 'assistant', content: assistantReply }
        ];
        setMessages(updatedMessages);

      } else {
        // In case we're not in pywebview environment
        console.warn('pywebview API not available.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const drawerWidth = 250;

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    }}>
      {/* Left Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#202123',
            color: 'white',
          },
        }}
      >
        {/* New Chat Button */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ 
            color: 'white', 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <img src="/fireflychat.svg" alt="Firefly" style={{ width: 80, height: 80 }} />
            FireflyChat
          </Typography>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<AddIcon />}
            onClick={createNewSession}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            New Chat
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* Menu Items */}
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              sx={{ color: 'white' }}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => deleteSession(session.id)}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => loadSession(session.id)}>
                <ListItemIcon sx={{ color: 'white' }}>
                  <ChatIcon />
                </ListItemIcon>
                <ListItemText 
                  primary={session.title} 
                  secondary={new Date(session.created_at).toLocaleString()}
                  secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Chat Area */}
      <Box sx={{ 
        flexGrow: 2, 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#343541',
        color: 'white',
        height: '100vh',
        width: '100%',
      }}>
        {/* Chat Messages */}
        <Box sx={{ 
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <List sx={{ 
            width: '100%', 
            display: 'flex',
            flexDirection: 'column',
          }}>
            {messages.map((msg, idx) => (
              <ListItem key={idx} sx={{ 
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '8px 16px',
                width: '100%',
              }}>
                <Box sx={{
                  position: 'relative',
                  maxWidth: '80%',
                  width: '100%',
                  bgcolor: msg.role === 'user' ? '#1976d2' : '#444654',
                  color: 'white',
                  borderRadius: msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  p: 2,
                  userSelect: 'text',
                  '&:hover .copy-button': {
                    opacity: 1,
                  },
                  '& *': {
                    userSelect: 'text',
                  },
                  '& pre': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    overflowX: 'auto',
                    userSelect: 'text',
                  },
                  '& code': { // Style inline code
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.875em',
                  },
                  '& a': { // Style links
                    color: '#58a6ff',
                    textDecoration: 'underline',
                  },
                  '& table': { // Style tables
                    borderCollapse: 'collapse',
                    width: '100%',
                    margin: '1rem 0',
                  },
                  '& th, & td': {
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '0.5rem',
                  },
                  '& blockquote': { // Style blockquotes
                    borderLeft: '3px solid rgba(255,255,255,0.2)',
                    margin: '0.5rem 0',
                    paddingLeft: '1rem',
                    fontStyle: 'italic',
                  },
                }}>
                  <Button
                    className="copy-button"
                    onClick={() => copyToClipboard(msg.content)}
                    sx={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      minWidth: '32px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      bgcolor: 'rgba(0,0,0,0.2)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.4)',
                      },
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 16 }} />
                  </Button>

                  {msg.role === 'user' ? (
                    <Typography variant="body1">
                      {msg.content}
                    </Typography>
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Override default elements with Material-UI components
                        p: ({children}) => <Typography variant="body1" gutterBottom>{children}</Typography>,
                        h1: ({children}) => <Typography variant="h4" gutterBottom>{children}</Typography>,
                        h2: ({children}) => <Typography variant="h5" gutterBottom>{children}</Typography>,
                        h3: ({children}) => <Typography variant="h6" gutterBottom>{children}</Typography>,
                        li: ({children}) => <Typography component="li" style={{marginLeft: '1rem'}}>{children}</Typography>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                  <Typography variant="caption" sx={{ 
                    display: 'block',
                    mt: 0.5,
                    color: 'rgba(255,255,255,0.7)'
                  }}>
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </Typography>
                </Box>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* Input Area */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          bgcolor: '#343541'
        }}>
          <Box sx={{ 
            position: 'relative',
            maxWidth: '90%',
            width: '100%',
            mx: 'auto'
          }}>
            <TextField 
              fullWidth
              multiline
              maxRows={4}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#40414f',
                  borderRadius: '24px',
                  pr: '60px',
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                }
              }}
              placeholder="Type your message..."
            />
            <Button 
              variant="contained" 
              onClick={sendMessage}
              disabled={isLoading || !userInput.trim()}
              sx={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: '40px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                bgcolor: '#19c37d',
                '&:hover': {
                  bgcolor: '#1a8870',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default App;

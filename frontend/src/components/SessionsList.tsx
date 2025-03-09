import { 
  Box, Button, Typography, List, ListItem, 
  ListItemButton, ListItemIcon, ListItemText,
  IconButton, Drawer
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

interface Session {
  id: number;
  title: string;
  created_at: string;
}

interface SessionsListProps {
  sessions: Session[];
  onNewChat: () => void;
  onLoadSession: (id: number) => void;
  onDeleteSession: (id: number) => void;
  onRenameSession: (id: number, title: string) => void;
}

export const SessionsList: React.FC<SessionsListProps> = ({
  sessions,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  onRenameSession
}) => {
  const drawerWidth = 250;

  return (
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
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Fixed Header Section */}
      <Box sx={{ 
        p: 2,
        borderBottom: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      }}>
        <Typography variant="h6" sx={{ 
          color: 'white', 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <img 
            src="/fireflychat.svg" 
            alt="Firefly" 
            style={{ 
              width: 80, 
              height: 80,
              marginRight: 8 
            }} 
          />
          FireflyChat
        </Typography>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onNewChat}
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

      {/* Scrollable Sessions List */}
      <Box sx={{ 
        flexGrow: 1,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: 'rgba(255,255,255,0.2)',
        },
      }}>
        <List>
          {sessions.map((session) => (
            <ListItem
              key={session.id}
              sx={{ color: 'white' }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    edge="end"
                    onClick={() => onRenameSession(session.id, session.title)}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => onDeleteSession(session.id)}
                    sx={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemButton onClick={() => onLoadSession(session.id)}>
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
      </Box>
    </Drawer>
  );
}; 
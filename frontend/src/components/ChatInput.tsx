import { Box, TextField, Button, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading
}) => {
  return (
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
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
          onClick={onSend}
          disabled={isLoading || !value.trim()}
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
  );
}; 
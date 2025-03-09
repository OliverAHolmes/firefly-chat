import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField
} from '@mui/material';

interface RenameDialogProps {
  open: boolean;
  title: string;
  onTitleChange: (newTitle: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const RenameDialog: React.FC<RenameDialogProps> = ({
  open,
  title,
  onTitleChange,
  onClose,
  onSave
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#2A2B32',
          color: 'white',
        }
      }}
    >
      <DialogTitle>Rename Chat Session</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
          Enter a new name for this chat session.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSave();
            }
          }}
          sx={{
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255,255,255,0.7)',
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              color: 'white',
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave}
          variant="contained"
          disabled={!title.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 
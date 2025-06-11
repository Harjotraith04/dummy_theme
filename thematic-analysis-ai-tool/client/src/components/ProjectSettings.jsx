import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteIcon from '@mui/icons-material/Delete';

const ProjectSettings = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for collaborators - using local state only
  const fetchCollaborators = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      // Example dummy data
      const dummyCollaborators = [
        { email: 'collaborator1@example.com' },
        { email: 'collaborator2@example.com' }
      ];
      setCollaborators(dummyCollaborators);
      setLoading(false);
    }, 500);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchCollaborators();
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
    setSuccess('');
    setCollaboratorEmail('');
  };

  const handleAddCollaborator = () => {
    setError('');
    setSuccess('');
    
    if (!collaboratorEmail) {
      setError('Please enter an email address');
      return;
    }

    // Just update the UI directly
    setCollaborators([...collaborators, { email: collaboratorEmail }]);
    
    setSuccess('Collaborator added successfully');
    setCollaboratorEmail('');
  };

  const handleRemoveCollaborator = async (email) => {
    try {
      setError('');
      setSuccess('');

      // Remove the collaborator from local state for frontend-only development
      setCollaborators(collaborators.filter(collaborator => collaborator.email !== email));
      
      setSuccess('Collaborator removed successfully');
    } catch (error) {
      setError('Failed to remove collaborator');
      console.error('Error removing collaborator:', error);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
        }}
      >
        <SettingsIcon />
      </IconButton>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Project Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Collaborators
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Collaborator Email"
                value={collaboratorEmail}
                onChange={(e) => setCollaboratorEmail(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleAddCollaborator}
                sx={{ minWidth: 100 }}
              >
                Add
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {collaborators.map((collaborator) => (
                  <ListItem key={collaborator.email}>
                    <ListItemText primary={collaborator.email} />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveCollaborator(collaborator.email)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {collaborators.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No collaborators yet" />
                  </ListItem>
                )}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProjectSettings; 
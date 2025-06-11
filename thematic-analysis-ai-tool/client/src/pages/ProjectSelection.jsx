import React, { useState, useCallback, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';

function ProjectSelection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      
      // Mock data for UI design
      setTimeout(() => {
        const mockProjects = [
          { id: '1', title: 'Project 1', description: 'Research on Topic 1' },
          { id: '2', title: 'Project 2', description: 'Analysis of Data Set 2' }
        ];
        setProjects(mockProjects);
        setError(null);
        setLoading(false);
      }, 800); // Simulate loading delay
      
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch projects.');
      setProjects([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [navigate]);

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleCreateProject = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setNewProjectName('');
    setCreatingProject(false);
  };

  const handleNewProjectNameChange = (event) => {
    setNewProjectName(event.target.value);
  };

  const handleSaveNewProject = async () => {
    if (!newProjectName.trim()) {
      alert('Project name cannot be empty.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }      setCreatingProject(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add new project to local state
      setProjects(prev => [
        ...prev,
        {
          id: `project-${Date.now()}`,
          title: newProjectName,
          description: ''
        }
      ]);

      console.log('Project created successfully');
      handleCloseCreateDialog();

    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project.');
      alert(`Failed to create project: ${err.response?.data?.detail || err.message}`);
    } finally {
      setCreatingProject(false);
    }
  };

  const handleStartAnalysisClick = (projectId) => {
    console.log('Start Analysis clicked for project:', projectId);
    navigate(`/dashboard/${projectId}`);
  };
  const handleDeleteProjectClick = async (projectId) => {
    console.log('Delete clicked for project:', projectId);
    const confirmDelete = window.confirm('Are you sure you want to delete this project?');
    if (!confirmDelete) {
      return;
    }    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Just remove from local state
      setProjects(prev => prev.filter(project => project.id !== projectId));
      console.log('Project deleted successfully:', projectId);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project.');
      alert('An error occurred while trying to delete the project.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light} 100%)`,
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: 0.5,
        },
      }}
    >
      <Container maxWidth="lg">
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Box>
            <Fade in={true} style={{ transitionDelay: '200ms' }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 4,
                }}
              >
                Project Selection
              </Typography>
            </Fade>

            <Fade in={true} style={{ transitionDelay: '300ms' }}>
              <Box
                sx={{
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="project-select-label">Select Project</InputLabel>
                  <Select
                    labelId="project-select-label"
                    id="project-select"
                    value={selectedProject}
                    label="Select Project"
                    onChange={handleProjectChange}
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(0,0,0,0.1)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  onClick={handleCreateProject}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    },
                  }}
                >
                  Create New Project
                </Button>
              </Box>
            </Fade>

            <Fade in={true} style={{ transitionDelay: '400ms' }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  mt: 4,
                  mb: 3,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                }}
              >
                Your Projects
              </Typography>
            </Fade>

            {loading ? (
              <Fade in={true}>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight="200px"
                >
                  <CircularProgress />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading projects...
                  </Typography>
                </Box>
              </Fade>
            ) : error ? (
              <Fade in={true}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: theme.palette.error.main,
                    },
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            ) : (
              <Fade in={true} style={{ transitionDelay: '500ms' }}>
                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Project</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projects.length > 0 ? (
                        projects.map((project) => (
                          <TableRow
                            key={project.id}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                              },
                            }}
                          >
                            <TableCell component="th" scope="row">
                              {project.title}
                            </TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell align="right">
                              <Tooltip title="Start Analysis">
                                <IconButton
                                  onClick={() => handleStartAnalysisClick(project.id)}
                                  sx={{
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                    },
                                  }}
                                >
                                  <PlayArrowIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Project">
                                <IconButton
                                  onClick={() => handleDeleteProjectClick(project.id)}
                                  sx={{
                                    color: theme.palette.error.main,
                                    '&:hover': {
                                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary">
                              No projects found. Create a new project to get started.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Fade>
            )}
          </Box>
        </Zoom>
      </Container>

      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Project Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newProjectName}
            onChange={handleNewProjectNameChange}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleCloseCreateDialog}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              color: theme.palette.text.secondary,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveNewProject}
            variant="contained"
            disabled={creatingProject}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              },
            }}
          >
            {creatingProject ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectSelection;
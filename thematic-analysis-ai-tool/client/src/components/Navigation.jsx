import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Typography,
  useTheme,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
  Fade,
  Slide,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel
} from '@mui/material';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ProfileButton from './ProfileButton';
import { ThemeModeContext } from '../App';

function Navigation({ activeMenuItem, handleMenuItemClick, selectedFiles, documents = [], activeFile, setActiveFile, handleRemoveFile, onDocumentSelect }) {
  const theme = useTheme();
  const { toggleColorMode, mode } = useContext(ThemeModeContext);
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [documentsExpanded, setDocumentsExpanded] = useState(true);

  const menuItems = [
    {
      name: 'Documents',
      icon: <DescriptionOutlinedIcon />,
      description: 'Manage research documents',
      hasChildren: true
    },
    {
      name: 'Research details',
      icon: <ScienceOutlinedIcon />,
      description: 'Configure research parameters'
    },
    {
      name: 'Comments',
      icon: <CommentOutlinedIcon />,
      description: 'View document annotations'
    },
    {
      name: 'Codebook',
      icon: <BookOutlinedIcon />,
      description: 'Organize research codes'
    },
    {
      name: 'Visualizations',
      icon: <BarChartOutlinedIcon />,
      description: 'Explore thematic analysis visualizations'
    }
  ];
  return (
    <Slide direction="right" in={true} mountOnEnter unmountOnExit>
      <Box
        sx={{
          width: isExpanded ? 280 : 80,
          bgcolor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
          boxShadow: mode === 'dark' ? '2px 0 8px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.05)',
          height: '100vh',
        }}
      >
        {/* Toggle Button */}        <IconButton
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            position: 'absolute',
            right: -12,
            top: 20,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              bgcolor: theme.palette.action.hover,
            },
            zIndex: 1,
            transition: 'all 0.2s ease-in-out',
            boxShadow: mode === 'dark' ? '0 0 5px rgba(255,255,255,0.1)' : '0 0 5px rgba(0,0,0,0.1)',
          }}
        >
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>

        {/* Logo */}
        <Fade in={isExpanded} timeout={300}>
          <Typography 
            variant="h5" 
            sx={{ 
              p: 2, 
              color: theme.palette.primary.main,
              fontWeight: 600,
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Thematic Analysis
          </Typography>
        </Fade>

        <Divider sx={{ mb: 2 }} />
          {/* Theme Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: isExpanded ? 'flex-start' : 'center' }}>
          <Tooltip title={isExpanded ? '' : (theme.palette.mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode')}>
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ mr: isExpanded ? 1 : 0 }}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          {isExpanded && (
            <Fade in={isExpanded}>
              <Typography variant="body2" color="textSecondary">
                {theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </Typography>
            </Fade>
          )}
        </Box>        {/* Menu Items */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.name}>
              <Tooltip 
                title={!isExpanded ? item.name : ''}
                placement="right"
              >
                <Button
                  variant={activeMenuItem === item.name ? 'contained' : 'text'}
                  onClick={() => {
                    handleMenuItemClick(item.name);
                    if (item.hasChildren) {
                      setDocumentsExpanded(!documentsExpanded);
                    }
                  }}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    p: 2,
                    borderRadius: 2,
                    gap: 2,
                    color: activeMenuItem === item.name ? 'white' : theme.palette.text.primary,
                    bgcolor: activeMenuItem === item.name ? theme.palette.primary.main : 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    transform: hoveredItem === item.name ? 'translateX(4px)' : 'none',
                    '&:hover': {
                      bgcolor: activeMenuItem === item.name 
                        ? theme.palette.primary.dark 
                        : theme.palette.action.hover,
                    },
                    position: 'relative',
                    overflow: 'hidden',
                    '&:after': activeMenuItem === item.name ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: '4px',
                      bgcolor: theme.palette.primary.dark,
                    } : {},
                  }}
                >
                  {item.icon}
                  <Collapse in={isExpanded} orientation="horizontal">
                    <Box sx={{ textAlign: 'left', minWidth: 0, display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight={500} noWrap>
                          {item.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            color: activeMenuItem === item.name 
                              ? 'rgba(255, 255, 255, 0.8)' 
                              : theme.palette.text.secondary
                          }}
                          noWrap
                        >
                          {item.description}
                        </Typography>
                      </Box>
                      {item.hasChildren && isExpanded && (
                        documentsExpanded ? 
                        <ExpandLessIcon fontSize="small" sx={{ ml: 1 }} /> : 
                        <ExpandMoreIcon fontSize="small" sx={{ ml: 1 }} />
                      )}
                    </Box>
                  </Collapse>
                </Button>
              </Tooltip>
                {/* Dropdown for Documents */}
              {item.name === 'Documents' && documentsExpanded && activeMenuItem === 'Documents' && (
                <Collapse in={documentsExpanded && isExpanded} timeout="auto" unmountOnExit>
                  <Box 
                    sx={{ 
                      ml: 2,
                      mr: 1,
                      mt: 1.5, 
                      mb: 2, 
                      borderRadius: 2,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: theme.palette.background.paper,
                      transition: 'all 0.2s ease'
                    }}
                  >                    {/* Upload Button with enhanced styling */}                    <input
                      id="navigation-file-input"
                      type="file"
                      multiple
                      onChange={(e) => {
                        // This handles uploading files directly from the navigation
                        const files = Array.from(e.target.files);
                        if (files && files.length > 0 && handleMenuItemClick) {
                          // Navigate to Documents page first
                          handleMenuItemClick('Documents');
                          
                          // Create a small delay to ensure we're on the Documents page
                          setTimeout(() => {
                            // Call the bulk upload function directly with our files
                            const fileInput = document.getElementById('file-input');
                            if (fileInput) {
                              // Transfer files to the main file input
                              const dataTransfer = new DataTransfer();
                              files.forEach(file => dataTransfer.items.add(file));
                              fileInput.files = dataTransfer.files;
                              
                              // Create and dispatch custom event for bulk upload
                              const bulkUploadEvent = new CustomEvent('bulkUpload', { 
                                detail: { files },
                                bubbles: true 
                              });
                              document.dispatchEvent(bulkUploadEvent);
                              
                              // Also trigger change event on the file input as backup
                              const changeEvent = new Event('change', { bubbles: true });
                              fileInput.dispatchEvent(changeEvent);
                            }
                          }, 100);
                        }
                        // Reset the input value to allow selecting the same file again
                        e.target.value = '';
                      }}
                      style={{ display: 'none' }}
                      accept=".txt,.pdf,.csv,.xlsx,.xls"
                    />
                    <ListItem 
                      button 
                      component="label"
                      htmlFor="navigation-file-input"
                      sx={{ 
                        py: 1.5,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.primary.lighter,
                        '&:hover': {
                          bgcolor: theme.palette.primary.light,
                          '& .MuiSvgIcon-root': {
                            transform: 'scale(1.1)',
                            color: theme.palette.primary.dark
                          }
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 36, 
                        display: 'flex',
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': {
                          transition: 'all 0.2s',
                        },
                      }}>
                        <UploadFileIcon fontSize="small" sx={{ color: theme.palette.primary.dark }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Upload files"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          color: theme.palette.primary.dark
                        }}
                      />
                    </ListItem>

                    {/* Document list with scroll container */}
                    <Box sx={{ 
                      maxHeight: '250px', 
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: theme.palette.grey[100],
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: theme.palette.grey[300],
                        borderRadius: 2,
                      }
                    }}>                      {/* Header for the document list */}
                      {([...selectedFiles, ...documents].length > 0) && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            px: 2, 
                            pt: 1.5, 
                            pb: 1, 
                            color: theme.palette.text.secondary,
                            letterSpacing: '0.75px',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            fontWeight: 500
                          }}
                        >
                          RESEARCH DOCUMENTS
                        </Typography>
                      )}
                        {/* Uploaded Documents with enhanced styling */}
                      {[...selectedFiles, ...documents].length > 0 ? [...selectedFiles, ...documents].map((file, index) => {
                        const fileName = file.name || file.filename || file.title;
                        const fileExtension = fileName.split('.').pop().toLowerCase();
                        
                        // Determine file type badge color and background
                        const getFileTypeStyle = () => {
                          if (fileExtension === 'csv') {
                            return {
                              color: '#fff',
                              bg: '#28a745',
                              icon: <TableChartIcon fontSize="small" sx={{ color: '#2E7D32' }} />
                            };
                          } else if (fileExtension === 'pdf') {
                            return {
                              color: '#fff',
                              bg: '#dc3545',
                              icon: <PictureAsPdfIcon fontSize="small" sx={{ color: '#C62828' }} />
                            };
                          } else if (['xlsx', 'xls'].includes(fileExtension)) {
                            return {
                              color: '#fff',
                              bg: '#28a745',
                              icon: <TableChartIcon fontSize="small" sx={{ color: '#2E7D32' }} />
                            };
                          } else if (fileExtension === 'txt') {
                            return {
                              color: '#fff',
                              bg: '#17a2b8',
                              icon: <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: '#0277BD' }} />
                            };
                          } else if (fileExtension === 'docx') {
                            return {
                              color: '#fff',
                              bg: '#0d6efd',
                              icon: <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: '#0D47A1' }} />
                            };
                          } else {
                            return {
                              color: '#fff',
                              bg: '#6c757d',
                              icon: <InsertDriveFileOutlinedIcon fontSize="small" sx={{ color: '#546E7A' }} />
                            };
                          }
                        };
                        
                        const fileStyle = getFileTypeStyle();
                        
                        // Add current date for display
                        const currentDate = '6/12/2025'; // Using fixed date for consistency with screenshot
                        
                        // Get file name without extension for cleaner display
                        const fileNameWithoutExtension = fileName.replace(`.${fileExtension}`, '');
                        
                        return (
                          <ListItem 
                            key={file.id || fileName}
                            button 
                            selected={activeFile === fileName}                            onClick={() => {
                              if (setActiveFile) {
                                setActiveFile(fileName);
                                // If this is a document from the server (has an id), trigger document fetch
                                if (file.id && onDocumentSelect) {
                                  // First check if this is a File object or our document object
                                  if (file instanceof File) {
                                    // It's a direct file object - we need to find the corresponding document
                                    const matchingDoc = documents.find(
                                      d => d.filename === file.name || d.title === file.name
                                    );
                                    if (matchingDoc) {
                                      // Found the document, pass both the document ID and the file object
                                      onDocumentSelect(matchingDoc.id, file);
                                    } else {
                                      // No matching document found, just pass the file
                                      console.warn('No matching document found for file:', file.name);
                                      onDocumentSelect(null, file);
                                    }
                                  } else {
                                    // Pass along the file object if it exists, to ensure proper parsing
                                    // This handles both regular documents and those with file objects
                                    const fileObj = file.fileObject || file._file || file;
                                    onDocumentSelect(file.id, fileObj);
                                  }
                                }
                                // Ensure we're on Documents page
                                handleMenuItemClick('Documents');
                              }
                            }}
                            sx={{ 
                              borderRadius: 0,
                              py: 0.75,
                              position: 'relative',
                              transition: 'all 0.15s ease-in-out',
                              borderLeft: activeFile === fileName ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                              bgcolor: activeFile === fileName ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                              '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.04)',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ 
                              minWidth: 40, 
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                              {fileStyle.icon}
                            </ListItemIcon>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: 'column',
                              flexGrow: 1,
                              overflow: 'hidden',
                              pr: 1
                            }}>
                              <Typography 
                                sx={{ 
                                  fontSize: '0.875rem',
                                  lineHeight: '1.2',
                                  fontWeight: 500,
                                  color: 'text.primary',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {fileNameWithoutExtension}
                              </Typography>
                              <Typography 
                                sx={{ 
                                  fontSize: '0.75rem',
                                  color: 'text.secondary'
                                }}
                              >
                                {currentDate}
                              </Typography>
                            </Box>
                            {/* File type badge */}
                            <Box 
                              sx={{ 
                                minWidth: 36,
                                height: 20,
                                borderRadius: 10,
                                backgroundColor: fileStyle.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                ml: 0.5
                              }}
                            >
                              <Typography 
                                sx={{ 
                                  fontSize: '0.65rem', 
                                  color: fileStyle.color,
                                  fontWeight: 'bold',
                                  lineHeight: 1,
                                  textTransform: 'uppercase',
                                  px: 0.8
                                }}
                              >
                                {fileExtension}
                              </Typography>
                            </Box>
                          </ListItem>
                        );                      }) : (
                        <Box sx={{ 
                          p: 2.5, 
                          textAlign: 'center',
                          bgcolor: 'transparent'
                        }}>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '0.95rem', 
                              fontStyle: 'italic',
                              color: 'text.disabled'
                            }}
                          >
                            No documents yet
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Collapse>
              )}
            </React.Fragment>
          ))}
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Profile Button at Bottom */}
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
          <ProfileButton sidebarMode={!isExpanded} />
        </Box>

        {/* Footer */}
        <Fade in={isExpanded} timeout={300}>
          <Typography 
            variant="caption" 
            sx={{ 
              p: 2, 
              color: theme.palette.text.secondary,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            © 2024 Thematic Analysis Tool
          </Typography>
        </Fade>
      </Box>
    </Slide>
  );
}

export default Navigation; 
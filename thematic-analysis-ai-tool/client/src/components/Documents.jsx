import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Link,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Stack,
  Modal,
  TextField,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  CircularProgress,
  Chip,
  useTheme,
  Tooltip,
  Alert,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  alpha
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TableChartIcon from '@mui/icons-material/TableChart';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
import SaveIcon from '@mui/icons-material/Save';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import UploadFileIcon from '@mui/icons-material/UploadFile'; // Added for upload button
import { styled } from '@mui/system';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';
// No API imports - pure frontend implementation
// Initialize PDF.js worker - required for PDF processing
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

// Custom theme augmentation
const customTheme = {
  primary: {
    lighter: '#E3F2FD',
    light: '#90CAF9',
    main: '#2196F3',
    dark: '#1976D2',
  }
};

const DropzoneArea = styled(Box)(({ theme, isdragging }) => ({
  border: '2px dashed',
  borderColor: isdragging === 'true' ? theme.palette.primary.main : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(6),
  textAlign: 'center',
  cursor: 'pointer',
  backgroundColor: isdragging === 'true' ? customTheme.primary.lighter : theme.palette.grey[50],
  transition: 'all 0.3s ease',
  width: '100%',
  minHeight: 200,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(2),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: customTheme.primary.lighter,
  },
}));

const FileTypeIcon = ({ fileType }) => {
  const theme = useTheme();
  const iconProps = { sx: { fontSize: 40, color: theme.palette.primary.main } };
  
  switch(fileType) {
    case 'pdf':
      return <PictureAsPdfIcon {...iconProps} />;
    case 'csv':
    case 'xlsx':
    case 'xls':
      return <TableChartIcon {...iconProps} />;
    default:
      return <ArticleIcon {...iconProps} />;
  }
};

// No need for BACKEND_URL with mock API
// const BACKEND_URL = 'http://localhost:8000';

function Documents({ 
  projectId, 
  setCodesModalOpen, 
  selection, 
  setSelection, 
  bubbleAnchor, 
  setBubbleAnchor,
  handleBubbleCodesClick,
  setPendingCodeSelection,
  commentData,
  setCommentData,
  codeAssignments,
  setCodeAssignments,
  documents = [],
  setDocuments, // Parent component's documents state setter
  refreshSidebar // New prop to trigger sidebar refresh when documents change
}) {
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileData, setFileData] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [documentText, setDocumentText] = useState('');
  const [annotations, setAnnotations] = useState([]);
  const [showBubble, setShowBubble] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [tempSelection, setTempSelection] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [currentDocument, setCurrentDocument] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [processingFile, setProcessingFile] = useState(false);
  const [analysisAnchor, setAnalysisAnchor] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false); // Track upload success state

  useEffect(() => {
    // No sample documents - only display documents provided by parent or uploaded
    if (projectId && documents.length === 0) {
      // Empty initial state - wait for user uploads
      // No sample documents
    }
  }, [projectId]);

  // For UI design only - no actual API calls
  const fetchProjectDocuments = () => {
    console.log("UI only - no API calls needed");
  };

  // Clear documentText when activeFile changes
  useEffect(() => {
    setDocumentText('');
    if (activeFile && fileData[activeFile] && fileData[activeFile].tabularData === undefined) {
      // If it's a text file, process it to set documentText
      const file = selectedFiles.find(f => f.name === activeFile);
      if (file && file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => setDocumentText(e.target.result);
        reader.readAsText(file);
      }
    }
  }, [activeFile]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files && files.length > 0) {
      handleNewFiles(files);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files);
    if (files && files.length > 0) {
      handleNewFiles(files);
    }
  };

  const handleNewFiles = (files) => {
    const newFiles = [...selectedFiles];
    const newFileData = { ...fileData };
    
    files.forEach(file => {
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        newFiles.push(file);
        newFileData[file.name] = { tabularData: null, error: null };
        processFile(file);
      }
    });
    
    setSelectedFiles(newFiles);
    setFileData(newFileData);
    if (newFiles.length > 0 && !activeFile) {
      setActiveFile(newFiles[0].name);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file) => {
    setProcessingFile(true);
    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop().toLowerCase();

    reader.onload = async (e) => {
      try {
        let tabularData = null;
        let error = null;

        if (fileExtension === 'csv') {
          const text = e.target.result;
          const rows = text
            .split(/\r?\n/)
            .filter(row => row.trim() !== '')
            .map(row => {
              const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
              return matches.map(field => field.replace(/^"|"$/g, ''));
            });
          
          if (rows.length > 0) {
            tabularData = rows;
          } else {
            throw new Error('No valid data found in CSV file');
          }
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (rows.length > 0) {
            tabularData = rows;
          } else {
            throw new Error('No valid data found in Excel file');
          }
        } else if (fileExtension === 'pdf') {
          try {
            const arrayBuffer = e.target.result;
            const pdf = await getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const textContent = [];
            
            for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map(item => item.str).join(' ');
              textContent.push([`Page ${i}`, pageText]);
            }
            
            tabularData = textContent;
          } catch (pdfError) {
            throw new Error(`Error processing PDF: ${pdfError.message}`);
          }
        } else if (['txt'].includes(fileExtension)) {
          const text = e.target.result;
          setDocumentText(text);
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          tabularData = lines.map((line, index) => [index + 1, line]);
        } else {
          error = 'Unsupported file type. Please upload a CSV, Excel, PDF, or text file.';
        }

        setFileData(prev => ({
          ...prev,
          [file.name]: { tabularData, error }
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        setFileData(prev => ({
          ...prev,
          [file.name]: { tabularData: null, error: error.message }
        }));
      } finally {
        setProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setFileData(prev => ({
        ...prev,
        [file.name]: { tabularData: null, error: 'Error reading file' }
      }));
      setProcessingFile(false);
    };

    if (['csv', 'txt'].includes(fileExtension)) {
      reader.readAsText(file);
    } else if (['xlsx', 'xls', 'pdf'].includes(fileExtension)) {
      reader.readAsArrayBuffer(file);
    } else {
      setFileData(prev => ({
        ...prev,
        [file.name]: { tabularData: null, error: 'Unsupported file type' }
      }));
      setProcessingFile(false);
    }
  };

  const handleRemoveFile = (fileName, event) => {
    event.stopPropagation();
    setSelectedFiles(prev => prev.filter(f => f.name !== fileName));
    setFileData(prev => {
      const newData = { ...prev };
      delete newData[fileName];
      return newData;
    });
    if (activeFile === fileName) {
      const remainingFiles = selectedFiles.filter(f => f.name !== fileName);
      setActiveFile(remainingFiles.length > 0 ? remainingFiles[0].name : null);
    }
  };

  const handleRemoveColumn = (columnIndex) => {
    if (!activeFile) return;
    
    setFileData(prev => {
      const currentData = prev[activeFile].tabularData;
      if (!currentData) return prev;
      
      const newData = currentData.map(row => row.filter((_, index) => index !== columnIndex));
      
      return {
        ...prev,
        [activeFile]: {
          ...prev[activeFile],
          tabularData: newData
        }
      };
    });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const selectionData = {
        text: text,
        documentName: activeFile,
        context: documentText.substring(
          Math.max(0, range.startOffset - 50),
          Math.min(documentText.length, range.endOffset + 50)
        )
      };
      
      setSelection(selectionData);
      setBubbleAnchor({ x: rect.left, y: rect.bottom });
      setShowBubble(true);
    } else {
      setShowBubble(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    
    // Add listener for custom bulkUpload event from the Navigation component
    const handleBulkUploadEvent = (event) => {
      if (event.detail && event.detail.files) {
        handleBulkUpload({ target: { files: event.detail.files } });
      }
    };
    document.addEventListener('bulkUpload', handleBulkUploadEvent);
    
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('bulkUpload', handleBulkUploadEvent);
    };
  }, []);

  const handleCommentClick = () => {
    if (selection && selection.text) {
      setTempSelection(selection);
      setCommentModalOpen(true);
      setShowBubble(false);
    } else {
      alert('Please select some text first to add a comment');
    }
  };

  const handleCommentSubmit = async () => {
    if (!selection?.text || !newComment.trim()) {
      console.error('No selection or empty comment');
      return;
    }
    
    try {
      const newCommentEntry = {
        id: Date.now(),
        documentName: activeFile,
        selectedText: selection.text,
        comment: newComment,
        timestamp: new Date().toLocaleString(),
        context: selection.context
      };
      
      setCommentData(prev => [...prev, newCommentEntry]);
      setCommentModalOpen(false);
      setNewComment('');
      
    } catch (error) {
      console.error('Failed to save comment:', error);
    }
  };

  const renderAnnotatedText = () => {
    if (!documentText) return null;
    if (annotations.length === 0) return <span>{documentText}</span>;
    let elements = [];
    let lastIndex = 0;
    annotations.sort((a, b) => a.start - b.start).forEach((ann, idx) => {
      if (ann.start > lastIndex) {
        elements.push(<span key={lastIndex}>{documentText.slice(lastIndex, ann.start)}</span>);
      }
      elements.push(
        <span key={ann.start} style={{ background: 'yellow', cursor: 'pointer' }} title={ann.comment}>
          {documentText.slice(ann.start, ann.end)}
        </span>
      );
      lastIndex = ann.end;
    });
    if (lastIndex < documentText.length) {
      elements.push(<span key={lastIndex}>{documentText.slice(lastIndex)}</span>);
    }
    return elements;
  };

  const handleBulkUpload = async (event) => {
    setUploading(true);
    setUploadError('');
    try {
      const files = event.target.files;
      if (!files || files.length === 0) {
        setUploadError('No files selected');
        setUploading(false);
        return;
      }
      if (!projectId) {
        setUploadError('No project selected');
        setUploading(false);
        return;
      }
      
      // Mock document upload process
      // In a frontend-only app, we'll create mock document objects
      // and add them to our documents state
      
      // Give a small delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create mock documents from the files
      const newDocuments = Array.from(files).map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        project_id: projectId,
        title: file.name,
        filename: file.name,
        content: `Mock content for ${file.name}`,
        created_at: new Date().toISOString()
      }));
      
      // Add these to our existing documents
      const updatedDocuments = [...documents, ...newDocuments];
      setDocuments(updatedDocuments);
      
      // Also update parent component's state if the setter is provided
      if (typeof setDocuments === 'function') {
        setDocuments(updatedDocuments);
      }
      
      // Call handleNewFiles to also add them to selectedFiles
      handleNewFiles(Array.from(files));
      
      // Refresh sidebar if needed
      if (refreshSidebar) {
        refreshSidebar();
      }
      
      // Process PDF files to extract text (still works on frontend)
      Array.from(files).forEach(file => {
        if (file.type === 'application/pdf') {
          processFile(file);
        }
      });
      
    } catch (err) {
      setUploadError('Failed to upload files');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const fetchDocument = async (documentId) => {
    try {
      // Find the document in our local state
      const document = documents.find(doc => doc.id === documentId);
      setCurrentDocument(document || null);
    } catch (err) {
      console.error("Error fetching document:", err);
      setCurrentDocument(null);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    setDeleteError('');
    try {
      // Just remove from local state
      const filteredDocs = documents.filter(doc => doc.id !== documentId);
      setDocuments(filteredDocs);
      
      // Also update parent component's documents state if provided
      if (setDocuments) {
        setDocuments(filteredDocs);
      }
      
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentDocument(null);
      }
      
      // Refresh sidebar if needed
      if (refreshSidebar) {
        refreshSidebar();
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setDeleteError('Failed to delete document');
    }
  };

  const handleAnalysisClick = (event) => {
    setAnalysisAnchor(event.currentTarget);
  };

  const handleAnalysisClose = () => {
    setAnalysisAnchor(null);
  };

  const handleAnalysisOption = (option) => {
    handleAnalysisClose();
    // Handle different analysis options
    switch(option) {
      case 'thematic':
        console.log('Loading thematic analysis...');
        break;
      case 'cross-segment':
        console.log('Loading cross segment analysis...');
        break;
      case 'objectives':
        console.log('Loading research objectives...');
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', gap: 3, position: 'relative' }}>
      {/* Left Sidebar - File List */}
      <Paper
        elevation={0}
        sx={{
          width: 300,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#fff',
        }}
      >
        <Typography variant="h6" sx={{ px: 1 }}>Files</Typography>
        
        <DropzoneArea
          isdragging={isDragging.toString()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".txt,.pdf,.csv,.xlsx,.xls"
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
          <Typography variant="body1" color="textSecondary">
            Drag & drop files here or click to browse
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supported formats: TXT, PDF, CSV, XLSX
          </Typography>
        </DropzoneArea>

        {fileError && (
          <Alert severity="error" onClose={() => setFileError(null)}>
            {fileError}
          </Alert>
        )}

        {/* Upload button that appears when files are selected */}
        {selectedFiles.length > 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            disabled={uploading || !projectId}
            onClick={async () => {
              if (!projectId) {
                alert('Please select a project first');
                return;
              }

              try {
                setUploading(true);
                setUploadError('');

                // Mock document upload process
                // In a frontend-only app, we'll create mock document objects
                // and add them to our documents state
                
                // Give a small delay to simulate network latency
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Create mock documents from the selectedFiles
                const newDocuments = Array.from(selectedFiles).map((file, index) => ({
                  id: `doc-${Date.now()}-${index}`,
                  project_id: projectId,
                  title: file.name,
                  filename: file.name,
                  content: `Mock content for ${file.name}`,
                  created_at: new Date().toISOString()
                }));
                
                // Add these to our existing documents
                setDocuments(prev => [...prev, ...newDocuments]);
                
                alert(`Successfully uploaded ${selectedFiles.length} documents`);
                setUploadSuccess(true);
                
                // Clear selected files after successful upload
                setSelectedFiles([]);
                setFileData({});
                setActiveFile(null);
                
                // Refresh sidebar if needed
                if (refreshSidebar) refreshSidebar();
              } catch (error) {
                console.error('Error uploading documents:', error);
                const errorMessage = error.response?.data?.detail || 
                  error.message || 'Failed to upload documents';
                setUploadError(errorMessage);
                alert(`Error: ${errorMessage}`);
              } finally {
                setUploading(false);
              }
            }}
            sx={{ 
              mt: 1,
              borderRadius: 1.5,
              position: 'relative'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
            {uploading && (
              <CircularProgress 
                size={24} 
                sx={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px'
                }}
              />
            )}
          </Button>
        )}

        {uploadError && (
          <Alert severity="error" onClose={() => setUploadError('')}>
            {uploadError}
          </Alert>
        )}
        
        {uploadSuccess && (
          <Alert severity="success" onClose={() => setUploadSuccess(false)}>
            Documents uploaded successfully!
          </Alert>
        )}

        <Divider />

        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Show currently selected/uploaded files */}
          {selectedFiles.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                Selected Files
              </Typography>
              {selectedFiles.map((file) => (
                <ListItem
                  key={file.name}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    selected={activeFile === file.name}
                    onClick={() => setActiveFile(file.name)}
                    sx={{
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: customTheme.primary.lighter,
                        '&:hover': {
                          backgroundColor: customTheme.primary.light,
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <FileTypeIcon fileType={file.name.split('.').pop().toLowerCase()} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: { fontWeight: activeFile === file.name ? 500 : 400 }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file.name, e);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Show uploaded documents from the server */}
          {documents.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                Project Documents
              </Typography>
              {documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    selected={currentDocument?.id === doc.id}
                    onClick={() => fetchDocument(doc.id)}
                    sx={{
                      borderRadius: 1,
                      '&.Mui-selected': {
                        backgroundColor: customTheme.primary.lighter,
                        '&:hover': {
                          backgroundColor: customTheme.primary.light,
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <FileTypeIcon fileType={doc.filename ? doc.filename.split('.').pop().toLowerCase() : 'txt'} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={doc.title || doc.filename}
                      secondary={new Date(doc.created_at).toLocaleDateString()}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: { fontWeight: currentDocument?.id === doc.id ? 500 : 400 }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete document "${doc.title || doc.filename}"?`)) {
                          handleDeleteDocument(doc.id);
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                </ListItem>
              ))}
            </>
          )}

          {selectedFiles.length === 0 && documents.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                No files selected or uploaded
              </Typography>
            </Box>
          )}
        </List>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeFile ? (
          <>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#fff',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FileTypeIcon fileType={activeFile.split('.').pop().toLowerCase()} />
                <Box>
                  <Typography variant="h6">{activeFile}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {fileData[activeFile]?.tabularData?.length || 0} rows
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mr: 1 }}
                  onClick={() => {
                    if (selection && selection.text) {
                      handleCommentClick();
                    } else {
                      alert('Please select some text first to add a comment');
                    }
                  }}
                >
                  Add Comment
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setCodesModalOpen(true)}
                >
                  Assign Code
                </Button>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flexGrow: 1,
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'auto',
                position: 'relative',
                bgcolor: '#fff',
              }}
            >
              {processingFile ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 2,
                  }}
                >
                  <CircularProgress />
                  <Typography>Processing file...</Typography>
                </Box>
              ) : fileData[activeFile]?.error ? (
                <Alert severity="error">
                  {fileData[activeFile].error}
                </Alert>
              ) : (
                <>
                  {fileData[activeFile]?.tabularData && activeFile.endsWith('.pdf') && (
                    <Box sx={{ p: 2 }}>
                      {fileData[activeFile].tabularData.map((pageData, pageIdx) => (
                        <Box key={pageIdx} sx={{ mb: 4 }}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                            {pageData[0]}
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              backgroundColor: theme.palette.grey[50],
                              borderRadius: 1,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {pageData[1]}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {fileData[activeFile]?.tabularData && !activeFile.endsWith('.pdf') && !activeFile.endsWith('.txt') && (
                    <TableContainer sx={{ maxHeight: 600, maxWidth: '100%', overflow: 'auto' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            {fileData[activeFile].tabularData[0].map((header, idx) => (
                              <TableCell
                                key={idx}
                                sx={{
                                  fontWeight: 'bold',
                                  backgroundColor: theme.palette.grey[50],
                                  position: 'sticky',
                                  top: 0,
                                  zIndex: 2,
                                  boxShadow: '0 2px 4px -2px rgba(0,0,0,0.12)',
                                  minWidth: 120,
                                  padding: '12px 16px',
                                }}
                              >
                                <Tooltip title={header} placement="top">
                                  <Typography variant="subtitle2">
                                    {header}
                                  </Typography>
                                </Tooltip>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {fileData[activeFile].tabularData.slice(1).map((row, rowIdx) => (
                            <TableRow key={rowIdx}>
                              {row.map((cell, cellIdx) => (
                                <TableCell
                                  key={cellIdx}
                                  sx={{
                                    userSelect: 'text',
                                    cursor: 'text',
                                    padding: '10px 16px',
                                    minWidth: 120,
                                  }}
                                >
                                  <Tooltip title={cell} placement="top">
                                    <Typography variant="body2">
                                      {cell}
                                    </Typography>
                                  </Tooltip>
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  {activeFile.endsWith('.txt') && (
                    <Box
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        p: 2,
                      }}
                    >
                      {documentText}
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 2,
              color: theme.palette.text.secondary,
            }}
          >
            <ArticleIcon sx={{ fontSize: 64, opacity: 0.5 }} />
            <Typography variant="h6">No file selected</Typography>
            <Typography variant="body2">
              Select a file from the list or upload a new one
            </Typography>
          </Box>
        )}
      </Box>

      {/* Comment Modal */}
      <Modal 
        open={commentModalOpen} 
        onClose={() => {
          setCommentModalOpen(false);
          setNewComment('');
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#fff',
          p: 4,
          borderRadius: 3,
          boxShadow: 24,
          minWidth: 400,
          maxWidth: 600,
          width: '90%'
        }}>
          <Typography variant="h6" gutterBottom>Add Comment</Typography>
          
          <Typography variant="subtitle1" gutterBottom>Selected Text:</Typography>
          <Paper sx={{
            p: 2,
            mb: 3,
            bgcolor: customTheme.primary.lighter,
            border: `1px solid ${customTheme.primary.light}`,
            borderRadius: 1,
          }}>
            <Typography>{selection?.text}</Typography>
          </Paper>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setCommentModalOpen(false);
                setNewComment('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
            >
              Save Comment
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Selection Bubble */}
      <Popover
        open={showBubble}
        anchorReference="anchorPosition"
        anchorPosition={bubbleAnchor}
        onClose={() => setShowBubble(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 1,
            display: 'flex',
            gap: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            bgcolor: '#fff',
          }
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={handleCommentClick}
          startIcon={<CommentOutlinedIcon />}
        >
          Comment
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleBubbleCodesClick}
          startIcon={<BookOutlinedIcon />}
        >
          Code
        </Button>
      </Popover>

      {/* Analysis Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: 'flex',
          gap: 2,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AnalyticsIcon />}
          onClick={handleAnalysisClick}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            boxShadow: 3,
            bgcolor: theme.palette.secondary.main,
            '&:hover': {
              bgcolor: theme.palette.secondary.dark,
            },
          }}
        >
          Analysis
        </Button>
      </Box>

      {/* Analysis Menu */}
      <Menu
        anchorEl={analysisAnchor}
        open={Boolean(analysisAnchor)}
        onClose={handleAnalysisClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            boxShadow: 3,
          },
        }}
      >
        <MenuItem 
          onClick={() => handleAnalysisOption('thematic')}
          sx={{ px: 3, py: 1.5 }}
        >
          <ListItemIcon>
            <AnalyticsIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Thematic Analysis" 
            secondary="Analyze themes across documents"
          />
        </MenuItem>
        <MenuItem 
          onClick={() => handleAnalysisOption('cross-segment')}
          sx={{ px: 3, py: 1.5 }}
        >
          <ListItemIcon>
            <AnalyticsIcon color="secondary" />
          </ListItemIcon>
          <ListItemText 
            primary="Cross Segment Analysis" 
            secondary="Compare segments across documents"
          />
        </MenuItem>
        <MenuItem 
          onClick={() => handleAnalysisOption('objectives')}
          sx={{ px: 3, py: 1.5 }}
        >
          <ListItemIcon>
            <AnalyticsIcon color="info" />
          </ListItemIcon>
          <ListItemText 
            primary="Research Objectives" 
            secondary="View and manage research goals"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Documents;
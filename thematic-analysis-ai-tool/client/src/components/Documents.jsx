import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
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
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { AnimatedCard, GlassPanel, GlowButton } from './StyledComponents';
import ThemeToggle from './ThemeToggle';
import { ThemeModeContext } from '../App';
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
const getCustomTheme = (theme) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    primary: {
      lighter: isDark ? alpha(theme.palette.primary.main, 0.2) : '#E3F2FD',
      light: isDark ? alpha(theme.palette.primary.main, 0.4) : '#90CAF9',
      main: theme.palette.primary.main,
      dark: theme.palette.primary.dark,
    },
    transitions: {
      buttonHover: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      cardHover: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  };
};

const DropzoneArea = styled(Box)(({ theme, isdragging }) => {
  const isDarkMode = theme.palette.mode === 'dark';
  const customColors = getCustomTheme(theme);
  
  return {
    border: '2px dashed',
    borderColor: isdragging === 'true' 
      ? theme.palette.primary.main 
      : isDarkMode ? theme.palette.grey[600] : theme.palette.grey[300],
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(6),
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isdragging === 'true' 
      ? (isDarkMode ? alpha(theme.palette.primary.main, 0.15) : customColors.primary.lighter)
      : (isDarkMode ? alpha(theme.palette.background.paper, 0.6) : theme.palette.grey[50]),
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
      backgroundColor: isDarkMode 
        ? alpha(theme.palette.primary.main, 0.15) 
        : customColors.primary.lighter,
      boxShadow: isDarkMode 
        ? `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}` 
        : 'none',
    },
  };
});

const FileTypeIcon = ({ fileType }) => {
  const theme = useTheme();
  const iconProps = { 
    sx: { 
      fontSize: 40, 
      color: theme.palette.primary.main,
      filter: theme.palette.mode === 'dark' ? 'drop-shadow(0 0 3px rgba(255,255,255,0.2))' : 'none',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.05)'
      }
    } 
  };
  
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
  refreshSidebar, // New prop to trigger sidebar refresh when documents change
  selectedDocumentId, // New prop to handle document selection from navigation
  setSelectedDocumentId // New prop to clear selection after processing
}) {  const theme = useTheme();
  // Get mode directly from theme to avoid potential context issues
  const mode = theme.palette.mode;
  const themeCustom = useMemo(() => getCustomTheme(theme), [theme]);
  
  // Enhanced button style - used throughout component
  const enhancedButtonStyle = {
    transition: themeCustom.transitions.buttonHover,
    borderRadius: theme.shape.borderRadius * 1.2,
    boxShadow: theme.palette.mode === 'dark'
      ? `0 2px 8px ${alpha(theme.palette.common.black, 0.25)}`
      : `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.palette.mode === 'dark'
        ? `0 4px 12px ${alpha(theme.palette.common.black, 0.35)}`
        : `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
    },
    '&:active': {
      transform: 'translateY(1px)',
    }
  };
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

  // Handle selected document from navigation
  useEffect(() => {
    if (selectedDocumentId && setSelectedDocumentId) {
      fetchDocument(selectedDocumentId);
      // Clear the selection after processing
      setSelectedDocumentId(null);
    }
  }, [selectedDocumentId, setSelectedDocumentId]);

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
  };  const handleNewFiles = (files) => {
    if (!files || !files.length) {
      console.warn('No files provided to handleNewFiles');
      return;
    }
    
    console.log(`Processing ${files.length} new files`);
    
    const newFiles = [...selectedFiles];
    const newFileData = { ...fileData };
    
    // Store uploaded files in a global cache for potential access later
    if (!window.uploadedFiles) window.uploadedFiles = [];
    
    files.forEach(file => {
      if (!file || !file.name) {
        console.warn('Invalid file object:', file);
        return;
      }
      
      // Check if we already have this file
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        // Add to selectedFiles
        newFiles.push(file);
        
        // Add to global cache
        if (!window.uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
          window.uploadedFiles.push(file);
        }
        
        // Process each file immediately to extract content
        processFile(file);
        
        // Also update any documents that might reference this file by name
        const documentsToUpdate = documents.filter(
          doc => (doc.filename === file.name || doc.title === file.name) && !doc.fileObject
        );
        
        if (documentsToUpdate.length > 0) {
          console.log(`Updating ${documentsToUpdate.length} documents with file object for ${file.name}`);
          const updatedDocs = documents.map(doc => {
            if (doc.filename === file.name || doc.title === file.name) {
              return {...doc, fileObject: file};
            }
            return doc;
          });
          
          if (typeof setDocuments === 'function') {
            setDocuments(updatedDocs);
          }
        } else {
          // No existing document references this file - we might need to create one
          console.log('No matching document found for file:', file.name);
          
          // For now, we just log this - document creation would happen in handleBulkUpload
        }
      } else {
        console.log(`File ${file.name} already exists in selectedFiles, skipping`);
      }
    });
    
    // Update selectedFiles state
    setSelectedFiles(newFiles);
    
    // If we don't have an active file yet but we have files, set the first one active
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
    // Check if the file object is valid before proceeding
    if (!file || typeof file !== 'object') {
      console.error('Invalid file object:', file);
      setFileData(prev => ({
        ...prev,
        ['unknown_file']: { tabularData: null, error: 'Invalid file object' }
      }));
      setProcessingFile(false);
      return;
    }
    
    // Safely get the filename and extension
    const fileName = file.name || (file.filename || 'unknown_file');
    const fileExtensionMatch = fileName.split('.');
    const fileExtension = fileExtensionMatch.length > 1 
      ? fileExtensionMatch.pop().toLowerCase() 
      : '';
    
    console.log(`Processing file: ${fileName}, type: ${fileExtension}`);
    setProcessingFile(true);
    
    // Continue only if we have a valid file object with proper methods
    if (!file.arrayBuffer && !file.text) {
      console.error('File object is missing required methods:', file);
      setFileData(prev => ({
        ...prev,
        [fileName]: { tabularData: null, error: 'Invalid file object (missing read methods)' }
      }));
      setProcessingFile(false);
      return;
    }

    const reader = new FileReader();
    
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
            // Set document text for CSV content (for text selection)
            setDocumentText(text);
          } else {
            throw new Error('No valid data found in CSV file');
          }
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Check if workbook has sheets before proceeding
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('Excel file does not contain any sheets');
            }
            
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!firstSheet) {
              throw new Error('Could not access the first sheet in the Excel file');
            }
            
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            if (rows && rows.length > 0) {
              tabularData = rows;
              // Convert Excel data to text format for text selection
              // Make sure we handle null/undefined values
              const textContent = rows.map(row => 
                (row || []).map(cell => (cell !== null && cell !== undefined) ? cell.toString() : '').join('\t')
              ).join('\n');
              setDocumentText(textContent);
            } else {
              throw new Error('No valid data found in Excel file');
            }
          } catch (excelError) {
            console.error('Excel processing error:', excelError);
            throw new Error(`Error processing Excel file: ${excelError.message}`);
          }
        } else if (['txt'].includes(fileExtension)) {
          const text = e.target.result;
          setDocumentText(text);
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          tabularData = lines.map((line, index) => [index + 1, line]);
        } else if (fileExtension === 'pdf') {
          try {
            const arrayBuffer = e.target.result;
            const pdf = await getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const textContent = [];
            let fullText = '';
            
            for (let i = 1; i <= numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = content.items.map(item => item.str).join(' ');
              textContent.push([`Page ${i}`, pageText]);
              fullText += `Page ${i}: ${pageText}\n\n`;
            }
            
            tabularData = textContent;
            setDocumentText(fullText); // Set the full PDF text for text selection
          } catch (pdfError) {
            throw new Error(`Error processing PDF: ${pdfError.message}`);
          }
        } else {
          error = 'Unsupported file type. Please upload a CSV, Excel, PDF, or text file.';
        }

        setFileData(prev => ({
          ...prev,
          [fileName]: { tabularData, error }
        }));
      } catch (error) {
        console.error('Error processing file:', error);
        setFileData(prev => ({
          ...prev,
          [fileName]: { tabularData: null, error: error.message }
        }));
      } finally {
        setProcessingFile(false);
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      setFileData(prev => ({
        ...prev,
        [fileName]: { tabularData: null, error: 'Error reading file' }
      }));
      setProcessingFile(false);
    };

    try {
      if (['csv', 'txt'].includes(fileExtension)) {
        reader.readAsText(file);
      } else if (['xlsx', 'xls', 'pdf'].includes(fileExtension)) {
        reader.readAsArrayBuffer(file);
      } else {
        setFileData(prev => ({
          ...prev,
          [fileName]: { tabularData: null, error: 'Unsupported file type' }
        }));
        setProcessingFile(false);
      }
    } catch (error) {
      console.error('Error starting file read:', error);
      setFileData(prev => ({
        ...prev,
        [fileName]: { tabularData: null, error: `Error reading file: ${error.message}` }
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
  };  const handleBulkUpload = async (event) => {
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
      
      // Give a small delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Process each file immediately to extract its content
      Array.from(files).forEach(file => {
        processFile(file);
      });
      
      // Create documents from the files and store actual file objects
      const newDocuments = Array.from(files).map((file, index) => {
        // Create a cloned file object that can be serialized and persisted
        // We need to do this because File objects can't be directly stored in state
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          // Store the actual file object as a property - this won't be serialized
          _file: file
        };
        
        return {
          id: `doc-${Date.now()}-${index}`,
          project_id: projectId,
          title: file.name,
          filename: file.name,
          content: `Content for ${file.name}`, // Placeholder - real content already processed
          created_at: new Date().toISOString(),
          fileObject: fileData // Store file metadata and reference
        };
      });
      
      // Add these to our existing documents
      const updatedDocuments = [...documents, ...newDocuments];
      setDocuments(updatedDocuments);
      
      // Also update parent component's state if the setter is provided
      if (typeof setDocuments === 'function') {
        setDocuments(updatedDocuments);
      }
      
      // Call handleNewFiles to also process files and save in selectedFiles
      handleNewFiles(Array.from(files));
      
      // Refresh sidebar if needed
      if (refreshSidebar) {
        refreshSidebar();
      }
      
    } catch (err) {
      setUploadError('Failed to upload files');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };const fetchDocument = async (documentId) => {
    try {
      console.log('Fetching document with ID:', documentId);
      
      // Find the document in our local state
      const document = documents.find(doc => doc.id === documentId);
      
      if (!document) {
        console.error('Document not found with ID:', documentId);
        setCurrentDocument(null);
        return;
      }
      
      setCurrentDocument(document);
      
      // Set this document as the active file for parsing and display
      const fileName = document.filename || document.title;
      setActiveFile(fileName);
      
      // Always try to find the matching selectedFile by name
      const matchingFile = selectedFiles.find(f => f.name === fileName);
      
      if (matchingFile && !document.fileObject) {
        // If we have the actual file in selectedFiles but not in the document,
        // add it to the document and update the documents array
        document.fileObject = matchingFile;
        console.log('Added matching file to document from selectedFiles');
        
        // Also update the documents array so this change persists
        setDocuments(documents.map(doc => {
          if (doc.id === documentId) {
            return {...doc, fileObject: matchingFile};
          }
          return doc;
        }));
      }
      
      // Process the document content for display
      await processDocumentContent(document);
      
    } catch (err) {
      console.error("Error fetching document:", err);
      setCurrentDocument(null);
    }
  };// Function to process document content for display
  const processDocumentContent = async (document) => {
    try {
      if (!document) {
        console.error('No document provided to processDocumentContent');
        setProcessingFile(false);
        return;
      }
      
      setProcessingFile(true);
      
      // Safely extract file name and extension
      const fileName = document.filename || document.title || 'Unknown Document';
      let fileExtension = '';
      if (fileName.includes('.')) {
        fileExtension = fileName.split('.').pop().toLowerCase();
      }
      
      console.log('Processing document:', fileName, 'has fileObject:', !!document.fileObject);
      
      // Check if we already have processed data for this file
      if (fileData[fileName]) {
        console.log('File data already exists for:', fileName);
        setProcessingFile(false);
        return;
      }
      
      // If we have a file object stored in the document, use it
      if (document.fileObject) {
        console.log('Document has fileObject, processing real file content');
        
        // Extract the file object - handle different storage formats
        let file = null;
        
        if (document.fileObject instanceof File) {
          // It's a direct File object
          file = document.fileObject;
        } else if (document.fileObject._file && document.fileObject._file instanceof File) {
          // It's our custom fileData format with nested File object
          file = document.fileObject._file;
        } else if (typeof document.fileObject === 'object' && document.fileObject.name) {
          // It's a file-like object
          file = document.fileObject;
        }
        
        if (file) {
          console.log('Valid file object found, using processFile');
          // Use our existing processFile function
          processFile(file);
          return;
        } else {
          console.warn('Invalid file object format:', document.fileObject);
        }
      }
      
      // If no file object but the file exists in selectedFiles, use that
      const existingFile = selectedFiles.find(f => f.name === fileName);
      if (existingFile) {
        console.log('Found matching file in selectedFiles');
        processFile(existingFile);
        return;
      }
      
      // Search for file in the uploaded files that might match by name
      const allFiles = document.uploaderFiles || window.uploadedFiles || [];
      const matchingFile = allFiles.find(f => f.name === fileName);
      if (matchingFile) {
        console.log('Found matching file in uploaded files cache');
        processFile(matchingFile);
        return;
      }
      
      // Fallback: If it's a document from navigation that doesn't have file object,
      // show a message that content is not available for parsing
      let textContent = `Document: ${fileName}\n\nThis document was uploaded but the original file content is not available for parsing.\n\nTo view and analyze the actual content, please re-upload the file using the file upload feature.`;
      
      // Set basic data structure
      const lines = textContent.split('\n').filter(line => line.trim() !== '');
      const tabularData = lines.map((line, index) => [index + 1, line]);
      
      // Set the document text for text selection and annotation
      setDocumentText(textContent);
      
      // Store the processed data
      setFileData(prev => ({
        ...prev,
        [fileName]: { tabularData, error: null }
      }));

    } catch (error) {
      console.error('Error processing document:', error);
      const documentName = document && (document.filename || document.title || 'Unknown Document');
      setFileData(prev => ({
        ...prev,
        [documentName]: { tabularData: null, error: error.message }
      }));
    } finally {
      setProcessingFile(false);
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
    <Box sx={{ 
      display: 'flex', 
      height: '100%', 
      gap: 3, 
      position: 'relative',
      transition: 'all 0.3s ease',
    }}>
      {/* Left Sidebar - File List */}      <Paper
        elevation={mode === 'dark' ? 3 : 0}
        sx={{
          width: 300,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark' 
            ? `0 4px 20px ${alpha(theme.palette.common.black, 0.3)}`
            : `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          transition: themeCustom.transitions.cardHover,
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark' 
              ? `0 5px 25px ${alpha(theme.palette.common.black, 0.4)}`
              : `0 5px 25px ${alpha(theme.palette.common.black, 0.1)}`,
          },
          animation: 'fadeIn 0.6s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
              transform: 'translateX(-10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateX(0)'
            }
          }
        }}
        >        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          px: 1
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '30px',
              height: '2px',
              backgroundColor: theme.palette.primary.main,
              borderRadius: '2px'
            }
          }}>
            Files
          </Typography>
          
          <Chip 
            label={`${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
            size="small"
            color="primary"
            variant={theme.palette.mode === 'dark' ? 'outlined' : 'filled'}
            sx={{ 
              borderRadius: '14px',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </Box>
        
        <DropzoneArea
          isdragging={isDragging.toString()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
          sx={{
            minHeight: '140px',
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' },
              '50%': { boxShadow: '0 0 0 5px rgba(33, 150, 243, 0.1)' },
              '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
            }
          }}
        >
          <input
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".txt,.pdf,.csv,.xlsx,.xls"
          />
          <CloudUploadIcon sx={{ 
            fontSize: 48, 
            color: theme.palette.primary.main,
            filter: theme.palette.mode === 'dark' 
              ? 'drop-shadow(0 0 5px rgba(33, 150, 243, 0.5))'
              : 'none',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-3px)'
            }
          }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Drag & drop files here
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supports: TXT, PDF, CSV, XLSX
          </Typography>
        </DropzoneArea>

        {fileError && (
          <Alert severity="error" onClose={() => setFileError(null)}>
            {fileError}
          </Alert>
        )}

        {/* Upload button that appears when files are selected */}
        {selectedFiles.length > 0 && (          <GlowButton
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
                  const snackMessage = `Successfully uploaded ${selectedFiles.length} documents`;
                // Use Snackbar instead of alert for a more modern UI experience
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
              position: 'relative',
              ...enhancedButtonStyle,
              fontWeight: 500,
              py: 1,
              boxShadow: theme.palette.mode === 'dark' 
                ? `0 0 15px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 4px 10px ${alpha(theme.palette.primary.main, 0.25)}`,
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
                  marginLeft: '-12px',
                  color: theme.palette.mode === 'dark' ? theme.palette.common.white : undefined
                }}              />
            )}
          </GlowButton>
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
                >                  <ListItemButton
                    selected={activeFile === file.name}
                    onClick={() => setActiveFile(file.name)}
                    sx={{
                      borderRadius: 1.5,
                      transition: 'all 0.2s ease-in-out',
                      border: activeFile === file.name ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                      boxShadow: activeFile === file.name 
                        ? (theme.palette.mode === 'dark' 
                            ? `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`
                            : '0 2px 8px rgba(0,0,0,0.08)')
                        : 'none',
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.15)
                          : themeCustom.primary.lighter,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.25)
                            : themeCustom.primary.light,
                        },
                      },
                      '&:hover': {
                        transform: 'translateX(3px)',
                      }
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
                    />                    <Tooltip title="Remove file">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(file.name, e);
                        }}
                        sx={{
                          color: theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.8) : theme.palette.error.main,
                          opacity: 0.7,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            opacity: 1,
                            transform: 'scale(1.1)',
                            color: theme.palette.error.main,
                            backgroundColor: theme.palette.mode === 'dark' 
                              ? alpha(theme.palette.error.main, 0.15)
                              : alpha(theme.palette.error.main, 0.1)
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                      borderRadius: 1,                      '&.Mui-selected': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? alpha(theme.palette.primary.main, 0.15)
                          : themeCustom.primary.lighter,
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.25)
                            : themeCustom.primary.light,
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

      {/* Main Content Area */}      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            '0%': {
              opacity: 0,
            },
            '100%': {
              opacity: 1,
            }
          }
        }}
      >
        {activeFile ? (
          <>
            <AnimatedCard
              elevation={theme.palette.mode === 'dark' ? 3 : 0}
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: theme.palette.background.paper,
                overflow: 'visible',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FileTypeIcon fileType={activeFile.split('.').pop().toLowerCase()} />
                <Box>                  <Typography variant="h6">{activeFile}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {fileData[activeFile]?.tabularData?.length || 0} rows
                    {currentDocument && ` • Document ID: ${currentDocument.id}`}
                  </Typography>
                </Box>
              </Box>
              <Box>                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CommentOutlinedIcon />}
                  sx={{ 
                    mr: 1,
                    ...enhancedButtonStyle,
                    borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.5) : undefined,
                    '&:hover': {
                      ...enhancedButtonStyle['&:hover'],
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                  onClick={() => {
                    if (selection && selection.text) {
                      handleCommentClick();
                    } else {
                      alert('Please select some text first to add a comment');
                    }
                  }}
                >
                  Add Comment
                </Button>                <Button
                  variant="contained"
                  size="small"
                  startIcon={<BookOutlinedIcon />}
                  onClick={() => setCodesModalOpen(true)}
                  sx={{
                    ...enhancedButtonStyle,
                    boxShadow: theme.palette.mode === 'dark' 
                      ? `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`
                      : `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                  }}
                >
                  Assign Code</Button>
              </Box>
            </AnimatedCard>            <GlassPanel
              sx={{
                flexGrow: 1,
                p: 3,
                overflow: 'auto',
                position: 'relative',
                transition: 'all 0.3s ease',
                boxShadow: theme.palette.mode === 'dark' 
                  ? `0 5px 20px ${alpha(theme.palette.common.black, 0.3)}`
                  : `0 5px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                animation: 'fadeInUp 0.5s ease-in-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
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
                  )}                  {(activeFile.endsWith('.txt') || documentText) && (
                    <Box
                      sx={{
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        p: 2,
                      }}
                    >
                      {documentText || 'Loading document content...'}
                    </Box>
                  )}

                  {/* Show message for documents from navigation */}
                  {currentDocument && !fileData[activeFile] && !processingFile && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '200px',
                        gap: 2,
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <CircularProgress />
                      <Typography>Loading document content...</Typography>
                    </Box>
                  )}                </>
              )}
            </GlassPanel>
          </>
        ) : (          <GlassPanel
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 3,
              color: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.7) : theme.palette.text.secondary,
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' },
                '50%': { boxShadow: '0 0 0 8px rgba(33, 150, 243, 0.1)' },
                '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
              }
            }}
          >
            <ArticleIcon sx={{ 
              fontSize: 80, 
              opacity: 0.6,
              color: theme.palette.primary.main,
              filter: theme.palette.mode === 'dark' 
                ? 'drop-shadow(0 0 8px rgba(97, 175, 254, 0.5))'
                : 'none',
            }} />
            <Typography variant="h5" sx={{ fontWeight: 500 }}>No file selected</Typography>
            <Typography variant="body2" align="center" sx={{ maxWidth: '80%' }}>
              Select a file from the list or upload a new document to begin your analysis
            </Typography>
            <Button 
              variant="outlined"
              onClick={() => document.getElementById('file-input').click()}
              startIcon={<CloudUploadIcon />}
              sx={{
                mt: 2,
                ...enhancedButtonStyle,
                borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.5) : undefined,
              }}
            >
              Upload Documents
            </Button>
          </GlassPanel>
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
            mb: 3,            bgcolor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.main, 0.15)
              : themeCustom.primary.lighter,
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? alpha(theme.palette.primary.main, 0.4)
              : themeCustom.primary.light}`,
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
        </MenuItem>      </Menu>
      
      {/* Success notification */}
      <Snackbar
        open={uploadSuccess}
        autoHideDuration={4000}
        onClose={() => setUploadSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={() => setUploadSuccess(false)} 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '10px',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem'
            }
          }}
        >
          Documents uploaded successfully!
        </Alert>
      </Snackbar>
      
      {/* Error notification */}
      <Snackbar
        open={!!uploadError}
        autoHideDuration={6000}
        onClose={() => setUploadError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={() => setUploadError('')} 
          severity="error" 
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(0,0,0,0.15)',
            borderRadius: '10px'
          }}
        >
          {uploadError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Documents;
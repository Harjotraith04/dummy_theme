import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import ProjectSettings from '../components/ProjectSettings';
import ResearchDetails from '../components/ResearchDetails';
import Comments from '../components/Comments';
import Codebook from '../components/Codebook';
import CodeModals from '../components/CodeModals';
import OptionsBar from '../components/OptionsBar';
import Navigation from '../components/Navigation';
import Documents from '../components/Documents';
import VisualizationDashboard from '../components/VisualizationDashboard';
import '../components/VisualizationDashboard.css';

function Dashboard() {
  const theme = useTheme();
  const { projectId } = useParams();
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [selectedAIModel, setSelectedAIModel] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [activeMenuItem, setActiveMenuItem] = useState('Documents');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [selection, setSelection] = useState(null);
  const [bubbleAnchor, setBubbleAnchor] = useState(null);
  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [codes, setCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [pendingCodeSelection, setPendingCodeSelection] = useState(null);
  const [createCodeDialogOpen, setCreateCodeDialogOpen] = useState(false);
  const [newCodeFields, setNewCodeFields] = useState({
    name: '',
    definition: '',
    description: '',
    category: '',
    color: ''  });

  // State for documents uploaded - start with empty array
  const [documents, setDocuments] = useState([]);

  // Add state for comments and code assignments
  const [commentData, setCommentData] = useState([]);
  const [codeAssignments, setCodeAssignments] = useState([]);

  // State to track selected document for processing
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const handleMenuItemClick = (menuItem) => {
    setActiveMenuItem(menuItem);
  };

  const handleBubbleCodesClick = () => {
    setPendingCodeSelection(selection);
    setCodesModalOpen(true);
  };

  const handleRemoveFile = (fileName, event) => {
    event.stopPropagation();
    const newFiles = selectedFiles.filter(f => f.name !== fileName);
    setSelectedFiles(newFiles);
    
    if (activeFile === fileName) {
      setActiveFile(newFiles.length > 0 ? newFiles[0].name : null);
    }
  };

  // Handle document selection from navigation
  const handleDocumentSelect = (documentId) => {
    // Ensure we're on the Documents page
    setActiveMenuItem('Documents');
    
    // Set the selected document ID which will be picked up by Documents component
    setSelectedDocumentId(documentId);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >      <Navigation
        activeMenuItem={activeMenuItem}
        handleMenuItemClick={handleMenuItemClick}
        selectedFiles={selectedFiles}
        documents={documents}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        handleRemoveFile={handleRemoveFile}
        onDocumentSelect={handleDocumentSelect}
      />

      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 3,
          gap: 3,
        }}
      >
        {/* Header Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            bgcolor: theme.palette.primary.main,
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" fontWeight="500">
            {activeMenuItem}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            {activeMenuItem === 'Research details' && 'Configure your research parameters and AI models'}
            {activeMenuItem === 'Documents' && 'Upload and analyze your research documents'}
            {activeMenuItem === 'Comments' && 'View and manage your document annotations'}
            {activeMenuItem === 'Codebook' && 'Organize and structure your research codes'}
            {activeMenuItem === 'Visualizations' && 'Explore your thematic analysis through various visualizations'}
          </Typography>
        </Paper>

        {/* Main Content Area */}
        <Paper 
          sx={{ 
            flexGrow: 1,
            p: 3,
            borderRadius: 2,
            bgcolor: 'white',
            boxShadow: theme.shadows[2],
            position: 'relative',
            overflow: 'hidden',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: theme.palette.primary.main,
              opacity: 0.6,
            }
          }}
        >
          {activeMenuItem === 'Research details' && (
            <ResearchDetails
              projectId={projectId}
              selectedAnalysis={selectedAnalysis}
              setSelectedAnalysis={setSelectedAnalysis}
              selectedAIModel={selectedAIModel}
              setSelectedAIModel={setSelectedAIModel}
              openaiApiKey={openaiApiKey}
              setOpenaiApiKey={setOpenaiApiKey}
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              groqApiKey={groqApiKey}
              setGroqApiKey={setGroqApiKey}
              claudeApiKey={claudeApiKey}
              setClaudeApiKey={setClaudeApiKey}
            />
          )}          {activeMenuItem === 'Documents' && (
            <Documents
              projectId={projectId}
              setCodesModalOpen={setCodesModalOpen}
              selection={selection}
              setSelection={setSelection}
              bubbleAnchor={bubbleAnchor}
              setBubbleAnchor={setBubbleAnchor}
              handleBubbleCodesClick={handleBubbleCodesClick}
              setPendingCodeSelection={setPendingCodeSelection}
              commentData={commentData}
              setCommentData={setCommentData}
              codeAssignments={codeAssignments}
              setCodeAssignments={setCodeAssignments}
              documents={documents}
              setDocuments={setDocuments}
              refreshSidebar={() => {}}
              selectedDocumentId={selectedDocumentId}
              setSelectedDocumentId={setSelectedDocumentId}
            />
          )}

          {activeMenuItem === 'Comments' && (
            <Box sx={{ height: '100%', position: 'relative' }}>
              <Comments commentData={commentData} />
            </Box>
          )}

          {activeMenuItem === 'Codebook' && (
            <Box sx={{ height: '100%', position: 'relative' }}>
              <Codebook codeAssignments={codeAssignments} />
            </Box>
          )}

          {activeMenuItem === 'Visualizations' && (
            <Box sx={{ height: '100%', position: 'relative' }}>
              <VisualizationDashboard data={codeAssignments} />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Code Modals */}
      <CodeModals
        codesModalOpen={codesModalOpen}
        setCodesModalOpen={setCodesModalOpen}
        selectedCode={selectedCode}
        setSelectedCode={setSelectedCode}
        codes={codes}
        createCodeDialogOpen={createCodeDialogOpen}
        setCreateCodeDialogOpen={setCreateCodeDialogOpen}
        newCodeFields={newCodeFields}
        setNewCodeFields={setNewCodeFields}
        setCodes={setCodes}
        pendingCodeSelection={pendingCodeSelection}
        setPendingCodeSelection={setPendingCodeSelection}
        codeAssignments={codeAssignments}
        setCodeAssignments={setCodeAssignments}
      />
    </Box>
  );
}

export default Dashboard;
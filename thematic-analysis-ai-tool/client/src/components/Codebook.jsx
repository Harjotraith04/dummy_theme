import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

function Codebook({ codeAssignments }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" gutterBottom>Code Assignments</Typography>
      
      {codeAssignments.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No code assignments yet. Select text in a document and use the Codes button to assign codes.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Selected Text</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Context</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codeAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.documentName}</TableCell>
                  <TableCell>{assignment.selectedText}</TableCell>
                  <TableCell>{assignment.code}</TableCell>
                  <TableCell>{assignment.context}</TableCell>
                  <TableCell>{assignment.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Codebook; 
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

function Comments({ commentData }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" gutterBottom>Comments</Typography>
      
      {commentData.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No comments yet. Select text in a document and click the Comment button to add comments.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document</TableCell>
                <TableCell>Selected Text</TableCell>
                <TableCell>Comment</TableCell>
                <TableCell>Context</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commentData.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>{comment.documentName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      backgroundColor: '#fff3cd',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {comment.selectedText}
                    </Typography>
                  </TableCell>
                  <TableCell>{comment.comment}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      ...{comment.pageContext}...
                    </Typography>
                  </TableCell>
                  <TableCell>{comment.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default Comments; 
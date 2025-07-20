import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { documentAPI } from '../services/api';
import { Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';

const Profile = () => {
  const { user } = useAuth();
  const [uploadCount, setUploadCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setError('');
      try {
        let res;
        if (user?.role === 'admin') {
          res = await documentAPI.getDocuments();
        } else {
          res = await documentAPI.getMyDocuments();
        }
        setUploadCount(res.data.length);
      } catch (err) {
        setError('Failed to fetch uploads.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUploads();
  }, [user]);

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Alert severity="error">You must be logged in to view your profile.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Profile
          </Typography>
          <Typography variant="body1"><b>Name:</b> {user.name}</Typography>
          <Typography variant="body1"><b>Email:</b> {user.email}</Typography>
          <Typography variant="body1"><b>Role:</b> {user.role}</Typography>
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <Typography variant="body1"><b>Uploaded Documents:</b> {uploadCount}</Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 
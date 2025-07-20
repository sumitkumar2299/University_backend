import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Container, Typography, Box, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';

const ApplicationStatus = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // pending, approved, rejected
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    setError('');
    setStatus(null);
    setNotFound(false);
    setLoading(true);
    try {
      const res = await authAPI.applicationStatus(email);
      // Use only res.data.status for clarity
      const userStatus = res?.data?.status;
      if (userStatus) {
        setStatus(userStatus);
      } else if (res?.data?.message === 'User not found') {
        setNotFound(true);
      } else {
        setError('No status found for this user.');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.message || 'Could not fetch status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'info';
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Check Application Status
          </Typography>
          <Box component="form" onSubmit={handleCheckStatus} sx={{ mt: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Check Status'}
            </Button>
          </Box>
          {status && (
            <Alert severity={getStatusColor(status)} sx={{ mt: 3 }}>
              {status === 'pending' && 'Your application is pending. Please wait for admin approval.'}
              {status === 'approved' && 'Congratulations! Your application is approved. You can now log in.'}
              {status === 'rejected' && 'Sorry, your application was rejected. Please contact admin for more info.'}
            </Alert>
          )}
          {notFound && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No user found with this email address.
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ApplicationStatus; 
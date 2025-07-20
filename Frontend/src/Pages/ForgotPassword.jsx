import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Container, Typography, Box, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email);
      setSuccess(res.message || res.data.message || 'Password reset email sent!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Forgot Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
          </Box>
          {success && (
            <Alert severity="success" sx={{ mt: 3 }}>{success}</Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 